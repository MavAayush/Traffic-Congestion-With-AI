# cnn_predict.py
import numpy as np
import cv2
import os
from tensorflow.keras.models import load_model

MODEL_PATH = "public/models/cnn_model.h5"   # Use .h5 model for prediction

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

model = load_model(MODEL_PATH)
print("CNN Model Loaded Successfully!")

# Congestion Prediction Function
def predict_congestion(img_path):
    if not os.path.exists(img_path):
        return f"Image not found: {img_path}"

    # Load image in grayscale
    img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)

    if img is None:
        return "Error reading the image. Ensure it's a valid image file."

    # Resize → must match training: (222 height, 296 width)
    img = cv2.resize(img, (296, 222))

    # Normalize
    img = img.astype('float32') / 255.0

    # Add channels and batch dimension
    img = np.expand_dims(img, axis=-1)  # (222, 296, 1)
    img = np.expand_dims(img, axis=0)   # (1, 222, 296, 1)

    # Predict
    prediction = model.predict(img)
    class_id = np.argmax(prediction, axis=1)[0]

    congested_prob = float(prediction[0][0])
    uncongested_prob = float(prediction[0][1])

    # Output labels
    if class_id == 0:
        status = "Congested"
    else:
        status = "Uncongested"

    return {
        "status": status,
        "congested_probability": round(congested_prob, 4),
        "uncongested_probability": round(uncongested_prob, 4)
    }


# Example usage (test image)
if __name__ == "__main__":
    test_image = "public/sample.jpg"

    if os.path.exists(test_image):
        result = predict_congestion(test_image)
        print("\nPrediction Result:")
        print(result)
    else:
        print(f"Test image not found at: {test_image}")
