from ultralytics import YOLO
import os
import glob

train_dirs = glob.glob("runs/detect/train*")
if not train_dirs:
    print("Aucun répertoire d'entraînement trouvé. Utilisation du modèle par défaut.")
    best_weight_path = "../yolo11s.pt"
else:
    latest_train = max(train_dirs, key=os.path.getmtime)
    best_weight_path = os.path.join(latest_train, "weights", "best.pt")
    print(f"Dernier train trouvé : {best_weight_path}")

model = YOLO(best_weight_path)

results = model.train(
    data='./data.yaml',
    epochs=1,
    imgsz=640,
    batch=16,
)

#model.export(format='onnx')