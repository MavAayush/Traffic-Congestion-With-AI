from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import tensorflow as tf
import tempfile
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = "models/cnn_model.h5"
model = tf.keras.models.load_model(MODEL_PATH)

# CNN PREPROCESSING
def preprocess_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (296, 222))
    norm = resized / 255.0
    norm = norm.reshape(1, 222, 296, 1)
    return norm

# PREDICT IMAGE (returns label + confidence)
def predict_image(file_storage):
    file_bytes = np.frombuffer(file_storage.read(), np.uint8)
    frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    processed = preprocess_frame(frame)
    preds = model.predict(processed)[0]   # ex: [0.15, 0.85]

    congested_prob = float(preds[1])   # index 1 = Congested
    label = "Congested" if congested_prob > 0.5 else "Uncongested"

    return {
        "label": label,
        "confidence": congested_prob
    }

# PREDICT VIDEO (returns average confidence)
def predict_video(file_storage):
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    file_storage.save(tmp.name)

    cap = cv2.VideoCapture(tmp.name)
    fps = cap.get(cv2.CAP_PROP_FPS)
    interval = int(fps * 2)  # every 2 seconds

    frame_count = 0
    probs = []

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % interval == 0:
            processed = preprocess_frame(frame)
            preds = model.predict(processed)[0]
            probs.append(float(preds[1]))  # congested class prob

        frame_count += 1

    cap.release()
    os.remove(tmp.name)

    if len(probs) == 0:
        return {"error": "No usable frames found"}

    avg_prob = sum(probs) / len(probs)
    label = "Congested" if avg_prob > 0.5 else "Uncongested"

    return {
        "label": label,
        "confidence": avg_prob,
        "frames_analyzed": len(probs)
    }


# UNIVERSAL CNN PREDICT ENDPOINT
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    filename = file.filename.lower()

    if filename.endswith((".jpg", ".jpeg", ".png", ".bmp")):
        result = predict_image(file)
        return jsonify({
            "type": "image",
            **result
        })

    elif filename.endswith((".mp4", ".mov", ".avi", ".mkv", ".flv")):
        result = predict_video(file)
        return jsonify({
            "type": "video",
            **result
        })

    else:
        return jsonify({"error": "Unsupported file type"}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
