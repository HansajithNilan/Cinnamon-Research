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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";
import * as Notifications from "expo-notifications";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, off } from "firebase/database";

// ── Notification setup ─────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── Firebase ───────────────────────────────────────────────────────────────────
const warehouseFirebaseConfig = {
  apiKey: "AIzaSyDUFvbL5N39Jt_eAOf-X1RrDhkWOzBD0Fk",
  databaseURL:
    "https://cinnamon-warehouse-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "cinnamon-warehouse",
};
let warehouseApp;
const existingApp = getApps().find((a) => a.name === "warehouse");
warehouseApp = existingApp
  ? existingApp
  : initializeApp(warehouseFirebaseConfig, "warehouse");
const warehouseDb = getDatabase(warehouseApp);

const DEVICE_ID   = "249627E81F84";
const PREDICT_URL = "https://cinnamon-quality-api-94717.azurewebsites.net/predict";

// ── Helpers ────────────────────────────────────────────────────────────────────
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
  if (t.includes("temp"))     return "thermometer";
  if (t.includes("humid"))    return "water";
  if (t.includes("co2") || t.includes("air") || t.includes("voc")) return "cloud";
  if (t.includes("light"))    return "sunny";
  if (t.includes("motion"))   return "walk";
  return "warning";
}

// ── Component ──────────────────────────────────────────────────────────────────
const SuggestionsScreen = ({ navigation }) => {
  const [prediction, setPrediction] = useState(null);
  const [sensor, setSensor]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const unsubRef     = useRef(null);
  const permGranted  = useRef(false);
  const lastRiskKey  = useRef(null); // track last risk_type+label to avoid duplicate notifications

  // Request notification permission once
  useEffect(() => {
    Notifications.requestPermissionsAsync().then(({ status }) => {
      permGranted.current = status === "granted";
    });
  }, []);

  useEffect(() => {
    const readingsRef = ref(warehouseDb, `devices/${DEVICE_ID}/readings`);

    const listener = onValue(
      readingsRef,
      async (snap) => {
        const data = snap.val();
        if (!data) {
          setLoading(false);
          setError("No sensor data available.");
          return;
        }

        // Pick the latest reading by numeric key (millis since boot)
        const keys = Object.keys(data).sort((a, b) => Number(a) - Number(b));
        const latest = data[keys[keys.length - 1]];
        setSensor(latest);
        setLastUpdate(new Date());

        // Build API payload from the latest reading
        const payload = {
          temperature_c:      latest.temperature_c       ?? 25,
          humidity_percent:   latest.humidity_percent    ?? 60,
          moisture_level:     latest.air_moisture_percent ?? latest.humidity_percent ?? 60,
          air_quality_adc:    latest.light_raw           ?? 500,
          co2_ppm:            latest.co2_ppm             ?? 400,
          light_level:        latest.brightness_percent  ?? 50,
          motion_detected:    latest.motion_detected ? 1 : 0,
          voc_ppb:            (latest.voc_ppm ?? 0) * 1000, // convert ppm → ppb
        };

        console.log("[SuggestionScreen] API input payload:", JSON.stringify(payload, null, 2));

        try {
          const res = await fetch(PREDICT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`API ${res.status}`);
          const json = await res.json();
          console.log("[SuggestionScreen] API response:", JSON.stringify(json, null, 2));
          setPrediction(json);
          setError(null);

          // Fire notification only when risk type/label changes
          const riskKey = `${json.risk_label}|${json.risk_type}`;
          if (permGranted.current && riskKey !== lastRiskKey.current) {
            lastRiskKey.current = riskKey;
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `🌿 ${json.risk_label} — ${json.risk_type}`,
                body: `${json.consequence}\n\n💡 ${json.action_plan}`,
                sound: true,
              },
              trigger: null,
            });
          }
        } catch (e) {
          console.error("[SuggestionScreen] Predict API error:", e);
          setError("Could not reach prediction API.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firebase error:", err);
        setLoading(false);
        setError("Firebase connection failed.");
      }
    );

    unsubRef.current = () => off(readingsRef, "value", listener);
    return () => unsubRef.current?.();
  }, []);

  const ps = prediction ? getPriorityStyles(prediction.risk_label) : null;
  const criticalCount = ps?.priority === "high" ? 1 : 0;
  const warningCount  = ps?.priority === "medium" ? 1 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      {/* ── Header ── */}
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
                  <View style={styles.aiBadge}>
                    <Ionicons name="sparkles" size={10} color="#FFF" />
                    <Text style={styles.aiBadgeText}>AI</Text>
                  </View>
                </View>
                <Text style={styles.brandText}>Suggestions | යෝජනා</Text>
              </View>
            </View>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <LinearGradient colors={["#FF6B6B", "#EE5A5A"]} style={styles.summaryIconBg}>
                <Ionicons name="alert-circle" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{loading ? "…" : criticalCount}</Text>
              <Text style={styles.summaryLabel}>Critical | බරපතල</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: "#FF6B6B" }]} />
            </View>
            <View style={styles.summaryCard}>
              <LinearGradient colors={["#FDCB6E", "#F39C12"]} style={styles.summaryIconBg}>
                <Ionicons name="warning" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{loading ? "…" : warningCount}</Text>
              <Text style={styles.summaryLabel}>Warning | අවවාදය</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: "#F39C12" }]} />
            </View>
            <View style={styles.summaryCard}>
              <LinearGradient colors={["#00B894", "#00A085"]} style={styles.summaryIconBg}>
                <Ionicons name="checkmark-done" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{loading ? "…" : (prediction ? 1 : 0)}</Text>
              <Text style={styles.summaryLabel}>Total | මුළු</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: "#00B894" }]} />
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Analysing sensor data... | සංවේදක දත්ත විශ්ලේෂණය...
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={40} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Result */}
        {!loading && prediction && ps && (
          <>
            {/* Issues detected banner */}
            <TouchableOpacity activeOpacity={0.9} style={styles.issuesCardWrapper}>
              <LinearGradient
                colors={ps.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.issuesCard}
              >
                <View style={styles.issuesDecor1} />
                <View style={styles.issuesDecor2} />
                <View style={styles.issuesContent}>
                  <View style={styles.issuesIconContainer}>
                    <View style={styles.issuesPulse} />
                    <Ionicons name="warning" size={28} color="#FFF" />
                  </View>
                  <View style={styles.issuesTextContainer}>
                    <View style={styles.issuesTitleRow}>
                      <Text style={styles.issuesTitle}>
                        {prediction.risk_label}
                      </Text>
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentBadgeText}>
                          {ps.priority === "high" ? "URGENT" : ps.priority === "medium" ? "CAUTION" : "OK"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.issuesSubtitle}>
                      {prediction.risk_type} • Cinnamon Warehouse
                    </Text>
                    <View style={styles.issuesLastUpdated}>
                      <View style={[styles.liveDot, { backgroundColor: "#FFF", opacity: 0.7 }]} />
                      <Text style={styles.issuesLastUpdatedText}>
                        {lastUpdate
                          ? `Last updated: ${lastUpdate.toLocaleTimeString()}`
                          : "Connecting to Firebase..."}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Action Required | පියවර අවශ්‍යයි
              </Text>
            </View>

            {/* AI Prediction card */}
            <View style={styles.aiCard}>
              {/* Gradient header */}
              <LinearGradient
                colors={ps.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiCardHeader}
              >
                <View style={styles.aiCardDecor} />
                <View style={styles.aiCardHeaderRow}>
                  <View style={styles.aiCardIconCircle}>
                    <Ionicons name={riskTypeIcon(prediction.risk_type)} size={26} color="#FFF" />
                  </View>
                  <View style={styles.aiCardHeaderText}>
                    <Text style={styles.aiCardRiskType}>{prediction.risk_type}</Text>
                    <Text style={styles.aiCardRiskLabel}>{prediction.risk_label}</Text>
                  </View>
                  <View style={styles.aiChip}>
                    <Ionicons name="sparkles" size={10} color="#FFF" />
                    <Text style={styles.aiChipText}>AI</Text>
                  </View>
                </View>

                {/* Sensor metric chips */}
                <View style={styles.aiMetricsRow}>
                  <View style={styles.aiMetricChip}>
                    <Ionicons name="thermometer-outline" size={12} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.aiMetricChipValue}>
                      {sensor?.temperature_c != null ? `${Number(sensor.temperature_c).toFixed(1)}°C` : "—"}
                    </Text>
                    <Text style={styles.aiMetricChipLabel}>Temp</Text>
                  </View>
                  <View style={styles.aiMetricChip}>
                    <Ionicons name="water-outline" size={12} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.aiMetricChipValue}>
                      {sensor?.humidity_percent != null ? `${Number(sensor.humidity_percent).toFixed(1)}%` : "—"}
                    </Text>
                    <Text style={styles.aiMetricChipLabel}>Humidity</Text>
                  </View>
                  <View style={styles.aiMetricChip}>
                    <Ionicons name="cloud-outline" size={12} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.aiMetricChipValue}>
                      {sensor?.co2_ppm != null ? `${Number(sensor.co2_ppm).toFixed(0)}ppm` : "—"}
                    </Text>
                    <Text style={styles.aiMetricChipLabel}>CO₂</Text>
                  </View>
                </View>
              </LinearGradient>

              {/* Body */}
              <View style={styles.aiCardBody}>
                {/* Risk Impact */}
                <View style={styles.aiSection}>
                  <View style={styles.aiSectionHeader}>
                    <View style={[styles.aiSectionIconBg, { backgroundColor: `${ps.color}18` }]}>
                      <Ionicons name="alert-circle" size={15} color={ps.color} />
                    </View>
                    <Text style={[styles.aiSectionTitle, { color: ps.color }]}>Risk Impact | අවදානම් බලපෑම</Text>
                  </View>
                  <View style={[styles.aiSectionContent, { borderLeftColor: ps.color }]}>
                    <Text style={styles.aiSectionText}>{prediction.consequence}</Text>
                  </View>
                </View>

                {/* Action Plan */}
                <View style={styles.aiSection}>
                  <View style={styles.aiSectionHeader}>
                    <LinearGradient colors={["#FFD700", "#FFA500"]} style={styles.aiSectionIconBg}>
                      <Ionicons name="bulb" size={15} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.aiSectionTitle}>Recommended Action | නිර්දේශිත පියවර</Text>
                  </View>
                  <View style={[styles.aiActionContent, { backgroundColor: `${ps.color}0D`, borderColor: `${ps.color}30` }]}>
                    <Text style={styles.aiSectionText}>{prediction.action_plan}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Optimal / quality card */}
            <View style={styles.optimalCardWrapper}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optimalCard}
              >
                <View style={styles.optimalDecor1} />
                <View style={styles.optimalDecor2} />
                <View style={styles.optimalIconContainer}>
                  <View style={styles.optimalIconRing}>
                    <LinearGradient
                      colors={["#00B894", "#00A085", "#009975"]}
                      style={styles.optimalIconGradient}
                    >
                      <Ionicons name="shield-checkmark" size={36} color="#FFF" />
                    </LinearGradient>
                  </View>
                </View>
                <View style={styles.optimalBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#00B894" />
                  <Text style={styles.optimalBadgeText}>PROTECTED</Text>
                </View>
                <Text style={styles.optimalTitle}>Quality Protection Active</Text>
                <Text style={styles.optimalTitleSinhala}>
                  ගුණාත්මක ආරක්ෂාව සක්‍රීයයි
                </Text>
                <Text style={styles.optimalSubtitle}>
                  Once all issues are resolved, your cinnamon storage will be in
                  optimal condition.
                </Text>
                <View style={styles.optimalStats}>
                  <View style={styles.optimalStatItem}>
                    <LinearGradient
                      colors={["#00B894", "#00A085"]}
                      style={styles.optimalStatIcon}
                    >
                      <Ionicons name="analytics" size={16} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.optimalStatValue}>
                      {prediction.risk_status === 0 ? "100%" : ps.priority === "high" ? "Low" : "Mid"}
                    </Text>
                    <Text style={styles.optimalStatLabel}>Quality Score</Text>
                  </View>
                  <View style={styles.optimalStatDivider} />
                  <View style={styles.optimalStatItem}>
                    <LinearGradient
                      colors={["#4CAF50", "#2E7D32"]}
                      style={styles.optimalStatIcon}
                    >
                      <Ionicons name="eye" size={16} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.optimalStatValue}>24/7</Text>
                    <Text style={styles.optimalStatLabel}>Monitoring</Text>
                  </View>
                </View>
              </LinearGradient>
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

  // ── Header ──────────────────────────────────────────────────────────────────
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
    position: "absolute", top: -50, right: -50,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorativeCircle2: {
    position: "absolute", top: 100, left: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decorativeCircle3: {
    position: "absolute", bottom: 30, right: 60,
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  topBar: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  backButton: {
    width: 44, height: 44, borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center", alignItems: "center", marginRight: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  headerTextContainer: { flex: 1 },
  greetingRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  greetingText: { fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: "500" },
  aiBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.3)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 10,
  },
  aiBadgeText: { fontSize: 9, fontWeight: "700", color: "#FFF", letterSpacing: 0.5, marginLeft: 3 },
  brandText: { fontSize: 22, color: colors.white, fontWeight: "bold", letterSpacing: 0.3 },
  profileButton: { overflow: "hidden", borderRadius: 16 },
  profileGradient: { width: 46, height: 46, borderRadius: 16, justifyContent: "center", alignItems: "center" },

  // ── Summary cards ───────────────────────────────────────────────────────────
  summaryContainer: { flexDirection: "row", justifyContent: "space-between" },
  summaryCard: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18, padding: 16, marginHorizontal: 5, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", overflow: "hidden",
  },
  summaryIconBg: {
    width: 40, height: 40, borderRadius: 14,
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  summaryValue: { fontSize: 24, fontWeight: "800", color: colors.white, marginBottom: 4 },
  summaryLabel: { fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: "600", textAlign: "center" },
  summaryIndicator: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: 3, borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
  },

  // ── Scroll ──────────────────────────────────────────────────────────────────
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 20 },

  lastUpdatedContainer: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  lastUpdated: { fontSize: 12, color: "#666", fontWeight: "500" },

  loadingContainer: { alignItems: "center", paddingVertical: 60 },
  loadingText: { marginTop: 16, fontSize: 14, color: "#666", textAlign: "center" },

  errorContainer: { alignItems: "center", paddingVertical: 60, gap: 12 },
  errorText: { fontSize: 14, color: "#FF6B6B", textAlign: "center" },

  // ── Issues banner ────────────────────────────────────────────────────────────
  issuesCardWrapper: {
    marginBottom: 20, borderRadius: 22,
    shadowColor: "#FF6B6B", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  issuesCard: { borderRadius: 22, padding: 20, overflow: "hidden" },
  issuesDecor1: {
    position: "absolute", top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  issuesDecor2: {
    position: "absolute", bottom: -20, left: 40,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  issuesContent: { flexDirection: "row", alignItems: "center" },
  issuesIconContainer: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center", alignItems: "center", marginRight: 16,
  },
  issuesPulse: {
    position: "absolute", width: 60, height: 60,
    borderRadius: 20, backgroundColor: "rgba(255,255,255,0.3)",
  },
  issuesTextContainer: { flex: 1 },
  issuesTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  issuesTitle: { fontSize: 20, fontWeight: "800", color: "#FFF", letterSpacing: 0.3 },
  urgentBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 10,
  },
  urgentBadgeText: { fontSize: 9, fontWeight: "700", color: "#FFF", letterSpacing: 0.5 },
  issuesSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "500", marginBottom: 6 },
  issuesLastUpdated: { flexDirection: "row", alignItems: "center" },
  issuesLastUpdatedText: { fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: "500", marginLeft: 5 },
  issuesArrow: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },

  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", letterSpacing: 0.3 },

  // ── AI Prediction card ───────────────────────────────────────────────────────
  aiCard: {
    borderRadius: 24, marginBottom: 16, overflow: "hidden",
    backgroundColor: "#FFF",
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 18, elevation: 7,
  },
  aiCardHeader: { padding: 20, paddingBottom: 18 },
  aiCardDecor: {
    position: "absolute", top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  aiCardHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  aiCardIconCircle: {
    width: 50, height: 50, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  aiCardHeaderText: { flex: 1 },
  aiCardRiskType: { fontSize: 17, fontWeight: "800", color: "#FFF", letterSpacing: 0.2, marginBottom: 3 },
  aiCardRiskLabel: { fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: "600" },
  aiChip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 3,
  },
  aiChipText: { fontSize: 10, fontWeight: "800", color: "#FFF", letterSpacing: 0.5 },
  aiMetricsRow: { flexDirection: "row", gap: 8 },
  aiMetricChip: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 8, alignItems: "center", gap: 3,
  },
  aiMetricChipValue: { fontSize: 14, fontWeight: "800", color: "#FFF" },
  aiMetricChipLabel: { fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3 },

  aiCardBody: { padding: 18, gap: 14 },
  aiSection: {},
  aiSectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  aiSectionIconBg: {
    width: 28, height: 28, borderRadius: 9,
    justifyContent: "center", alignItems: "center",
  },
  aiSectionTitle: { fontSize: 13, fontWeight: "700", color: "#333", flex: 1 },
  aiSectionContent: {
    borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 4,
  },
  aiActionContent: {
    borderWidth: 1, borderRadius: 14,
    padding: 14,
  },
  aiSectionText: { fontSize: 13, color: "#444", lineHeight: 20, fontWeight: "500" },

  // ── Optimal card ─────────────────────────────────────────────────────────────
  optimalCardWrapper: {
    marginTop: 8, borderRadius: 26,
    shadowColor: "#00B894", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  optimalCard: { borderRadius: 26, padding: 28, alignItems: "center", overflow: "hidden" },
  optimalDecor1: {
    position: "absolute", top: -40, right: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "rgba(0,184,148,0.1)",
  },
  optimalDecor2: {
    position: "absolute", bottom: -30, left: 30,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(0,184,148,0.08)",
  },
  optimalIconContainer: { marginBottom: 16 },
  optimalIconRing: {
    width: 88, height: 88, borderRadius: 30,
    backgroundColor: "rgba(0,184,148,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  optimalIconGradient: { width: 72, height: 72, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  optimalBadge: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(0,184,148,0.15)",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12,
  },
  optimalBadgeText: { fontSize: 11, fontWeight: "700", color: "#00B894", marginLeft: 6, letterSpacing: 0.5 },
  optimalTitle: { fontSize: 20, fontWeight: "800", color: "#1B5E20", marginBottom: 4, textAlign: "center" },
  optimalTitleSinhala: { fontSize: 14, fontWeight: "600", color: "#2E7D32", marginBottom: 12, textAlign: "center" },
  optimalSubtitle: {
    fontSize: 13, color: "#4CAF50", textAlign: "center",
    lineHeight: 20, marginBottom: 20, paddingHorizontal: 10,
  },
  optimalStats: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 18, paddingVertical: 18, paddingHorizontal: 24,
  },
  optimalStatItem: { flex: 1, alignItems: "center" },
  optimalStatIcon: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: "center", alignItems: "center", marginBottom: 8,
  },
  optimalStatDivider: { width: 1, height: 50, backgroundColor: "rgba(76,175,80,0.3)", marginHorizontal: 20 },
  optimalStatValue: { fontSize: 22, fontWeight: "800", color: "#1B5E20", marginBottom: 4 },
  optimalStatLabel: { fontSize: 11, color: "#4CAF50", fontWeight: "600" },

  bottomSpacing: { height: 100 },
});

export default SuggestionsScreen;
