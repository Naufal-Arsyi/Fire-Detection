// utils/API_fire.js

const BACKEND_URL = "http://127.0.0.1:8000";

function initFireDetectionAPI(videoElement, onResult) {
  let intervalId = null;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const INTERVAL = 800; // ms

  async function sendFrame() {
    if (!videoElement) return;
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) return;

    console.log("📸 sending frame");

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const response = await fetch(`${BACKEND_URL}/detect`, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          console.error("Detect API error:", response.status);
          return;
        }

        const data = await response.json();

        onResult({
          detected: data.fire === true,
          confidence: data.confidence || 0,
          source: data.source || "YOLO",
          timestamp: data.time || new Date().toLocaleTimeString("id-ID")
        });

      } catch (err) {
        console.error("Detection fetch error:", err);
      }
    }, "image/jpeg", 0.7);
  }

  return {
    start() {
      if (intervalId) return;
      console.log("🔥 Fire detection loop started");
      intervalId = setInterval(sendFrame, INTERVAL);
    },

    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("🛑 Fire detection loop stopped");
      }
    }
  };
}
