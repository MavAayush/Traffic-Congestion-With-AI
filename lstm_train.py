import pandas as pd
import numpy as np
import pickle
import os
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.model_selection import train_test_split

# 0) JUNCTION NAME MAPPING
JUNCTION_MAP = {
    1: "ISBT",
    2: "Gandhi Nagar",
    3: "India Gate",
    4: "Red Fort"
}

print("\n Loading dataset...")
df = pd.read_csv("traffic.csv", parse_dates=["DateTime"])
df.sort_values(["Junction", "DateTime"], inplace=True)

# Replace numeric IDs with names
df["JunctionName"] = df["Junction"].map(JUNCTION_MAP)

# 1) TIME-BASED FEATURES
df["Hour"] = df["DateTime"].dt.hour
df["DayOfWeek"] = df["DateTime"].dt.dayofweek
df["Month"] = df["DateTime"].dt.month
df["DayOfYear"] = df["DateTime"].dt.dayofyear
df["WeekOfYear"] = df["DateTime"].dt.isocalendar().week.astype(int)

# Binary congestion label
df["Congested"] = df.groupby("JunctionName")["Vehicles"].transform(
    lambda x: (x > x.quantile(0.8)).astype(int)
)

FEATURES = ["Hour", "DayOfWeek", "Month", "DayOfYear", "WeekOfYear", "Vehicles"]
TARGET = "Congested"
SEQ_LEN = 24

# 2) SCALE FEATURES
scaler = MinMaxScaler()
df[FEATURES] = scaler.fit_transform(df[FEATURES])

def create_sequences(data, seq_len):
    X, y = [], []
    for junc, group in data.groupby("JunctionName"):
        feat = group[FEATURES].values
        tar = group[TARGET].values
        for i in range(len(feat) - seq_len):
            X.append(feat[i:i+seq_len])
            y.append(tar[i+seq_len])
    return np.array(X), np.array(y)

X, y = create_sequences(df, SEQ_LEN)
X_train, X_test, y_train, y_test = train_test_split(X, y, shuffle=False, test_size=0.2)

# 3) BUILD MODEL
model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(SEQ_LEN, len(FEATURES))),
    LSTM(32),
    Dense(1, activation="sigmoid")
])
model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

print("\n Training model...")
history = model.fit(X_train, y_train, epochs=15, batch_size=32, validation_data=(X_test, y_test))

# 4) SAVE EVERYTHING
os.makedirs("backend/models", exist_ok=True)
model.save("backend/models/lstm_model.keras")

pickle.dump(scaler, open("backend/models/lstm_scaler.pkl", "wb"))
pickle.dump(JUNCTION_MAP, open("backend/models/junction_names.pkl", "wb"))

df_original = pd.read_csv("traffic.csv", parse_dates=["DateTime"])
avg_vehicles = df_original.groupby(
    [df_original["Junction"], df_original["DateTime"].dt.dayofweek, df_original["DateTime"].dt.hour]
)["Vehicles"].mean().to_dict()

pickle.dump(avg_vehicles, open("backend/models/avg_vehicles.pkl", "wb"))

print("\n Training complete! Model saved to backend/models/")

