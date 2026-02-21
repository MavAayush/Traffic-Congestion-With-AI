import React, { useState } from "react";

const JUNCTIONS = ["ISBT", "Gandhi Nagar", "India Gate", "Red Fort"];

export default function LSTMPanel() {
  const [junction, setJunction] = useState(JUNCTIONS[0]);
  const [time, setTime] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async () => {
    setLoading(true);
    setResult(null);

    const res = await fetch("http://127.0.0.1:5003/lstm_predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ junction, time }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>LSTM Traffic Forecast</h2>

      <label>Choose Junction:</label>
      <select
        value={junction}
        onChange={(e) => setJunction(e.target.value)}
        className="select-input"
      >
        {JUNCTIONS.map((j) => (
          <option key={j}>{j}</option>
        ))}
      </select>

      <label>Select Time:</label>
      <input
        type="datetime-local"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="select-input"
      />

      <button className="primary-btn" onClick={predict} disabled={loading}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {result && (
        <div className="result-box">
          <p>🕒 {result.prediction_for}</p>
          <p>📍 {result.junction}</p>
          <p>
            🚦 Status:{" "}
            <strong
              style={{
                color: result.status === "CONGESTED" ? "red" : "green",
              }}
            >
              {result.status}
            </strong>
          </p>
          {/* <p>Probability: {result.congestion_prob}</p> */}
        </div>
      )}
    </div>
  );
}
