import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";
import * as Notifications from "expo-notifications";
import { ref, onValue, off } from "firebase/database";
import { database as warehouseDb } from "../config/warehouse/firebase";
import { getRecommendation } from "../config/warehouse/warehouseThresholds";
import { getMLActionPlan } from "../services/warehouseQualityApi";
import { getCSVActionPlan } from "../config/warehouse/warehouseActionPlans";

const DEVICE_ID = "249627E81F84";

function subscribeLatest(path, callback) {
  const dbRef = ref(warehouseDb, path);
  console.log("🔗 Subscribing to:", path);

  const listener = onValue(
    dbRef,
    (snap) => {
      const data = snap.val();
      console.log(`📦 Data from ${path}:`, data);

      if (!data) {
        console.warn(`⚠️ No data at ${path}`);
        callback(null);
        return;
      }

      const dates = Object.keys(data).sort();
      const latestDate = dates[dates.length - 1];

      if (!latestDate || !data[latestDate]) {
        callback(null);
        return;
      }

      const timestamps = Object.keys(data[latestDate]).sort(
        (a, b) => Number(a) - Number(b)
      );
      const latestTs = timestamps[timestamps.length - 1];

      if (!latestTs || !data[latestDate][latestTs]) {
        callback(null);
        return;
      }

      const entry = data[latestDate][latestTs];
      console.log(`✅ Latest from ${path}:`, entry);
      callback(entry);
    },
    (error) => {
      console.error(`❌ Firebase error at ${path}:`, error);
      callback(null);
    }
  );

  return () => off(dbRef, "value", listener);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function getPriorityStyles(riskLabel) {
  if (riskLabel === "High Risk") {
    return {
      bg: "rgba(255,107,107,0.12)",
      color: "#FF6B6B",
      gradient: ["#FF6B6B", "#EE5A5A"],
      priority: "high",
    };
  }

  if (riskLabel === "Medium Risk") {
    return {
      bg: "rgba(253,203,110,0.15)",
      color: "#F39C12",
      gradient: ["#FDCB6E", "#F39C12"],
      priority: "medium",
    };
  }

  return {
    bg: "rgba(0,184,148,0.12)",
    color: "#00B894",
    gradient: ["#00B894", "#00A085"],
    priority: "low",
  };
}

function riskTypeIcon(riskType) {
  const t = (riskType ?? "").toLowerCase();

  if (t.includes("temperature")) return "thermometer";
  if (t.includes("humidity")) return "water";
  if (t.includes("co2") || t.includes("air") || t.includes("voc")) {
    return "cloud";
  }
  if (t.includes("light")) return "sunny";
  if (t.includes("motion")) return "walk";

  return "warning";
}

function translateActionPlan(actionPlan) {
  if (!actionPlan) return actionPlan;

  const translations = {
    "Increase temperature": "උෂ්ණත්වය වැඩි කරන්න",
    "Decrease temperature": "උෂ්ණත්වය අඩු කරන්න",
    "Increase humidity": "ආර්ද්‍රතාවය වැඩි කරන්න",
    "Decrease humidity": "ආර්ද්‍රතාවය අඩු කරන්න",
    "Improve air circulation": "වායු සංසරණය වැඩි දියුණු කරන්න",
    "Improve ventilation": "වාතාශ්‍රයනය වැඩි දියුණු කරන්න",
    "Reduce VOC": "වාෂ්ප අඩු කරන්න",
    "Reduce CO2": "කාබන් ඩයොක්සයිඩ් අඩු කරන්න",
    "Reduce light": "ආලෝකය අඩු කරන්න",
    "air quality": "වායු ගුණාත්මකතාවය",
    "air circulation": "වායු සංසරණය",
    temperature: "උෂ්ණත්වය",
    humidity: "ආර්ද්‍රතාවය",
    moisture: "තෙතමනය",
    CO2: "කාබන් ඩයොක්සයිඩ්",
    co2: "කාබන් ඩයොක්සයිඩ්",
    VOC: "වාෂ්ප",
    voc: "වාෂ්ප",
    light: "ආලෝකය",
    storage: "ගබඩා",
    cinnamon: "කුරුදු",
    increase: "වැඩි කරන්න",
    decrease: "අඩු කරන්න",
    reduce: "අඩු කරන්න",
    maintain: "පවත්වා ගෙන යන්න",
    ensure: "නිශ්චිත කරන්න",
    optimal: "සර්ව-උසස්",
    critical: "බරපතල",
    high: "ඉහළ",
    low: "පහත්",
    level: "මට්ටම",
    immediately: "වහාම",
  };

  let result = actionPlan;

  Object.entries(translations)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([english, sinhala]) => {
      const regex = new RegExp(`\\b${english}\\b`, "gi");
      result = result.replace(regex, `${english} | ${sinhala}`);
    });

  return result;
}

