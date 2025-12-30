// dashboard-app.js
const BACKEND_URL = "http://127.0.0.1:8000";

async function sendControl(action, userId) {
  console.log("[CONTROL] sending:", action, "user_id:", userId);

  const res = await fetch(`${BACKEND_URL}/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      user_id: userId
    })
  });

  return await res.json();
}

function DashboardApp() {
  const [user, setUser] = React.useState(null);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [detectionActive, setDetectionActive] = React.useState(false);
  const [apiStatus, setApiStatus] = React.useState("Siap");
  const [fireDetected, setFireDetected] = React.useState(false);
  const [totalDetections, setTotalDetections] = React.useState(0);
  const [alerts, setAlerts] = React.useState([]);

  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const detectionAPIRef = React.useRef(null);

  // ===============================
  // AUTH INIT (PENTING)
  // ===============================
  React.useEffect(() => {
    async function init() {
      console.log("[AUTH] checking session...");
      const u = await getCurrentUser();
      console.log("[AUTH] session result:", u);

      if (!u || !u.id) {
        window.location.href = "index.html";
        return;
      }

      setUser(u);
    }
    init();

    return () => stopCamera();
  }, []);

  // ===============================
  // CAMERA
  // ===============================
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    await videoRef.current.play();

    setCameraActive(true);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    stopDetection();
  };

  // ===============================
  // DETECTION
  // ===============================
  const startDetection = async () => {
    console.log("[START DETECTION] user:", user);

    if (!user || !user.id) {
      alert("User belum siap");
      return;
    }

    if (!cameraActive) {
      await startCamera();
    }

    const ctrl = await sendControl("start", user.id);
    console.log("[CONTROL RESPONSE]", ctrl);

    if (!ctrl.active) {
      alert("Backend gagal aktif");
      return;
    }

    setDetectionActive(true);
    setApiStatus("Berjalan");

    detectionAPIRef.current = initFireDetectionAPI(
      videoRef.current,
      handleDetectionResult
    );

    detectionAPIRef.current.start();
  };

  const stopDetection = async () => {
    if (user) await sendControl("stop", user.id);

    if (detectionAPIRef.current) {
      detectionAPIRef.current.stop();
      detectionAPIRef.current = null;
    }

    setDetectionActive(false);
    setApiStatus("Siap");
  };

  // ===============================
  // HANDLE RESULT
  // ===============================
  const handleDetectionResult = (result) => {
  console.log("DETECTION RESULT:", result);

  if (result.fire === true) {
    setFireDetected(true);
    setTotalDetections(prev => prev + 1);

    setAlerts(prev => [
      {
        id: Date.now(),
        message: `🔥 Api terdeteksi (confidence ${result.confidence.toFixed(2)})`
      },
      ...prev
    ].slice(0, 5));
  } else {
    setFireDetected(false);
  }
};


  if (!user) {
    return <div className="text-white p-10">Loading user...</div>;
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4 flex justify-between">
        <b>🔥 Fire Detection</b>
        <button onClick={logout} className="bg-red-600 px-4 py-1 rounded">
          Logout
        </button>
      </nav>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 p-4 rounded">
          <button
            onClick={detectionActive ? stopDetection : startDetection}
            className="bg-red-600 px-4 py-2 rounded mb-4"
          >
            {detectionActive ? "Stop Deteksi" : "Mulai Deteksi"}
          </button>

          <div className="bg-black aspect-video rounded overflow-hidden">
            <video
              ref={videoRef}
              muted
              autoPlay
              playsInline
              className={cameraActive ? "w-full h-full object-cover" : "hidden"}
            />
            {!cameraActive && (
              <div className="flex items-center justify-center h-full text-gray-400">
                Kamera belum aktif
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <p>Status API: <b>{apiStatus}</b></p>
          <p>Api: <b>{fireDetected ? "🔥 YA" : "Tidak"}</b></p>
          <p>Total: <b>{totalDetections}</b></p>

          <hr className="my-2 border-gray-600" />

          <b>Alert</b>
          {alerts.map(a => (
            <div key={a.id} className="text-orange-400 text-sm">
              {a.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root"))
  .render(<DashboardApp />);
