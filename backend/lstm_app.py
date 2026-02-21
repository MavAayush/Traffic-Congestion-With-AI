from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
from datetime import datetime
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

# Load files
model = load_model("models/lstm_model.keras")
scaler = pickle.load(open("models/lstm_scaler.pkl", "rb"))
avg_vehicles = pickle.load(open("models/avg_vehicles.pkl", "rb"))
JUNCTION_MAP = pickle.load(open("models/junction_names.pkl", "rb"))

# Reverse for name → ID lookup
NAME_TO_ID = {v: k for k, v in JUNCTION_MAP.items()}

FEATURES = ["Hour", "DayOfWeek", "Month", "DayOfYear", "WeekOfYear", "Vehicles"]
SEQ_LEN = 24

def get_avg_vehicle(jid, dow, hour):
    return avg_vehicles.get((jid, dow, hour), 50)  # fallback

@app.route("/lstm_predict", methods=["POST"])
def lstm_predict():
    try:
        data = request.get_json()
        junction_name = data.get("junction")
        time_str = data.get("time")

        if junction_name not in NAME_TO_ID:
            return jsonify({"error": "Invalid junction name"}), 400

        junction_id = NAME_TO_ID[junction_name]

        if time_str:
            pred_time = datetime.fromisoformat(time_str)
        else:
            pred_time = datetime.now()

        df_seq = pd.DataFrame(
            pd.date_range(end=pred_time, periods=SEQ_LEN, freq="H"),
            columns=["DateTime"]
        )

        df_seq["Hour"] = df_seq.DateTime.dt.hour
        df_seq["DayOfWeek"] = df_seq.DateTime.dt.dayofweek
        df_seq["Month"] = df_seq.DateTime.dt.month
        df_seq["DayOfYear"] = df_seq.DateTime.dt.dayofyear
        df_seq["WeekOfYear"] = df_seq.DateTime.dt.isocalendar().week.astype(int)
        df_seq["Vehicles"] = df_seq.apply(
            lambda r: get_avg_vehicle(junction_id, r["DayOfWeek"], r["Hour"]),
            axis=1
        )

        X_scaled = scaler.transform(df_seq[FEATURES])
        X_input = np.array([X_scaled])

        prob = float(model.predict(X_input)[0][0])
        status = "CONGESTED" if prob > 0.5 else "NOT CONGESTED"

        return jsonify({
            "junction": junction_name,
            "prediction_for": pred_time.strftime("%d/%m/%Y, %I:%M %p"),
            "congestion_prob": round(prob, 3),
            "status": status
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def home():
    return "<h2>LSTM Traffic API Running...</h2>"

if __name__ == "__main__":
    print("🚀 LSTM API running at http://127.0.0.1:5003")
    app.run(host="0.0.0.0", port=5003)