const parseActionPlan = (actionPlanString) => {
  if (!actionPlanString) return [];

  const actions = actionPlanString
    .split(/\./)
    .flatMap((item) => item.split(/,/))
    .map((action) => action.trim())
    .filter(
      (action) =>
        action.length > 0 &&
        action !== "No action required" &&
        action !== "No action required."
    )
    .map((action) => ({
      title: action.charAt(0).toUpperCase() + action.slice(1),
      description: getActionDescription(action),
    }));

  return actions;
};

const getActionDescription = (action) => {
  const actionLower = action.toLowerCase();

  if (
    actionLower.includes("temperature") &&
    actionLower.includes("stabilize")
  ) {
    return "Adjust storage to safe range gradually";
  }

  if (
    actionLower.includes("temperature") &&
    actionLower.includes("insulation")
  ) {
    return "Improve thermal storage properties";
  }

  if (
    actionLower.includes("ventilation") &&
    actionLower.includes("improve")
  ) {
    return "Enhance air circulation and exchange";
  }

  if (
    actionLower.includes("ventilation") &&
    actionLower.includes("reduce")
  ) {
    return "Lower air exchange rate";
  }

  if (
    actionLower.includes("humidity") ||
    actionLower.includes("dehumidifier")
  ) {
    return "Control moisture in storage area";
  }

  if (
    actionLower.includes("humidity") &&
    actionLower.includes("increase")
  ) {
    return "Raise relative humidity levels";
  }

  if (actionLower.includes("light")) return "Adjust or control lighting conditions";
  if (actionLower.includes("check") || actionLower.includes("inspect")) {
    return "Investigate current conditions";
  }
  if (actionLower.includes("leak")) return "Locate and address moisture sources";
  if (actionLower.includes("sensor")) return "Verify sensor accuracy";
  if (actionLower.includes("filter")) return "Maintain air filtration systems";
  if (actionLower.includes("cover")) return "Protect products from light";
  if (actionLower.includes("motion")) return "Security check required";
  if (actionLower.includes("cooling")) return "Activate cooling systems";
  if (actionLower.includes("airflow")) return "Adjust air movement patterns";

  return "Take corrective action";
};

