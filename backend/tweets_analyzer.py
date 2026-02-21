import re

def classify_tweet(text):
    text = text.lower()

    # ACCIDENT
    if re.search(r"(accident|crash|collision|hit|overturned|major accident)", text):
        return "Accident"

    # TRAFFIC JAM / HEAVY
    if re.search(r"(traffic jam|heavy traffic|stuck|bumper to bumper|long queue|congestion)", text):
        return "Traffic Jam"

    # ROADBLOCK / CONSTRUCTION
    if re.search(r"(roadblock|road closed|construction|repair work|diversion)", text):
        return "Roadblock"

    # RALLY / EVENT
    if re.search(r"(rally|protest|march|demonstration|procession)", text):
        return "Rally"

    return "Normal"
