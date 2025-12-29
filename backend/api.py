# backend/api.py

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import time

# ===============================
# APP INIT
# ===============================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# LOAD MODEL
# ===============================
model = YOLO("../models/best.pt")

CLASS_FIRE = 0  # <-- SESUAIKAN DENGAN data.yaml KAMU

# ===============================
# GLOBAL STATE
# ===============================
is_active = False
total_detect = 0

# ===============================
# STATUS
# ===============================
@app.get("/status")
def status():
    return {
        "api": "ready",
        "active": is_active,
        "total_detect": total_detect
    }

# ===============================
# CONTROL
# ===============================
@app.post("/control")
def control(action: dict):
    global is_active, total_detect

    cmd = action.get("action")

    if cmd == "start":
        is_active = True
    elif cmd == "stop":
        is_active = False
    elif cmd == "reset":
        total_detect = 0

    print(f"[CONTROL] {cmd} | active={is_active}")

    return {
        "active": is_active,
        "total_detect": total_detect
    }

# ===============================
# DETECTION
# ===============================
@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    global total_detect

    if not is_active:
        return {
            "fire": False,
            "confidence": 0.0,
            "time": time.strftime("%H:%M:%S")
        }

    # read image
    image_bytes = await file.read()
    np_img = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if frame is None:
        print("[ERROR] Frame decode failed")
        return {
            "fire": False,
            "confidence": 0.0,
            "time": time.strftime("%H:%M:%S")
        }

    # YOLO inference (LOW CONF FOR FIRE)
    results = model(frame, conf=0.2, imgsz=416, verbose=False)

    fire_detected = False
    confidence = 0.0

    if results and results[0].boxes is not None:
        for box in results[0].boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])

            print(f"[YOLO] cls={cls} conf={conf:.2f}")

            if cls == CLASS_FIRE:
                fire_detected = True
                confidence = max(confidence, conf)

        if fire_detected:
            total_detect += 1

    return {
        "fire": fire_detected,
        "confidence": confidence,
        "time": time.strftime("%H:%M:%S")
    }
