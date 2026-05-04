/**
 * Cinnamon Warehouse Storage Thresholds
 * Optimal conditions for cinnamon quality preservation
 */

// Temperature thresholds (°C)
export const TEMP_THRESHOLDS = {
  optimal: { min: 15, max: 32 },
  acceptable: { min: 10, max: 28 },
  critical: { min: 5, max: 35 },
};

export function getTempStatus(value) {
  if (value === null || value === undefined) return { label: "No Data", color: "#999", severity: "none" };
  if (value >= TEMP_THRESHOLDS.optimal.min && value <= TEMP_THRESHOLDS.optimal.max) {
    return { label: "Optimal", color: "#00B894", severity: "good" };
  }
  if (value >= TEMP_THRESHOLDS.acceptable.min && value <= TEMP_THRESHOLDS.acceptable.max) {
    return { label: "Acceptable", color: "#F39C12", severity: "warning" };
  }
  return { label: "Critical", color: "#FF6B6B", severity: "critical" };
}

// Humidity thresholds (%)
export const HUMIDITY_THRESHOLDS = {
  optimal: { min: 60, max: 70 },
  acceptable: { min: 50, max: 80 },
  critical: { min: 30, max: 90 },
};

export function getHumidityStatus(value) {
  if (value === null || value === undefined) return { label: "No Data", color: "#999", severity: "none" };
  if (value >= HUMIDITY_THRESHOLDS.optimal.min && value <= HUMIDITY_THRESHOLDS.optimal.max) {
    return { label: "Optimal", color: "#00B894", severity: "good" };
  }
  if (value >= HUMIDITY_THRESHOLDS.acceptable.min && value <= HUMIDITY_THRESHOLDS.acceptable.max) {
    return { label: "Acceptable", color: "#F39C12", severity: "warning" };
  }
  return { label: "Critical", color: "#FF6B6B", severity: "critical" };
}

// CO2 thresholds (ppm)
export const CO2_THRESHOLDS = {
  optimal: { min: 300, max: 500 },
  acceptable: { min: 200, max: 1000 },
  critical: { min: 0, max: 2000 },
};

export function getCO2Status(value) {
  if (value === null || value === undefined) return { label: "No Data", color: "#999", severity: "none" };
  if (value >= CO2_THRESHOLDS.optimal.min && value <= CO2_THRESHOLDS.optimal.max) {
    return { label: "Optimal", color: "#00B894", severity: "good" };
  }
  if (value >= CO2_THRESHOLDS.acceptable.min && value <= CO2_THRESHOLDS.acceptable.max) {
    return { label: "Acceptable", color: "#F39C12", severity: "warning" };
  }
  return { label: "Critical", color: "#FF6B6B", severity: "critical" };
}

// VOC thresholds (ppb - parts per billion)
export const VOC_THRESHOLDS = {
  optimal: { min: 0, max: 300 },
  acceptable: { min: 0, max: 500 },
  critical: { min: 0, max: 1000 },
};

export function getVOCStatus(value) {
  if (value === null || value === undefined) return { label: "No Data", color: "#999", severity: "none" };
  if (value >= VOC_THRESHOLDS.optimal.min && value <= VOC_THRESHOLDS.optimal.max) {
    return { label: "Optimal", color: "#00B894", severity: "good" };
  }
  if (value >= VOC_THRESHOLDS.acceptable.min && value <= VOC_THRESHOLDS.acceptable.max) {
    return { label: "Acceptable", color: "#F39C12", severity: "warning" };
  }
  return { label: "Critical", color: "#FF6B6B", severity: "critical" };
}

// Light thresholds (lux)
export const LIGHT_THRESHOLDS = {
  optimal: { min: 0, max: 100 },
  acceptable: { min: 0, max: 300 },
  critical: { min: 0, max: 1000 },
};

