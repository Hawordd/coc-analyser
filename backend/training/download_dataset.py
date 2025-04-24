from roboflow import Roboflow

# Dataset link : https://app.roboflow.com/walkstation/clash-of-clan-object-detection/dataset/10
rf = Roboflow(api_key="your_api_key")
project = rf.workspace("walkstation").project("clash-of-clan-object-detection")
version = project.version(10)
dataset = version.download("yolov8")

print("Dataset téléchargé et prêt à l'emploi pour YOLOv8.")