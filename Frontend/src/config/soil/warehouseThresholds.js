// Warehouse sensor thresholds — single source of truth
// Used by SensorScreen.js and DashboardScreen.js

export const THRESHOLDS = {
  temperature: { low: 18, high: 24 },         // °C  — optimal 18–24°C
  humidity:    { low: 60, high: 70 },          // %RH — optimal 60–70%
  co2:         { warning: 600, danger: 1000 }, // ppm — normal < 600, high 600–1000, danger > 1000
  voc:         { warning: 500 },               // ppm — safe < 500
  lux:         { dark: 50, bright: 50000 },    // lux — indirect 50–50,000
};

// ─── Status helpers ────────────────────────────────────────────────────────────

export function getTempStatus(val) {
  if (val === null) return { label: "No Data | දත්ත නැත", color: "#999" };
  if (val < THRESHOLDS.temperature.low)  return { label: "Too Cold | අධික සීතල", color: "#74B9FF" };
  if (val > THRESHOLDS.temperature.high) return { label: "Too Hot | අධික උෂ්ණ",  color: "#FF6B6B" };
  return { label: "Normal | සාමාන්‍ය", color: "#00B894" };
}

export function getHumidityStatus(val) {
  if (val === null) return { label: "No Data | දත්ත නැත", color: "#999" };
  if (val < THRESHOLDS.humidity.low)  return { label: "Too Dry | අධික වියළි",  color: "#FF6B6B" };
  if (val > THRESHOLDS.humidity.high) return { label: "Too Humid | අධික තෙත", color: "#FF6B6B" };
  return { label: "Optimal | ප්‍රශස්ත", color: "#00B894" };
}

export function getCO2Status(val) {
  if (val === null) return { label: "No Data | දත්ත නැත", color: "#999" };
  if (val >= THRESHOLDS.co2.danger)  return { label: "Danger | අනතුර",    color: "#FF6B6B" };
  if (val >= THRESHOLDS.co2.warning) return { label: "High | ඉහළ",        color: "#FDCB6E" };
  return { label: "Normal | සාමාන්‍ය", color: "#00B894" };
}

export function getVOCStatus(val) {
  if (val === null) return { label: "No Data | දත්ත නැත", color: "#999" };
  if (val >= THRESHOLDS.voc.warning) return { label: "High | ඉහළ",       color: "#FF6B6B" };
  return { label: "Safe | ආරක්ෂිත", color: "#00B894" };
}

export function getLightStatus(lux) {
  if (lux === null) return { label: "No Data | දත්ත නැත", color: "#999" };
  if (lux < THRESHOLDS.lux.dark)    return { label: "Dark | අඳුරු",         color: "#FDCB6E" };
  if (lux > THRESHOLDS.lux.bright)  return { label: "Bright | දීප්තිමත්",   color: "#FDCB6E" };
  return { label: "Indirect | වක්‍ර", color: "#00B894" };
}

export function getMotionStatus(detected) {
  if (detected === null) return { label: "No Data | දත්ත නැත", color: "#999" };
  if (detected) return { label: "Detected | සොයාගන්නා ලදී", color: "#FF6B6B" };
  return { label: "Clear | පැහැදිලි", color: "#00B894" };
}

export function getAirQualityStatus(co2) {
  if (co2 === null) return { label: "No Data | දත්ත නැත", color: "#999" };
  if (co2 >= THRESHOLDS.co2.danger)  return { label: "Poor | දුර්වල",       color: "#FF6B6B" };
  if (co2 >= THRESHOLDS.co2.warning) return { label: "Moderate | මධ්‍යස්ථ", color: "#FDCB6E" };
  return { label: "Good | හොඳ", color: "#00B894" };
}
