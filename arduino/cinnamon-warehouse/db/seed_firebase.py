"""
Cinnamon Warehouse - Firebase RTDB Seeder Script
Inserts realistic sensor data matching the database schema from:
  cinnamon-warehouse-default-rtdb-export.json

Usage:
  python seed_firebase.py [--days 7] [--interval 30] [--device-id AUTO]

Requirements:
  pip install firebase-admin python-dateutil
"""

import argparse
import json
import math
import os
import random
import time
from datetime import datetime, timedelta, timezone

import firebase_admin
from firebase_admin import credentials, db

# ---------------------------------------------------------------------------
# Firebase configuration – fill in your service-account key or use the env var
# ---------------------------------------------------------------------------
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_KEY = os.path.join(_SCRIPT_DIR, "serviceAccountKey.json")
DATABASE_URL = "https://cinnamon-warehouse-default-rtdb.asia-southeast1.firebasedatabase.app"

# ---------------------------------------------------------------------------
# Device metadata (mirrors what the ESP32 sends on first boot)
# ---------------------------------------------------------------------------
DEVICE_INFO = {
    "device_id":        "249627E81F84",
    "device_name":      "Cinnamon Warehouse Monitor",
    "location":         "Cinnamon Warehouse",
    "firmware_version": "7.0.0",
    "esp32_model":      "ESP32-D0WD-V3",
    "mac_address":      "84:1F:E8:27:96:24",
    "ip_address":       "192.168.8.176",
    "sensors": {
        "temperature_humidity": "DHT22",
        "air_quality":          "MQ135",
        "light":                "LDR",
        "motion":               "PIR",
    },
}

# ---------------------------------------------------------------------------
# Realistic sensor-value ranges for a cinnamon warehouse
# ---------------------------------------------------------------------------
SENSOR_RANGES = {
    # Covers both normal band (20–25 °C) and alert zones (< 20, > 25)
    "temperature":  (18.0, 28.0),      # °C  — alert: < 20 | > 25
    # Covers normal band (60–85 %) and alert zones (< 60, > 85)
    "humidity":     (55.0, 90.0),      # %   — alert: < 60 | > 85
    # Covers normal and alert zones (< 45, > 55) — used as air_moisture_percent
    "moisture":     (40.0, 60.0),      # %   — alert: < 45 | > 55
    # Covers normal and alert zone (> 800 ppm)
    "co2":          (380.0, 1000.0),   # ppm — alert: > 800
    # Covers normal and alert zone (> 400 ppm)
    "voc":          (200.0, 600.0),    # ppm — alert: > 400
    "ammonia":      (0.5,  10.0),      # ppm
    "benzene":      (0.1,   2.0),      # ppm
    "brightness":   (5,    85),        # %
    # Covers normal and alert zones (< 20 lux = very dark, > 150 lux = unexpected high)
    "lux":          (10.0, 200.0),     # lux — alert: < 20 | > 150
    "light_raw":    (300,  3500),      # 12-bit ADC
    "wifi_rssi":    (-75, -45),        # dBm
    "free_heap":    (120_000, 220_000),
}

# Motion probability per reading
MOTION_PROBABILITY = 0.08   # 8 % of readings trigger motion


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def rand_float(lo: float, hi: float, decimals: int = 2) -> float:
    return round(random.uniform(lo, hi), decimals)


def air_quality_label(co2: float) -> str:
    if co2 <= 450:
        return "Excellent"
    elif co2 <= 600:
        return "Good"
    elif co2 <= 1000:
        return "Moderate"
    elif co2 <= 1500:
        return "Poor"
    return "Hazardous"


def compute_heat_index(temp: float, hum: float) -> float:
    if temp < 27.0 or hum < 40.0:
        return temp
    return temp + 0.5 * (temp - 27.0) * (hum - 40.0) / 100.0


def compute_dew_point(temp: float, hum: float) -> float:
    a, b = 17.27, 237.7
    alpha = (a * temp) / (b + temp) + math.log(hum / 100.0)
    return round((b * alpha) / (a - alpha), 2)


