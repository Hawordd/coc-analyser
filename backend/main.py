from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np
import cv2
from ultralytics import YOLO
import os
import glob
from typing import List, Dict, Any

train_dirs = glob.glob("training/runs/detect/train*")
if not train_dirs:
    MODEL_PATH = "yolo11s.pt"
else:
    latest_train = max(train_dirs, key=os.path.getmtime)
    MODEL_PATH = os.path.join(latest_train, "weights", "best.pt")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None

@app.on_event("startup")
async def startup_event():
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = YOLO(MODEL_PATH)
            print(f"Modèle YOLO chargé : {MODEL_PATH}")
        else:
            model = YOLO("yolo11s.pt")
            print("Modèle YOLO générique chargé (pas de modèle personnalisé trouvé)")
    except Exception as e:
        print(f"Erreur lors du chargement du modèle: {e}")

@app.post('/analyze')
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    img_array = np.array(image)
    if len(img_array.shape) == 3 and img_array.shape[2] == 4:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
    
    width, height = image.size
    
    if model is None:
        return {"width": width, "height": height, "error": "Modèle non chargé"}
    
    results = model(img_array)
    
    buildings = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = model.names[class_id]
            buildings.append({
                "type": class_name,
                "confidence": confidence,
                "bbox": {
                    "x1": round(x1),
                    "y1": round(y1),
                    "x2": round(x2),
                    "y2": round(y2)
                }
            })
    
    return {
        "width": width, 
        "height": height,
        "buildings": buildings
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "model_loaded": model is not None}