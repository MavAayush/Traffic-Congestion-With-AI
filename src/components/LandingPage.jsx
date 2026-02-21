import React from "react";

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

export default function LandingPage({ onStartDashboard }) {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-text">
          <p className="landing-eyebrow">Traffic Insight Dashboard</p>
          <h2 className="landing-title">
            Understand congestion <span className="landing-title-em">at a glance</span>.
          </h2>
          <p className="landing-subtitle">
            Upload a road snapshot or live video for instant congestion classification with CNN, and
            previous travel day across key routes using an LSTM-based model. Designed
            for clean, focused experimentation.
          </p>

          <div className="landing-actions">
            <button
              className="primary-btn primary-btn-large"
              onClick={onStartDashboard}
            >
              <PlayIcon />
              <span>Launch dashboard</span>
            </button>
            <p className="landing-note">
              You can start with sample images/videos and predefined routes.
            </p>
          </div>
        </div>

        <div className="landing-panel">
          <div className="landing-card">
            <div className="landing-card-row">
              <div>
                <p className="landing-card-label">CNN detection</p>
                <p className="landing-card-value">Road snapshot</p>
              </div>
              <span className="landing-chip">Image / video</span>
            </div>
            <div className="landing-divider" />
            <p className="landing-card-hint">
              Get a clear label like <strong>“Congested”</strong> or{" "}
              <strong>“Uncongested”</strong> .
            </p>
          </div>

          <div className="landing-card secondary">
            <div className="landing-card-row">
              <div>
                <p className="landing-card-label">LSTM forecast</p>
                <p className="landing-card-value">Travel route</p>
              </div>
              <span className="landing-chip subtle">Time series</span>
            </div>
            <div className="landing-divider" />
            <p className="landing-card-hint">
              Select a route like <strong>DTU → Infosys</strong> and estimate
              expected duration and congestion level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
