// dashboard-app.js

const BACKEND_URL = "http://127.0.0.1:8000";

// ===============================
// Backend Control
// ===============================
async function sendControl(action) {
  try {
    const res = await fetch(`${BACKEND_URL}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });

    if (!res.ok) throw new Error("Control API failed");

    const data = await res.json();
    console.log("CONTROL:", data);
    return data;

  } catch (err) {
    console.error("Control API error:", err);
    return null;
  }
}

function DashboardApp() {
  const [user, setUser] = React.useState(null);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [detectionActive, setDetectionActive] = React.useState(false);
  const [apiStatus, setApiStatus] = React.useState("Siap");
  const [fireDetected, setFireDetected] = React.useState(false);
  const [totalDetections, setTotalDetections] = React.useState(0);
  const [alerts, setAlerts] = React.useState([]);
  const [selectedLocation, setSelectedLocation] = React.useState("ruang-tamu");

  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const detectionAPIRef = React.useRef(null);

  // ===============================
  // Auth check
  // ===============================
  React.useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = "index.html";
    } else {
      setUser(currentUser);
    }

    return () => {
      stopCamera();
    };
  }, []);

  // ===============================
  // Camera
  // ===============================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Tidak dapat mengakses kamera");
    }
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
  // Detection
  // ===============================
  const startDetection = async () => {
    if (!cameraActive) {
      await startCamera();
    }

    const ctrl = await sendControl("start");
    if (!ctrl || !ctrl.active) {
      alert("Backend belum aktif");
      return;
    }

    setDetectionActive(true);
    setApiStatus("Berjalan");

    detectionAPIRef.current = initFireDetectionAPI(
      videoRef.current,   // 🔥 FIX PENTING
      handleDetectionResult
    );

    detectionAPIRef.current.start();
  };

  const stopDetection = async () => {
    await sendControl("stop");

    if (detectionAPIRef.current) {
      detectionAPIRef.current.stop();
      detectionAPIRef.current = null;
    }

    setDetectionActive(false);
    setApiStatus("Siap");
  };

  // ===============================
  // Handle result
  // ===============================
  const handleDetectionResult = (result) => {
    if (result.detected) {
      setFireDetected(true);
      setTotalDetections(prev => prev + 1);

      const alert = {
        id: Date.now(),
        message: `🔥 Api terdeteksi (${result.source})`
      };

      setAlerts(prev => [alert, ...prev].slice(0, 5));
    } else {
      setFireDetected(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-6 py-4 flex justify-between">
        <h1 className="text-lg font-bold">🔥 Deteksi Api Real-Time</h1>
        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">
          Keluar
        </button>
      </nav>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CAMERA */}
        <div className="lg:col-span-2 bg-gray-800 p-4 rounded">
          <div className="flex justify-between mb-4">
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="bg-gray-700 px-3 py-2 rounded"
            >
              <option value="ruang-tamu">Ruang Tamu</option>
              <option value="kamar">Kamar</option>
              <option value="dapur">Dapur</option>
            </select>

            <button
              onClick={detectionActive ? stopDetection : startDetection}
              className="bg-red-600 px-4 py-2 rounded"
            >
              {detectionActive ? "Stop Deteksi" : "Mulai Deteksi"}
            </button>
          </div>

          <div className="bg-black aspect-video rounded overflow-hidden flex items-center justify-center">
            {!cameraActive && (
              <span className="text-gray-400">
                Klik "Mulai Deteksi" untuk menyalakan kamera
              </span>
            )}
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className={cameraActive ? "w-full h-full object-cover" : "hidden"}
            />
          </div>
        </div>

        {/* STATUS */}
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded">
            <p>Status API: <b>{apiStatus}</b></p>
            <p>Deteksi Api: <b>{fireDetected ? "YA 🔥" : "Tidak"}</b></p>
            <p>Total Deteksi: <b>{totalDetections}</b></p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="font-bold mb-2">Riwayat Alert</h2>
            {alerts.length === 0 ? (
              <p className="text-gray-400 text-sm">Belum ada alert</p>
            ) : (
              alerts.map(a => (
                <div key={a.id} className="text-orange-400 text-sm">
                  {a.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<DashboardApp />);