const SuggestionsScreen = ({ navigation }) => {
  const [sensorData, setSensorData] = useState({
    temperature: null,
    humidity: null,
    co2: null,
    voc: null,
    light: null,
    motion_detected: false,
  });

  const [recommendation, setRecommendation] = useState(null);
  const [mlActionPlan, setMLActionPlan] = useState(null);
  const [mlLoading, setMLLoading] = useState(false);
  const [csvActionPlan, setCsvActionPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [visibleItems, setVisibleItems] = useState([]);
  const [parsedActionItems, setParsedActionItems] = useState([]);

  const animationsRef = useRef([]);
  const animationTimersRef = useRef([]);
  const unsubRef = useRef([]);
  const permGranted = useRef(false);
  const lastRiskKey = useRef(null);
  const latestSensorsRef = useRef({});

  useEffect(() => {
    Notifications.requestPermissionsAsync().then(({ status }) => {
      permGranted.current = status === "granted";
    });
  }, []);

  useEffect(() => {
    const basePath = `devices/${DEVICE_ID}`;
    let loadedSources = new Set();

    const updateSensorValue = (key, value) => {
      latestSensorsRef.current = {
        ...latestSensorsRef.current,
        [key]: value,
      };

      setSensorData((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

    const markLoaded = (sourceName) => {
      loadedSources.add(sourceName);
      console.log(`📊 Loaded ${loadedSources.size}/5`);

      if (loadedSources.size >= 5) {
        const sensors = latestSensorsRef.current;

        if (Object.keys(sensors).length > 0) {
          setLoading(false);

          const rec = getRecommendation(sensors);
          setRecommendation(rec);
          console.log("💡 Recommendation:", rec);

          const riskKey = `${rec.riskLabel}|${rec.riskType}`;

          if (permGranted.current && riskKey !== lastRiskKey.current) {
            lastRiskKey.current = riskKey;

            Notifications.scheduleNotificationAsync({
              content: {
                title: `🌿 ${rec.riskLabel}`,
                body: rec.consequence?.substring(0, 100) || "Warehouse alert",
                sound: true,
              },
              trigger: null,
            });
          }
        }
      }
    };

    const unsubTemp = subscribeLatest(`${basePath}/temperature_data`, (entry) => {
      if (entry) {
        updateSensorValue("temperature", entry.value);
      }
      markLoaded("temperature");
    });

    const unsubHumid = subscribeLatest(`${basePath}/humidity_data`, (entry) => {
      if (entry) {
        updateSensorValue("humidity", entry.value);
      }
      markLoaded("humidity");
    });

    const unsubAir = subscribeLatest(`${basePath}/air_quality_data`, (entry) => {
      if (entry) {
        latestSensorsRef.current = {
          ...latestSensorsRef.current,
          co2: entry.co2,
          voc: entry.voc,
        };

        setSensorData((prev) => ({
          ...prev,
          co2: entry.co2,
          voc: entry.voc,
        }));
      }
      markLoaded("air");
    });

    const unsubLight = subscribeLatest(`${basePath}/light_data`, (entry) => {
      if (entry) {
        updateSensorValue("light", entry.lux);
        setLastUpdate(new Date());
      }
      markLoaded("light");
    });

    const motionRef = ref(warehouseDb, `${basePath}/readings`);

    const motionListener = onValue(motionRef, (snap) => {
      const data = snap.val();

      if (data) {
        const keys = Object.keys(data).sort((a, b) => Number(a) - Number(b));
        const latest = data[keys[keys.length - 1]];
        const motionDetected = latest?.motion_detected ?? false;

        updateSensorValue("motion_detected", motionDetected);
        console.log("🚨 Motion Status:", motionDetected);
      }

      markLoaded("motion");
    });

    unsubRef.current = [
      unsubTemp,
      unsubHumid,
      unsubAir,
      unsubLight,
      () => off(motionRef, "value", motionListener),
    ];

    return () => {
      unsubRef.current.forEach((fn) => {
        if (fn) fn();
      });

      animationTimersRef.current.forEach((timer) => clearTimeout(timer));
      animationTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (recommendation && !recommendation.isOptimal) {
      const csvPlan = getCSVActionPlan(sensorData);
      setCsvActionPlan(csvPlan);
      console.log("📋 CSV Action Plan:", csvPlan);

      if (!csvPlan) {
        const fetchMLPlan = async () => {
          try {
            setMLLoading(true);
            console.log("🤖 Calling ML API with sensor data...");

            const result = await getMLActionPlan(sensorData);

            if (result.success) {
              console.log("✅ ML Action Plan received:", result.data);
              setMLActionPlan(result.data);
            } else {
              console.error("❌ ML API error:", result.error);
              setMLActionPlan(null);
            }
          } catch (error) {
            console.error("❌ ML Action Plan fetch failed:", error);
            setMLActionPlan(null);
          } finally {
            setMLLoading(false);
          }
        };

        fetchMLPlan();
      } else {
        setMLLoading(false);
        setMLActionPlan(null);
      }
    } else {
      setCsvActionPlan(null);
      setMLActionPlan(null);
      setMLLoading(false);
    }
  }, [recommendation, sensorData]);

  useEffect(() => {
    animationTimersRef.current.forEach((timer) => clearTimeout(timer));
    animationTimersRef.current = [];

    if (!csvActionPlan?.actionPlan) {
      setParsedActionItems([]);
      setVisibleItems([]);
      animationsRef.current = [];
      return;
    }

    const actionItems = parseActionPlan(csvActionPlan.actionPlan);
    setParsedActionItems(actionItems);
    setVisibleItems([]);

    if (!actionItems || actionItems.length === 0) {
      animationsRef.current = [];
      return;
    }

    animationsRef.current = actionItems.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
    }));

    actionItems.forEach((_, idx) => {
      const timer = setTimeout(() => {
        const animObj = animationsRef.current[idx];

        if (!animObj || !animObj.opacity || !animObj.translateY) {
          return;
        }

        setVisibleItems((prev) => {
          if (prev.includes(idx)) return prev;
          return [...prev, idx];
        });

        Animated.parallel([
          Animated.timing(animObj.opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animObj.translateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, idx * 200);

      animationTimersRef.current.push(timer);
    });

    return () => {
      animationTimersRef.current.forEach((timer) => clearTimeout(timer));
      animationTimersRef.current = [];
    };
  }, [csvActionPlan]);

  const ps = recommendation ? getPriorityStyles(recommendation.riskLabel) : null;

  const criticalCount =
    recommendation?.deviations?.filter((d) => d.severity === "critical")
      .length || 0;

  const warningCount =
    recommendation?.deviations?.filter((d) => d.severity === "warning")
      .length || 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Analyzing sensor data... | සංවේදක දත්ත විශ්ලේෂණය...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recommendation) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={40} color="#FF6B6B" />
          <Text style={styles.errorText}>Unable to load sensor data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={["#2E7D32", "#4CAF50", "#66BB6A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />

          <View style={styles.topBar}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>

              <View style={styles.headerTextContainer}>
                <View style={styles.greetingRow}>
                  <Text style={styles.greetingText}>
                    Smart Insights | බුද්ධිමත් අවබෝධය
                  </Text>
                </View>
                <Text style={styles.brandText}>Suggestions | යෝජනා</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={["#FF6B6B", "#EE5A5A"]}
                style={styles.summaryIconBg}
              >
                <Ionicons name="alert-circle" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{criticalCount}</Text>
              <Text style={styles.summaryLabel}>Critical | බරපතල</Text>
              <View
                style={[
                  styles.summaryIndicator,
                  { backgroundColor: "#FF6B6B" },
                ]}
              />
            </View>

            <View style={styles.summaryCard}>
              <LinearGradient
                colors={["#FDCB6E", "#F39C12"]}
                style={styles.summaryIconBg}
              >
                <Ionicons name="warning" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{warningCount}</Text>
              <Text style={styles.summaryLabel}>Warning | අවවාදය</Text>
              <View
                style={[
                  styles.summaryIndicator,
                  { backgroundColor: "#F39C12" },
                ]}
              />
            </View>

            <View style={styles.summaryCard}>
              <LinearGradient
                colors={["#00B894", "#00A085"]}
                style={styles.summaryIconBg}
              >
                <Ionicons name="checkmark-done" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>
                {recommendation?.deviations?.length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Total | මුළු</Text>
              <View
                style={[
                  styles.summaryIndicator,
                  { backgroundColor: "#00B894" },
                ]}
              />
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!recommendation.isOptimal && (
          <TouchableOpacity activeOpacity={0.9} style={styles.issuesCardWrapper}>
            <LinearGradient
              colors={ps.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.issuesCard}
            >
              <View style={styles.issuesContent}>
                <View style={styles.issuesIconContainer}>
                  <Ionicons name="warning" size={28} color="#FFF" />
                </View>

                <View style={styles.issuesTextContainer}>
                  <View style={styles.issuesTitleRow}>
                    <Text style={styles.issuesTitle}>
                      {recommendation.riskLabel}
                    </Text>
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentBadgeText}>
                        {ps.priority === "high" ? "URGENT" : "CAUTION"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.issuesSubtitle}>
                    {recommendation.riskType} • Cinnamon Warehouse
                  </Text>

                  {lastUpdate && (
                    <View style={styles.issuesLastUpdated}>
                      <View
                        style={[
                          styles.liveDot,
                          { backgroundColor: "#FFF", opacity: 0.7 },
                        ]}
                      />
                      <Text style={styles.issuesLastUpdatedText}>
                        Last updated: {lastUpdate.toLocaleTimeString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {recommendation.isOptimal && (
          <View style={styles.optimalCardWrapper}>
            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.optimalCard}
            >
              <View style={styles.optimalIconContainer}>
                <LinearGradient
                  colors={["#00B894", "#00A085", "#009975"]}
                  style={styles.optimalIconGradient}
                >
                  <Ionicons name="shield-checkmark" size={36} color="#FFF" />
                </LinearGradient>
              </View>

              <Text style={styles.optimalTitle}>All Parameters Optimal</Text>
              <Text style={styles.optimalTitleSinhala}>
                සියලු පරාමිතීන් සර්ව-උසස්
              </Text>
              <Text style={styles.optimalSubtitle}>
                Your cinnamon warehouse is in perfect condition. Continue
                monitoring to maintain optimal conditions.
              </Text>
            </LinearGradient>
          </View>
        )}

        {!recommendation.isOptimal && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Action Required | පියවර අවශ්‍යයි
              </Text>
            </View>

            <View style={styles.aiCard}>
              <LinearGradient
                colors={ps.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiCardHeader}
              >
                <View style={styles.aiCardHeaderRow}>
                  <View style={styles.aiCardIconCircle}>
                    <Ionicons
                      name={riskTypeIcon(recommendation.riskType)}
                      size={26}
                      color="#FFF"
                    />
                  </View>

                  <View style={styles.aiCardHeaderText}>
                    <Text style={styles.aiCardRiskType}>
                      {recommendation.riskType}
                    </Text>
                    <Text style={styles.aiCardRiskLabel}>
                      {recommendation.riskLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.aiMetricsRow}>
                  <View style={styles.aiMetricChip}>
                    <Ionicons
                      name="thermometer-outline"
                      size={12}
                      color="rgba(255,255,255,0.85)"
                    />
                    <Text style={styles.aiMetricChipValue}>
                      {sensorData.temperature != null
                        ? `${Number(sensorData.temperature).toFixed(1)}°C`
                        : "—"}
                    </Text>
                    <Text style={styles.aiMetricChipLabel}>Temp</Text>
                  </View>

                  <View style={styles.aiMetricChip}>
                    <Ionicons
                      name="water-outline"
                      size={12}
                      color="rgba(255,255,255,0.85)"
                    />
                    <Text style={styles.aiMetricChipValue}>
                      {sensorData.humidity != null
                        ? `${Number(sensorData.humidity).toFixed(1)}%`
                        : "—"}
                    </Text>
                    <Text style={styles.aiMetricChipLabel}>Humidity</Text>
                  </View>

                  <View style={styles.aiMetricChip}>
                    <Ionicons
                      name="cloud-outline"
                      size={12}
                      color="rgba(255,255,255,0.85)"
                    />
                    <Text style={styles.aiMetricChipValue}>
                      {sensorData.co2 != null
                        ? `${Number(sensorData.co2).toFixed(0)}ppm`
                        : "—"}
                    </Text>
                    <Text style={styles.aiMetricChipLabel}>CO₂</Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.aiCardBody}>
                <View style={styles.aiSection}>
                  <View style={styles.aiSectionHeader}>
                    <View
                      style={[
                        styles.aiSectionIconBg,
                        { backgroundColor: `${ps.color}18` },
                      ]}
                    >
                      <Ionicons
                        name="alert-circle"
                        size={15}
                        color={ps.color}
                      />
                    </View>

                    <Text
                      style={[styles.aiSectionTitle, { color: ps.color }]}
                    >
                      Impact | බලපෑම
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.aiSectionContent,
                      { borderLeftColor: ps.color },
                    ]}
                  >
                    <Text style={styles.aiSectionText}>
                      {recommendation.consequence}
                    </Text>
                    {csvActionPlan &&
                      csvActionPlan.reason_of_risk &&
                      csvActionPlan.reason_of_risk !== "no" && (
                        <View style={{ marginTop: 12 }}>
                          <Text
                            style={[
                              styles.aiSectionText,
                              {
                                fontWeight: "600",
                                color: ps.color,
                                marginBottom: 4,
                              },
                            ]}
                          >
                            Reasons of Risk:
                          </Text>
                          <Text style={styles.aiSectionText}>
                            {csvActionPlan.reason_of_risk}
                          </Text>
                        </View>
                      )}
                  </View>
                </View>

                <View style={styles.aiSection}>
                  <View style={styles.aiSectionHeader}>
                    <LinearGradient
                      colors={["#FFD700", "#FFA500"]}
                      style={styles.aiSectionIconBg}
                    >
                      <Ionicons name="bulb" size={15} color="#FFF" />
                    </LinearGradient>

                    <Text style={styles.aiSectionTitle}>
                      Recommendations | නිර්දේශ
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.aiActionContent,
                      {
                        backgroundColor: `${ps.color}0D`,
                        borderColor: `${ps.color}30`,
                      },
                    ]}
                  >
                    <Text style={styles.aiSectionText}>
                      {recommendation.actionPlan}
                    </Text>
                  </View>
                </View>

                {csvActionPlan ? (
                  <View style={styles.aiSection}>
                    <View style={styles.aiSectionHeader}>
                      <LinearGradient
                        colors={["#0EA5E9", "#0284C7"]}
                        style={styles.aiSectionIconBg}
                      >
                        <Ionicons name="document-text" size={15} color="#FFF" />
                      </LinearGradient>

                      <Text style={styles.aiSectionTitle}>
                        Risk Action Plan | අවදානම් ක්‍රියාකාරී සැලැස්ම
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.aiActionContent,
                        {
                          backgroundColor: "rgba(14,165,233,0.08)",
                          borderColor: "#0EA5E930",
                        },
                      ]}
                    >
                      <View style={{ marginBottom: 8 }}>
                        <Text
                          style={[
                            styles.aiSectionText,
                            {
                              fontWeight: "600",
                              color: "#0284C7",
                              marginBottom: 4,
                            },
                          ]}
                        >
                          Risk Detected: {csvActionPlan.reason}
                        </Text>
                        <View
                          style={{
                            height: 1,
                            backgroundColor: "#0EA5E930",
                            marginVertical: 8,
                          }}
                        />
                      </View>

                      {parsedActionItems && parsedActionItems.length > 0 ? (
                        <View>
                          {parsedActionItems.map((action, idx) => {
                            const actionIcons = [
                              "wind",
                              "water",
                              "water",
                              "search",
                            ];
                            const actionColors = [
                              "#0EA5E9",
                              "#0284C7",
                              "#1E40AF",
                              "#1D4ED8",
                            ];

                            if (!visibleItems.includes(idx)) return null;

                            const animObj = animationsRef.current[idx];

                            if (
                              !animObj ||
                              !animObj.opacity ||
                              !animObj.translateY
                            ) {
                              return null;
                            }

                            return (
                              <Animated.View
                                key={`action-${idx}`}
                                style={[
                                  styles.animatedActionItem,
                                  {
                                    opacity: animObj.opacity,
                                    transform: [
                                      {
                                        translateY: animObj.translateY,
                                      },
                                    ],
                                  },
                                ]}
                              >
                                <View style={styles.actionItemContainer}>
                                  <View
                                    style={[
                                      styles.actionItemIcon,
                                      {
                                        backgroundColor:
                                          actionColors[
                                            idx % actionColors.length
                                          ],
                                      },
                                    ]}
                                  >
                                    <Ionicons
                                      name={
                                        actionIcons[idx % actionIcons.length]
                                      }
                                      size={16}
                                      color="#FFF"
                                    />
                                  </View>

                                  <View style={styles.actionItemContent}>
                                    <Text style={styles.actionItemTitle}>
                                      {action.title}
                                    </Text>
                                    <Text style={styles.actionItemDesc}>
                                      {action.description}
                                    </Text>
                                  </View>

                                  <View
                                    style={[
                                      styles.actionItemNumber,
                                      {
                                        backgroundColor:
                                          actionColors[
                                            idx % actionColors.length
                                          ],
                                      },
                                    ]}
                                  >
                                    <Text style={styles.actionItemNumberText}>
                                      {idx + 1}
                                    </Text>
                                  </View>
                                </View>
                              </Animated.View>
                            );
                          })}
                        </View>
                      ) : (
                        <Text style={styles.aiSectionText}>
                          {translateActionPlan(csvActionPlan.actionPlan)}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : mlLoading ? (
                  <View style={styles.aiSection}>
                    <View style={styles.aiSectionHeader}>
                      <LinearGradient
                        colors={["#7C3AED", "#6D28D9"]}
                        style={styles.aiSectionIconBg}
                      >
                        <Ionicons name="sparkles" size={15} color="#FFF" />
                      </LinearGradient>

                      <Text style={styles.aiSectionTitle}>
                        AI Analysis | කෘත්‍රිම බුද්ධිමත්භාවය
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.aiActionContent,
                        { backgroundColor: "rgba(124,58,237,0.08)" },
                      ]}
                    >
                      <ActivityIndicator size="small" color="#7C3AED" />
                      <Text style={styles.aiSectionText}>
                        Analyzing with ML model... | ML ආකෘතිය සමඟ
                        විශ්ලේෂණය කරමින්...
                      </Text>
                    </View>
                  </View>
                ) : mlActionPlan ? (
                  <View style={styles.aiSection}>
                    <View style={styles.aiSectionHeader}>
                      <LinearGradient
                        colors={["#7C3AED", "#6D28D9"]}
                        style={styles.aiSectionIconBg}
                      >
                        <Ionicons name="sparkles" size={15} color="#FFF" />
                      </LinearGradient>

                      <Text style={styles.aiSectionTitle}>
                        AI Analysis | කෘත්‍රිම බුද්ධිමත්භාවය
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.aiActionContent,
                        {
                          backgroundColor: "rgba(124,58,237,0.08)",
                          borderColor: "#7C3AED30",
                        },
                      ]}
                    >
                      <Text style={styles.aiSectionText}>
                        {translateActionPlan(
                          typeof mlActionPlan === "string"
                            ? mlActionPlan
                            : mlActionPlan?.action_plan ||
                                mlActionPlan?.actionPlan ||
                                JSON.stringify(mlActionPlan, null, 2)
                        )}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAF9" },

  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  decorativeCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    top: 100,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decorativeCircle3: {
    position: "absolute",
    bottom: 30,
    right: 60,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTextContainer: { flex: 1 },
  greetingRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  greetingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
    marginLeft: 3,
  },
  brandText: {
    fontSize: 22,
    color: colors.white,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  profileButton: { overflow: "hidden", borderRadius: 16 },
  profileGradient: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  summaryContainer: { flexDirection: "row", justifyContent: "space-between" },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  summaryIconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    textAlign: "center",
  },
  summaryIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 20 },

  lastUpdatedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  lastUpdated: { fontSize: 12, color: "#666", fontWeight: "500" },

  loadingContainer: { alignItems: "center", paddingVertical: 60 },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  errorContainer: { alignItems: "center", paddingVertical: 60, gap: 12 },
  errorText: { fontSize: 14, color: "#FF6B6B", textAlign: "center" },

  issuesCardWrapper: {
    marginBottom: 20,
    borderRadius: 22,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  issuesCard: { borderRadius: 22, padding: 20, overflow: "hidden" },
  issuesDecor1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  issuesDecor2: {
    position: "absolute",
    bottom: -20,
    left: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  issuesContent: { flexDirection: "row", alignItems: "center" },
  issuesIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  issuesPulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  issuesTextContainer: { flex: 1 },
  issuesTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  issuesTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.3,
  },
  urgentBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 10,
  },
  urgentBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  issuesSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    marginBottom: 6,
  },
  issuesLastUpdated: { flexDirection: "row", alignItems: "center" },
  issuesLastUpdatedText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    marginLeft: 5,
  },
  issuesArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },

  aiCard: {
    borderRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 7,
  },
  aiCardHeader: { padding: 20, paddingBottom: 18 },
  aiCardDecor: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  aiCardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  aiCardIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  aiCardHeaderText: { flex: 1 },
  aiCardRiskType: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  aiCardRiskLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  aiChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  aiChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  aiMetricsRow: { flexDirection: "row", gap: 8 },
  aiMetricChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 3,
  },
  aiMetricChipValue: { fontSize: 14, fontWeight: "800", color: "#FFF" },
  aiMetricChipLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  aiCardBody: { padding: 18, gap: 14 },
  aiSection: {},
  aiSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  aiSectionIconBg: {
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  aiSectionTitle: { fontSize: 13, fontWeight: "700", color: "#333", flex: 1 },
  aiSectionContent: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  aiActionContent: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  aiSectionText: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    fontWeight: "500",
  },

  animatedActionItem: {
    marginBottom: 12,
  },
  actionItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(14, 165, 233, 0.05)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0EA5E9",
    gap: 12,
  },
  actionItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionItemContent: {
    flex: 1,
  },
  actionItemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0284C7",
    marginBottom: 2,
  },
  actionItemDesc: {
    fontSize: 12,
    color: "#555",
    lineHeight: 18,
    fontWeight: "500",
  },
  actionItemNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionItemNumberText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFF",
  },

  optimalCardWrapper: {
    marginTop: 8,
    borderRadius: 26,
    shadowColor: "#00B894",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  optimalCard: {
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    overflow: "hidden",
  },
  optimalDecor1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,184,148,0.1)",
  },
  optimalDecor2: {
    position: "absolute",
    bottom: -30,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,184,148,0.08)",
  },
  optimalIconContainer: { marginBottom: 16 },
  optimalIconRing: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: "rgba(0,184,148,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  optimalIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  optimalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,184,148,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  optimalBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00B894",
    marginLeft: 6,
  },
  optimalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#00B894",
    marginBottom: 4,
    textAlign: "center",
  },
  optimalTitleSinhala: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 10,
    textAlign: "center",
  },
  optimalSubtitle: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    textAlign: "center",
  },
  optimalStats: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },
  optimalStatItem: { alignItems: "center", flex: 1 },
  optimalStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  optimalStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(0,184,148,0.2)",
    marginHorizontal: 12,
  },
  optimalStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#00B894",
    marginBottom: 4,
  },
  optimalStatLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
  },

  bottomSpacing: { height: 100 },
});

export default SuggestionsScreen;