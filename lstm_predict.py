from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import pickle
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

# Load model and scalers
model = load_model("backend/models/lstm_congestion.keras")

with open("backend/models/lstm_scaler_X.pkl", "rb") as f:
    scaler_X = pickle.load(f)

with open("backend/models/lstm_scaler_y.pkl", "rb") as f:
    scaler_y = pickle.load(f)

# Load historical averages
with open("backend/models/avg_vehicles.pkl", "rb") as f:
    avg_vehicles = pickle.load(f)

SEQ_LEN = 24
ROUTE_INDEX = {"DTI": 0, "IRG": 1, "RGD": 2}

def congestion_label(v):
    if v < 0.3: return "Low"
    if v < 0.7: return "Medium"
    return "High"

@app.route("/lstm_predict", methods=["POST"])
def lstm_predict():
    try:
        data = request.json

        route = data["route"]
        req_time = pd.to_datetime(data["time"])

        if route not in ROUTE_INDEX:
            return jsonify({"error": "Invalid route"}), 400

        # Generate last 24 hourly timestamps
        timestamps = pd.date_range(end=req_time, periods=24, freq="H")

        df = pd.DataFrame({"DateTime": timestamps})
        df["Hour"] = df["DateTime"].dt.hour
        df["DayOfWeek"] = df["DateTime"].dt.dayofweek
        df["Month"] = df["DateTime"].dt.month
        df["DayOfYear"] = df["DateTime"].dt.dayofyear
        df["WeekOfYear"] = df["DateTime"].dt.isocalendar().week.astype(int)

        # Fill vehicles using historical average
        def get_avg(row):
            key = (route, row["DayOfWeek"], row["Hour"])
            return avg_vehicles.get(key, np.mean(list(avg_vehicles.values())))

        df["Vehicles"] = df.apply(get_avg, axis=1)

        FEATURES = ["Hour", "DayOfWeek", "Month", "DayOfYear", "WeekOfYear", "Vehicles"]

        # Scale
        seq_scaled = scaler_X.transform(df[FEATURES]).reshape(1, 24, 6)

        # Predict
        pred_scaled = model.predict(seq_scaled)
        pred = scaler_y.inverse_transform(pred_scaled)[0]

        route_idx = ROUTE_INDEX[route]
        value = float(pred[route_idx])

        return jsonify({
            "route": route,
            "prediction_for": str(req_time),
            "value": value,
            "status": congestion_label(value)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003)
