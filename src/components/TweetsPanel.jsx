import React, { useEffect, useState } from "react";

export default function TweetsPanel() {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5002/tweets")
      .then((res) => res.json())
      .then((data) => setTweets(data.tweets));
  }, []);

  return (
    <div className="card card-full">
      <h2 className="card-title">🐦 Live Traffic Alerts</h2>
      <p className="card-subtitle">Latest tweets about traffic incidents.</p>

      <div className="tweets-list">
        {tweets.map((t, index) => (
          <div className="tweet-item" key={index}>
            <div className={`tweet-tag tag-${t.type}`}>{t.type}</div>
            <p className="tweet-text">{t.text}</p>
            <p className="tweet-meta">@{t.user} • {t.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
