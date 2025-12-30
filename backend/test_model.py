from ultralytics import YOLO
import cv2

model = YOLO("../models/best.pt")

img = cv2.imread("test_fire.jpg")
results = model(img, conf=0.15, verbose=True)

print(results)
