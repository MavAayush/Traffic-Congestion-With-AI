const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Route to serve tweets.json
app.get("/tweets", (req, res) => {
  const filePath = path.join(__dirname, "public", "tweets.json");

  // Check if file exists first
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "tweets.json file not found" });
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading tweets.json:", err);
      return res.status(500).json({ error: "Failed to read tweets.json" });
    }

    try {
      const tweets = JSON.parse(data);
      res.json(tweets);
    } catch (parseErr) {
      console.error("Error parsing tweets.json:", parseErr);
      res.status(500).json({ error: "Invalid JSON format in tweets.json" });
    }
  });
});

// Optional: serve static frontend files if needed
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://127.0.0.1:${PORT}`);
});
