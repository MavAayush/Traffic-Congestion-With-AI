// src/App.jsx
import React, { useState } from "react";
import CNNPanel from "./components/CNNPanel";
import LSTMPanel from "./components/LSTMPanel";
import LandingPage from "./components/LandingPage";
import "./style.css";

const Dashboard = () => (
  <main className="app-main">
    <div className="top-grid">
      <CNNPanel />
      <LSTMPanel />
    </div>
  </main>
);

export default function App() {
  const [isDashboardActive, setIsDashboardActive] = useState(false);

  const handleStartDashboard = () => {
    setIsDashboardActive(true);
  };

  return (
    <div className="app-root">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo-dot" />
          <div>
            <h1 className="app-title">Traffic Congestion Prediction</h1>
            <p className="app-subtitle">
              Computer vision & time series models for smarter movement.
            </p>
          </div>
        </div>

        <div className="app-header-right">
          {/* <span className="app-badge">Prototype</span> */}
        </div>
      </header>

      {/* Main: landing or dashboard */}
      {isDashboardActive ? (
        <Dashboard />
      ) : (
        <LandingPage onStartDashboard={handleStartDashboard} />
      )}

      <footer className="app-footer">
        <span>Built with CNN & LSTM </span>
      </footer>
    </div>
  );
}
