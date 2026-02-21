import tweepy
import json
import time
import os
from tweets_analyzer import classify_tweet

# ==== Create folder if missing ====
os.makedirs("public", exist_ok=True)

# ==== Twitter API setup ====
BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAADNv5wEAAAAApvtJD4oQtsFhYUGthq%2FZ7lW4RKI%3D4mXzOG1T7efxi4WXoSXT93gxM9wR2cJov1ZkEe6o035BcuXOa3"
client = tweepy.Client(bearer_token=BEARER_TOKEN, wait_on_rate_limit=True)

SEARCH_QUERY = "traffic -is:retweet lang:en"
OUTPUT_FILE = "public/tweets.json"

def save_tweets(tweets):
    try:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(tweets, f, indent=4, ensure_ascii=False)
        print(f"Saved {len(tweets)} tweets to {OUTPUT_FILE}")
    except Exception as e:
        print("Error saving tweets:", e)

def fetch_tweets():
    tweets_data = []
    try:
        response = client.search_recent_tweets(
            query=SEARCH_QUERY,
            max_results=20,
            tweet_fields=["created_at", "text", "author_id"]
        )

        if response.data:
            for tweet in response.data:
                label = classify_tweet(tweet.text)
                tweets_data.append({
                    "id": tweet.id,
                    "text": tweet.text,
                    "author_id": tweet.author_id,
                    "created_at": str(tweet.created_at),
                    "label": label
                })

        save_tweets(tweets_data)

    except Exception as e:
        print("Error fetching tweets:", e)

if __name__ == "__main__":
    print("Starting Twitter real-time fetcher...")
    print("Fetching new tweets every 60 seconds...\n")

    while True:
        fetch_tweets()
        time.sleep(600)
