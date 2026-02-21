import React, { useState, useMemo } from "react";

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 14.9A7 7 0 0 1 15.7 8h1.8a5 5 0 0 1 0 10.2M12 16v6M9 19h6" />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="icon-check"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function CNNPanel() {
  const [file, setFile] = useState(null);
  const [label, setLabel] = useState("");
  const [resultMessage, setResultMessage] = useState("Awaiting file upload…");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileName = useMemo(
    () => (file ? file.name : "Choose an image or short video"),
    [file]
  );

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected || null);
    setLabel("");
    setIsSuccess(false);

    if (selected) {
      setResultMessage(`File “${selected.name}” ready to analyze.`);
    } else setResultMessage("Awaiting file upload…");
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setIsSuccess(false);
    setResultMessage("Analyzing with CNN model…");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5001/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        setResultMessage(`Error: ${data.error}`);
        setLabel("Failed");
        return;
      }

      const finalLabel = data.label || data.prediction || "Unknown";

      setLabel(finalLabel);
      setResultMessage("Analysis complete.");
      setIsSuccess(true);
    } catch (err) {
      console.error("CNN error:", err);
      setResultMessage("Server connection failed.");
      setLabel("Error");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClass = (label) => {
    const v = (label || "").toLowerCase();
    if (v.includes("congested")) return "status-congested";
    if (v.includes("uncongested") || v.includes("clear"))
      return "status-low";
    return "muted";
  };

  const display = label || resultMessage;

  return (
    <div className="card">
      <div className="card-header-row">
        <div>
          <h2 className="card-title">CNN Traffic Detection</h2>
          <p className="card-subtitle">
            Upload a road view and get an instant congestion label.
          </p>
        </div>
        <span className="card-tag">Snapshot</span>
      </div>

      <div className="card-section">
        <div className="file-upload-container">
          <label className="custom-file-input" htmlFor="file-upload">
            <span
              className={
                file ? "file-name-display selected" : "file-name-display"
              }
            >
              {fileName}
            </span>
            <span className="upload-btn-label">
              <UploadIcon />
              <span>Browse</span>
            </span>
            <input
              id="file-upload"
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
              disabled={isLoading}
            />
          </label>
        </div>

        <button
          className="primary-btn"
          onClick={handleUpload}
          disabled={isLoading || !file}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner" />
              <span>Analyzing</span>
            </>
          ) : (
            <>
              {isSuccess && <CheckIcon />}
              <span>Predict</span>
            </>
          )}
        </button>
      </div>

      <div className={`result-box ${isSuccess ? "prediction-success" : ""}`}>
        <p className="result-label">
          {label ? "Classification Result" : "Status"}
        </p>
        <p
          className={`result-value ${
            isLoading ? "muted" : getStatusClass(label)
          }`}
        >
          {isLoading ? "Analyzing…" : display}
        </p>
      </div>
    </div>
  );
}