def fmt_datetime(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def fmt_date(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def fmt_time(dt: datetime) -> str:
    return dt.strftime("%H:%M:%S")


# ---------------------------------------------------------------------------
# Sensor-reading generator
# ---------------------------------------------------------------------------

def generate_reading(device_id: str, dt: datetime, uptime_ms: int) -> dict:
    """Return a dict that mirrors a full ESP32 reading."""
    temp     = rand_float(*SENSOR_RANGES["temperature"])
    hum      = rand_float(*SENSOR_RANGES["humidity"])
    moist    = rand_float(*SENSOR_RANGES["moisture"])
    co2      = rand_float(*SENSOR_RANGES["co2"])
    voc      = rand_float(*SENSOR_RANGES["voc"])
    ammonia  = rand_float(*SENSOR_RANGES["ammonia"])
    benzene  = rand_float(*SENSOR_RANGES["benzene"])
    bright   = random.randint(*SENSOR_RANGES["brightness"])
    lux      = rand_float(*SENSOR_RANGES["lux"])
    raw      = random.randint(*SENSOR_RANGES["light_raw"])
    light_d  = bright > 50
    motion   = random.random() < MOTION_PROBABILITY
    rssi     = random.randint(*SENSOR_RANGES["wifi_rssi"])
    heap     = random.randint(*SENSOR_RANGES["free_heap"])
    return {
        # identity / time
        "device_id":         device_id,
        "timestamp":         uptime_ms,   # millis() since boot, matches ESP32 behaviour
        "date":              fmt_date(dt),
        "time":              fmt_time(dt),
        # temperature / humidity
        "temperature_c":     temp,
        "humidity_percent":  hum,
        "air_moisture_percent": moist,
        "heat_index_c":      round(compute_heat_index(temp, hum), 2),
        "dew_point_c":       compute_dew_point(temp, hum),
        # air quality
        "co2_ppm":           co2,
        "voc_ppm":           voc,
        "ammonia_ppm":       ammonia,
        "benzene_ppm":       benzene,
        "air_quality":       air_quality_label(co2),
        # light
        "light_raw":         raw,
        "brightness_percent": bright,
        "lux":               lux,
        "light_digital":     light_d,
        # motion
        "motion_detected":   motion,
        "motion_confidence": random.randint(75, 100) if motion else random.randint(0, 25),
        # system
        "wifi_rssi":         rssi,
        "uptime_seconds":    uptime_ms // 1000,   # seconds since device boot
        "free_heap":         heap,
        # store uptime_ms so write helpers can use it as the path key
        "_unix_ts":          uptime_ms,
    }


# ---------------------------------------------------------------------------
# Firebase write helpers
# ---------------------------------------------------------------------------

SL_TZ = timezone(timedelta(hours=5, minutes=30))   # GMT+5:30 — matches ESP32 NTP offset


def write_device_info(root_ref, device_id: str, first_boot: datetime):
    info = dict(DEVICE_INFO)
    info["first_boot"] = fmt_datetime(first_boot)
    info["last_seen"]  = fmt_datetime(datetime.now(tz=SL_TZ))
    root_ref.child(f"devices/{device_id}/device_info").set(info)
    print(f"  [device_info] written for {device_id}")


def write_current(root_ref, device_id: str, reading: dict):
    current = {
        "air_quality":  reading["air_quality"],
        "brightness":   reading["brightness_percent"],
        "co2":          reading["co2_ppm"],
        "voc":          reading["voc_ppm"],
        "lux":          reading["lux"],
        "motion":       reading["motion_detected"],
        "temperature":  reading["temperature_c"],
        "humidity":     reading["humidity_percent"],
        "air_moisture": reading["air_moisture_percent"],
        "last_update":  reading["time"],
    }
    root_ref.child(f"devices/{device_id}/current").set(current)


def write_reading(root_ref, device_id: str, ts_key: str, reading: dict):
    root_ref.child(f"devices/{device_id}/readings/{ts_key}").set(reading)


def write_air_quality(root_ref, device_id: str, date_str: str, ts_key: str, reading: dict):
    payload = {
        "co2":       reading["co2_ppm"],
        "voc":       reading["voc_ppm"],
        "timestamp": reading["timestamp"],
        "date_time": f"{reading['date']} {reading['time']}",
    }
    root_ref.child(f"devices/{device_id}/air_quality_data/{date_str}/{ts_key}").set(payload)


def write_temperature(root_ref, device_id: str, date_str: str, ts_key: str, reading: dict):
    payload = {
        "value":     reading["temperature_c"],
        "timestamp": reading["timestamp"],
        "date_time": f"{reading['date']} {reading['time']}",
        "unit":      "°C",
    }
    root_ref.child(f"devices/{device_id}/temperature_data/{date_str}/{ts_key}").set(payload)


def write_humidity(root_ref, device_id: str, date_str: str, ts_key: str, reading: dict):
    payload = {
        "value":     reading["humidity_percent"],
        "timestamp": reading["timestamp"],
        "date_time": f"{reading['date']} {reading['time']}",
        "unit":      "%",
    }
    root_ref.child(f"devices/{device_id}/humidity_data/{date_str}/{ts_key}").set(payload)


def write_light(root_ref, device_id: str, date_str: str, ts_key: str, reading: dict):
    payload = {
        "brightness": reading["brightness_percent"],
        "lux":        reading["lux"],
        "raw":        reading["light_raw"],
        "timestamp":  reading["timestamp"],
        "date_time":  f"{reading['date']} {reading['time']}",
    }
    root_ref.child(f"devices/{device_id}/light_data/{date_str}/{ts_key}").set(payload)


def write_motion(root_ref, device_id: str, date_str: str, ts_key: str, reading: dict):
    if not reading["motion_detected"]:
        return
    payload = {
        "detected":  True,
        "timestamp": reading["timestamp"],
        "date_time": f"{reading['date']} {reading['time']}",
    }
    root_ref.child(f"devices/{device_id}/motion_data/{date_str}/{ts_key}").set(payload)


def maybe_write_alert(root_ref, device_id: str, reading: dict):
    """Raise an alert when sensor values cross thresholds (mirrors app detection logic)."""
    alerts = []

    temp   = reading["temperature_c"]
    hum    = reading["humidity_percent"]
    moist  = reading["air_moisture_percent"]
    co2    = reading["co2_ppm"]
    voc    = reading["voc_ppm"]
    lux    = reading["lux"]
    motion = reading["motion_detected"]

    # ---- High-priority checks (matches app order) ----
    if temp > 25:
        alerts.append(("High Temperature",
                        f"High Temp: {temp}°C — Risk of degradation; color may darken."))
    if hum > 85:
        alerts.append(("High Humidity",
                        f"High Humidity: {hum}% — Risk of mold growth."))
    if moist > 55:
        alerts.append(("High Moisture Level",
                        f"High Moisture: {moist}% — Risk of cinnamon spoilage."))
    if co2 > 800 or voc > 400:
        alerts.append(("Poor Air Quality",
                        f"CO2={co2:.0f}ppm VOC={voc:.0f}ppm — Risk of contamination or poor ventilation."))
    if lux > 150:
        alerts.append(("Unexpected Light Level",
                        f"High Light: {lux:.0f} lux — Risk of bleaching; color may fade."))
    if motion:
        alerts.append(("Motion Detected",
                        "Motion detected — Risk of pests or unauthorized access."))

    # ---- Low-priority checks ----
    if temp < 20:
        alerts.append(("Low Temperature",
                        f"Low Temp: {temp}°C — Risk of condensation during fluctuation."))
    if hum < 60:
        alerts.append(("Low Humidity",
                        f"Low Humidity: {hum}% — Risk of over-drying and aroma loss."))
    if moist < 45:
        alerts.append(("Low Moisture Level",
                        f"Low Moisture: {moist}% — Risk of excessive dryness and weight loss."))
    if lux < 20:
        alerts.append(("Very Low Light Level",
                        f"Very Low Light: {lux:.0f} lux — Risk of hidden defects during inspection."))

    for alert_type, message in alerts:
        ts_key = str(reading["timestamp"])
        payload = {
            "device_id":    device_id,
            "timestamp":    reading["timestamp"],
            "date_time":    f"{reading['date']} {reading['time']}",
            "alert_type":   alert_type,
            "message":      message,
            "temperature":  reading["temperature_c"],
            "humidity":     reading["humidity_percent"],
            "moisture":     reading["air_moisture_percent"],
            "co2":          reading["co2_ppm"],
            "voc":          reading["voc_ppm"],
            "lux":          reading["lux"],
            "motion":       reading["motion_detected"],
            "location":     "Cinnamon Warehouse",
        }
        root_ref.child(f"devices/{device_id}/alerts/{ts_key}").set(payload)


# ---------------------------------------------------------------------------
# Main seeder
# ---------------------------------------------------------------------------

def seed(days: int, interval_seconds: int, device_id: str):
    print(f"\nCinnamon Warehouse Firebase Seeder")
    print(f"  Device   : {device_id}")
    print(f"  Days     : {days}")
    print(f"  Interval : {interval_seconds}s")
    print(f"  DB URL   : {DATABASE_URL}\n")

    # Initialise Firebase Admin SDK
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
    firebase_admin.initialize_app(cred, {"databaseURL": DATABASE_URL})
    root = db.reference("/")

    # Write device info once on startup (like ESP32 sendDeviceInfoToFirebase)
    boot_time = datetime.now(tz=SL_TZ)
    write_device_info(root, device_id, boot_time)

    count = 0
    print(f"Running — sending every {interval_seconds}s (Ctrl+C to stop)\n")

    while True:
        # Current time in GMT+5:30, matching ESP32 NTP local time
        now      = datetime.now(tz=SL_TZ)
        date_str = fmt_date(now)

        # millis() since midnight — same as ESP32 uptime from boot at midnight
        midnight = now.replace(hour=0, minute=0, second=0, microsecond=0)
        uptime   = int((now - midnight).total_seconds() * 1000)

        reading = generate_reading(device_id, now, uptime)
        ts_key  = str(uptime)
        payload = {k: v for k, v in reading.items() if k != "_unix_ts"}

        write_reading     (root, device_id, ts_key, payload)
        write_air_quality (root, device_id, date_str, ts_key, payload)
        write_temperature (root, device_id, date_str, ts_key, payload)
        write_humidity    (root, device_id, date_str, ts_key, payload)
        write_light       (root, device_id, date_str, ts_key, payload)
        write_motion      (root, device_id, date_str, ts_key, payload)
        maybe_write_alert (root, device_id, payload)
        write_current     (root, device_id, payload)

        count += 1
        print(f"  [{count}] {fmt_datetime(now)}  uptime={uptime}ms  "
              f"T={payload['temperature_c']}°C  H={payload['humidity_percent']}%  "
              f"CO2={payload['co2_ppm']}ppm")

        time.sleep(interval_seconds)


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(
        description="Seed Firebase RTDB with cinnamon-warehouse sensor data"
    )
    parser.add_argument(
        "--days", type=int, default=7,
        help="Number of past days to generate data for (default: 7)"
    )
    parser.add_argument(
        "--interval", type=int, default=30,
        help="Seconds between readings (default: 30, matches ESP32 FIREBASE_UPDATE_INTERVAL)"
    )
    parser.add_argument(
        "--device-id", type=str, default="249627E81F84",
        help="Device ID to use (default: 249627E81F84)"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    seed(
        days=args.days,
        interval_seconds=args.interval,
        device_id=args.device_id,
    )