export function getLightStatus(value) {
  if (value === null || value === undefined) return { label: "No Data", color: "#999", severity: "none" };
  if (value >= LIGHT_THRESHOLDS.optimal.min && value <= LIGHT_THRESHOLDS.optimal.max) {
    return { label: "Optimal", color: "#00B894", severity: "good" };
  }
  if (value >= LIGHT_THRESHOLDS.acceptable.min && value <= LIGHT_THRESHOLDS.acceptable.max) {
    return { label: "Acceptable", color: "#F39C12", severity: "warning" };
  }
  return { label: "Critical", color: "#FF6B6B", severity: "critical" };
}

// Motion detection (boolean)
export function getMotionStatus(value) {
  if (value === null || value === undefined) return { label: "No Data", color: "#999", severity: "none" };
  if (value === false || value === 0) {
    return { label: "No Motion", color: "#00B894", severity: "good" };
  }
  return { label: "Motion Detected", color: "#F39C12", severity: "warning" };
}

// Air Quality status (composite of CO2 + VOC)
export function getAirQualityStatus(co2Value) {
  if (co2Value === null || co2Value === undefined) return { label: "No Data", color: "#999", severity: "none" };
  if (co2Value <= 500) {
    return { label: "Good", color: "#00B894", severity: "good" };
  }
  if (co2Value <= 1000) {
    return { label: "Fair", color: "#F39C12", severity: "warning" };
  }
  return { label: "Poor", color: "#FF6B6B", severity: "critical" };
}

// ──────────────────────────────────────────────────────────────────────────────
// Comparison Engine
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Compare sensor values against thresholds
 * Returns an object with deviations and recommendations
 */
export function compareAgainstThresholds(sensorData) {
  const deviations = [];
  let overallRiskLevel = "optimal"; // optimal, warning, critical

  // Temperature
  if (sensorData.temperature !== null && sensorData.temperature !== undefined) {
    const tempStatus = getTempStatus(sensorData.temperature);
    if (tempStatus.severity !== "good") {
      deviations.push({
        sensor: "Temperature",
        value: sensorData.temperature.toFixed(1),
        unit: "°C",
        status: tempStatus.label,
        severity: tempStatus.severity,
        optimal: `${TEMP_THRESHOLDS.optimal.min}-${TEMP_THRESHOLDS.optimal.max}°C`,
      });
      if (tempStatus.severity === "critical") overallRiskLevel = "critical";
      else if (overallRiskLevel !== "critical") overallRiskLevel = "warning";
    }
  }

  // Humidity
  if (sensorData.humidity !== null && sensorData.humidity !== undefined) {
    const humidStatus = getHumidityStatus(sensorData.humidity);
    if (humidStatus.severity !== "good") {
      deviations.push({
        sensor: "Humidity",
        value: sensorData.humidity.toFixed(1),
        unit: "%",
        status: humidStatus.label,
        severity: humidStatus.severity,
        optimal: `${HUMIDITY_THRESHOLDS.optimal.min}-${HUMIDITY_THRESHOLDS.optimal.max}%`,
      });
      if (humidStatus.severity === "critical") overallRiskLevel = "critical";
      else if (overallRiskLevel !== "critical") overallRiskLevel = "warning";
    }
  }

  // CO2
  if (sensorData.co2 !== null && sensorData.co2 !== undefined) {
    const co2Status = getCO2Status(sensorData.co2);
    if (co2Status.severity !== "good") {
      deviations.push({
        sensor: "CO₂ Level",
        value: sensorData.co2.toFixed(0),
        unit: "ppm",
        status: co2Status.label,
        severity: co2Status.severity,
        optimal: `${CO2_THRESHOLDS.optimal.min}-${CO2_THRESHOLDS.optimal.max}ppm`,
      });
      if (co2Status.severity === "critical") overallRiskLevel = "critical";
      else if (overallRiskLevel !== "critical") overallRiskLevel = "warning";
    }
  }

  // VOC
  if (sensorData.voc !== null && sensorData.voc !== undefined) {
    const vocStatus = getVOCStatus(sensorData.voc);
    if (vocStatus.severity !== "good") {
      deviations.push({
        sensor: "VOC Level",
        value: sensorData.voc.toFixed(0),
        unit: "ppb",
        status: vocStatus.label,
        severity: vocStatus.severity,
        optimal: `${VOC_THRESHOLDS.optimal.min}-${VOC_THRESHOLDS.optimal.max}ppb`,
      });
      if (vocStatus.severity === "critical") overallRiskLevel = "critical";
      else if (overallRiskLevel !== "critical") overallRiskLevel = "warning";
    }
  }

  // Light
  if (sensorData.light !== null && sensorData.light !== undefined) {
    const lightStatus = getLightStatus(sensorData.light);
    if (lightStatus.severity !== "good") {
      deviations.push({
        sensor: "Light Level",
        value: sensorData.light.toFixed(0),
        unit: "lux",
        status: lightStatus.label,
        severity: lightStatus.severity,
        optimal: `${LIGHT_THRESHOLDS.optimal.min}-${LIGHT_THRESHOLDS.optimal.max}lux`,
      });
      if (lightStatus.severity === "critical") overallRiskLevel = "critical";
      else if (overallRiskLevel !== "critical") overallRiskLevel = "warning";
    }
  }

  return {
    overallRiskLevel,
    deviationCount: deviations.length,
    deviations,
    isOptimal: deviations.length === 0,
  };
}

