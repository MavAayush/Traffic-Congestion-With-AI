# cnn_train.py — Final Training Script (No Hyperband)

import os
import numpy as np
import polars as pl
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow import keras
import keras_tuner as kt

def load_dataset():
    congested = pl.read_csv("Training/model2_congested_traffic_dataset.csv")
    uncongested = pl.read_csv("Training/model2_uncongested_traffic_dataset.csv")

    df = pl.concat([congested, uncongested], how="vertical")

    y = df[:, 0].to_numpy()
    X = df[:, 1:].to_numpy() / 255.0
    X = X.reshape(-1, 222, 296, 1)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.1, random_state=42
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.15, random_state=42
    )

    return X_train, y_train, X_test, y_test, X_val, y_val

X_train, y_train, X_test, y_test, X_val, y_val = load_dataset()

# Load Best Hyperparameters from previous Hyperband tuner

print("\nLoading best hyperparameters from existing tuner logs...\n")

tuner = kt.Hyperband(
    hypermodel=None,
    objective="val_accuracy",
    max_epochs=10,
    factor=3,
    directory="public/models",
    project_name="traffic_cnn"
)

best_hps = tuner.get_best_hyperparameters(num_trials=1)[0]
print("\nBest hyperparameters found earlier:\n")
print(best_hps.values)

def build_model(hp):
    model = keras.Sequential()
    model.add(keras.layers.Conv2D(
        filters=hp['filter_1'],
        kernel_size=hp['filter_size_1'],
        activation='relu',
        input_shape=(222, 296, 1)
    ))
    model.add(keras.layers.MaxPooling2D(pool_size=2))

    model.add(keras.layers.Conv2D(
        filters=hp['filter_2'],
        kernel_size=hp['filter_size_2'],
        activation='relu'
    ))
    model.add(keras.layers.MaxPooling2D(pool_size=2))

    model.add(keras.layers.Flatten())
    model.add(keras.layers.Dense(hp['units'], activation='relu'))
    model.add(keras.layers.Dropout(0.3))
    model.add(keras.layers.Dense(2, activation='softmax'))

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=hp['lr']),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model

model = build_model(best_hps)


print("\nTraining BEST model for 20 epochs...\n")

history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=20,
    batch_size=32
)

# Evaluate and Save Model
loss, acc = model.evaluate(X_test, y_test)
print("\nFinal Test Accuracy:", acc)

os.makedirs("backend/models", exist_ok=True)
model.save("backend/models/cnn_model.h5")

print("\nModel saved at backend/models/cnn_model.h5\n")
print("Training Complete!")
