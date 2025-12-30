# backend/api.py
# ============================================================
# FIRE & SMOKE REAL-TIME DETECTION (YOLOv8)
# Preprocessing + Stabilization + Telegram Ready
# ============================================================

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

from user_service import get_user_by_id
from telegram_service import send_message, send_photo, can_send

import cv2
import numpy as np
import time
import os

# ============================================================
# APP & GLOBAL INIT
# ============================================================

SCREENSHOT_DIR = "screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# LOAD YOLO MODEL
# ============================================================

# data.yaml:
# 0 = Fire
# 1 = Smoke
FIRE_CLASSES = [0, 1]

model = YOLO("../models/best.pt")

# ============================================================
# GLOBAL STATE
# ============================================================

is_active = False
active_user = None
total_detect = 0

# stabilizer (C)
FIRE_FRAME_THRESHOLD = 2   # butuh 2 frame berturut-turut
_fire_frame_count = 0

# ============================================================
# STATUS ENDPOINT
# ============================================================

@app.get("/status")
def status():
    return {
        "api": "ready",
        "active": is_active,
        "total_detect": total_detect,
        "active_user": active_user
    }

# ============================================================
# CONTROL ENDPOINT
# ============================================================

@app.post("/control")
def control(payload: dict):
    global is_active, active_user, total_detect

    cmd = payload.get("action")
    user_id = payload.get("user_id")

    if cmd == "start":
        is_active = True
        if user_id:
            user = get_user_by_id(user_id)
            if user:
                active_user = user
                print(f"[USER] Active user = {user['name']}")

    elif cmd == "stop":
        is_active = False
        active_user = None

    elif cmd == "reset":
        total_detect = 0

    print(f"[CONTROL] {cmd} | active={is_active}")
    return {
        "active": is_active,
        "total_detect": total_detect,
        "active_user": active_user
    }

# ============================================================
# DETECTION ENDPOINT
# ============================================================

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    global total_detect, _fire_frame_count

    # --------------------------------------------------------
    # Guard: sistem belum aktif / user belum login
    # --------------------------------------------------------
    if not is_active or not active_user:
        return {
            "fire": False,
            "confidence": 0.0,
            "time": time.strftime("%H:%M:%S")
        }

    # --------------------------------------------------------
    # Decode image
    # --------------------------------------------------------
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

    print(f"[FRAME] shape={frame.shape}")

    # ========================================================
    # A. PREPROCESSING (ANTI RUANG TERANG)
    # ========================================================

    # Convert ke grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # Kembali ke BGR untuk YOLO
    frame_proc = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

    # ========================================================
    # YOLO INFERENCE
    # ========================================================

    results = model(
        frame_proc,
        conf=0.10,      # sensitif untuk api kecil
        imgsz=640,      # samakan dengan training
        verbose=False
    )

    fire_detected = False
    max_conf = 0.0
    detected_class = None

    if results and results[0].boxes is not None:
        print(f"[DEBUG] boxes={len(results[0].boxes)}")

        for box in results[0].boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])

            print(f"[YOLO] cls={cls} conf={conf:.2f}")

            # ====================================================
            # B. FIRE + SMOKE LOGIC
            # ====================================================
            if cls in FIRE_CLASSES:
                _fire_frame_count += 1
                max_conf = max(max_conf, conf)
                detected_class = cls
            else:
                _fire_frame_count = 0

    else:
        print("[DEBUG] NO BOXES")
        _fire_frame_count = 0

    # ========================================================
    # C. STABILIZATION (ANTI 1-FRAME NOISE)
    # ========================================================

    if _fire_frame_count >= FIRE_FRAME_THRESHOLD:
        fire_detected = True
        _fire_frame_count = 0
    else:
        fire_detected = False

    # ========================================================
    # FIRE CONFIRMED
    # ========================================================

    if fire_detected:
        total_detect += 1

        label = "Fire" if detected_class == 0 else "Smoke"

        print(
            f"[FIRE] CONFIRMED | {label} | "
            f"User={active_user['name']} | "
            f"conf={max_conf:.2f}"
        )

        # Telegram alert (cooldown handled inside)
        if can_send():
            filename = f"{SCREENSHOT_DIR}/fire_{int(time.time())}.jpg"
            cv2.imwrite(filename, frame)

            message = (
                "🔥 *PERINGATAN KEBAKARAN* 🔥\n\n"
                f"👤 Pemilik: {active_user['name']}\n"
                f"📍 Alamat:\n{active_user['location']}\n\n"
                f"🚨 Jenis: {label}\n"
                f"🎯 Confidence: {max_conf:.2f}\n"
                f"⏰ Waktu: {time.strftime('%H:%M:%S')}\n\n"
                "Segera lakukan penanganan darurat!"
            )

            send_message(message)
            send_photo(filename)

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "fire": fire_detected,
        "confidence": max_conf,
        "time": time.strftime("%H:%M:%S"),
        "user": active_user
    }