/**
 * Get recommendation based on sensor comparison
 */
export function getRecommendation(sensorData) {
  const comparison = compareAgainstThresholds(sensorData);

  if (comparison.isOptimal) {
    return {
      riskLabel: "All Optimal",
      riskType: "Storage Conditions Perfect",
      consequence: "Your cinnamon storage is in optimal condition with all parameters within acceptable ranges. | ඔබේ දල්දා සිතුවම ගබඩා සර්ව-උසස් තත්ත්වයෙහි ඉන්නෙන අතර සියලු පරාමිතීන් පිළිගත හැකි පරාසයට පවතී.",
      actionPlan: "Continue monitoring regularly to maintain these conditions. | මෙම තත්ත්වයන් පවත්වා ගැනීම සඳහා නිතිපතා පෙරීක්ෂා කරන්න.",
    };
  }

  let riskLabel = "Medium Risk";
  let riskType = "Mixed Parameter Deviations";
  let consequence = "";
  let actionPlan = "";

  const criticalCount = comparison.deviations.filter((d) => d.severity === "critical").length;

  if (criticalCount > 0) {
    riskLabel = "High Risk";
    riskType = comparison.deviations
      .filter((d) => d.severity === "critical")
      .map((d) => d.sensor)
      .join(" + ");

    consequence = `Critical deviation detected in ${riskType}. This poses immediate risk to cinnamon quality and shelf life. | ${riskType} හි විවිධ අපගමනයක් අනාවරණය වී ඇත. මෙය දල්දා ගුණාත්මකතාවට සහ ශේල්ෆ් ඉතුරු කිරීමේ කාලයට ක්ෂණික අවදානමක් ඇතිකරයි.`;
    actionPlan = `Immediate action required:\n${comparison.deviations
      .filter((d) => d.severity === "critical")
      .map((d) => getActionForDeviation(d))
      .join("\n")}`;
  } else {
    riskLabel = "Medium Risk";
    riskType = comparison.deviations.map((d) => d.sensor).join(" + ");

    consequence = `Parameters out of optimal range: ${riskType}. This may gradually affect cinnamon quality if not corrected. | පරාමිතීන් සර්ව-උසස් පරාසයට ඉතිරිව ඇත: ${riskType}. නිවැරදි කරන ලද පසු මෙය දල්දා ගුණාත්මකතාවට ක්රමයෙන් බලපෑමක් ඇතිකරයි.`;
    actionPlan = `Recommended adjustments:\n${comparison.deviations
      .map((d) => getActionForDeviation(d))
      .join("\n")}`;
  }

  return {
    riskLabel,
    riskType,
    consequence,
    actionPlan,
    deviations: comparison.deviations,
  };
}

/**
 * Get specific action for a sensor deviation
 */
function getActionForDeviation(deviation) {
  const { sensor, value, severity } = deviation;
  const urgentEN = severity === "critical" ? "🔴 URGENT:" : "🟡 Adjust:";
  const urgentSI = severity === "critical" ? "🔴 අවදානම්:" : "🟡 සකස් කරන්න:";

  if (sensor === "Temperature") {
    if (parseFloat(value) < TEMP_THRESHOLDS.optimal.min) {
      return `${urgentEN} Increase temperature to ${TEMP_THRESHOLDS.optimal.min}-${TEMP_THRESHOLDS.optimal.max}°C (currently ${value}°C) | ${urgentSI} උෂ්ණත්වය ${TEMP_THRESHOLDS.optimal.min}-${TEMP_THRESHOLDS.optimal.max}°C දක්වා වැඩි කරන්න (දැනට ${value}°C)`;
    } else {
      return `${urgentEN} Decrease temperature to ${TEMP_THRESHOLDS.optimal.min}-${TEMP_THRESHOLDS.optimal.max}°C (currently ${value}°C) | ${urgentSI} උෂ්ණත්වය ${TEMP_THRESHOLDS.optimal.min}-${TEMP_THRESHOLDS.optimal.max}°C දක්වා අඩු කරන්න (දැනට ${value}°C)`;
    }
  }

  if (sensor === "Humidity") {
    if (parseFloat(value) < HUMIDITY_THRESHOLDS.optimal.min) {
      return `${urgentEN} Increase humidity to ${HUMIDITY_THRESHOLDS.optimal.min}-${HUMIDITY_THRESHOLDS.optimal.max}% (currently ${value}%) | ${urgentSI} ආර්ද්‍රතාවය ${HUMIDITY_THRESHOLDS.optimal.min}-${HUMIDITY_THRESHOLDS.optimal.max}% දක්වා වැඩි කරන්න (දැනට ${value}%)`;
    } else {
      return `${urgentEN} Decrease humidity to ${HUMIDITY_THRESHOLDS.optimal.min}-${HUMIDITY_THRESHOLDS.optimal.max}% (currently ${value}%) | ${urgentSI} ආර්ද්‍රතාවය ${HUMIDITY_THRESHOLDS.optimal.min}-${HUMIDITY_THRESHOLDS.optimal.max}% දක්වා අඩු කරන්න (දැනට ${value}%)`;
    }
  }

  if (sensor === "CO₂ Level") {
    return `${urgentEN} Improve air circulation to maintain CO₂ at ${CO2_THRESHOLDS.optimal.min}-${CO2_THRESHOLDS.optimal.max}ppm (currently ${value}ppm) | ${urgentSI} කාබන් ඩයොක්සයිඩ් ${CO2_THRESHOLDS.optimal.min}-${CO2_THRESHOLDS.optimal.max}ppm වලට පවත්වා ගැනීමට වායු සංසරණය වැඩි දියුණු කරන්න (දැනට ${value}ppm)`;
  }

  if (sensor === "VOC Level") {
    return `${urgentEN} Reduce VOC levels to ${VOC_THRESHOLDS.optimal.min}-${VOC_THRESHOLDS.optimal.max}ppb (currently ${value}ppb) | ${urgentSI} වාෂ්ප මට්ටම් ${VOC_THRESHOLDS.optimal.min}-${VOC_THRESHOLDS.optimal.max}ppb දක්වා අඩු කරන්න (දැනට ${value}ppb)`;
  }

  if (sensor === "Light Level") {
    return `${urgentEN} Reduce light exposure to ${LIGHT_THRESHOLDS.optimal.min}-${LIGHT_THRESHOLDS.optimal.max}lux (currently ${value}lux) | ${urgentSI} ආලෝක නිරාවරණය ${LIGHT_THRESHOLDS.optimal.min}-${LIGHT_THRESHOLDS.optimal.max}lux දක්වා අඩු කරන්න (දැනට ${value}lux)`;
  }

  return `${urgentEN} ${sensor} is out of range | ${urgentSI} ${sensor} පරාසයට ඉතිරිව ඇත`;
}
