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
import * as Notifications from "expo-notifications";
import { colors } from "../styles/colors";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, off } from "firebase/database";

// ── Warehouse Firebase ─────────────────────────────────────────────────────────
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

const DEVICE_ID = "249627E81F84";

// ── Notification setup ─────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function sendLocalNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}

// ── Alert type helpers ─────────────────────────────────────────────────────────
function alertTypeConfig(type) {
  switch (type) {
    case "Temperature":
      return {
        icon: "thermometer",
        gradient: ["#FF6B6B", "#EE5A5A"],
        color: "#FF6B6B",
        bg: "rgba(255,107,107,0.12)",
        badge: "Critical | බරපතල",
      };
    case "Humidity":
      return {
        icon: "water",
        gradient: ["#74B9FF", "#0984E3"],
        color: "#0984E3",
        bg: "rgba(116,185,255,0.12)",
        badge: "Warning | අවවාදය",
      };
    case "Air Quality":
      return {
        icon: "cloud",
        gradient: ["#A29BFE", "#6C5CE7"],
        color: "#6C5CE7",
        bg: "rgba(162,155,254,0.12)",
        badge: "Warning | අවවාදය",
      };
    case "Light":
      return {
        icon: "sunny",
        gradient: ["#FDCB6E", "#F39C12"],
        color: "#F39C12",
        bg: "rgba(253,203,110,0.15)",
        badge: "Warning | අවවාදය",
      };
    default:
      return {
        icon: "alert-circle",
        gradient: ["#FF6B6B", "#EE5A5A"],
        color: "#FF6B6B",
        bg: "rgba(255,107,107,0.12)",
        badge: "Alert | ඇඟවීම",
      };
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
const ComparisonScreen = ({ navigation }) => {
  const [alerts, setAlerts]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const seenKeys   = useRef(new Set());
  const permGranted = useRef(false);

  useEffect(() => {
    requestNotificationPermission().then((granted) => {
      permGranted.current = granted;
    });
  }, []);

  useEffect(() => {
    const alertsRef = ref(warehouseDb, `devices/${DEVICE_ID}/alerts`);

    const listener = onValue(
      alertsRef,
      (snap) => {
        const data = snap.val();
        setLoading(false);
        setLastUpdate(new Date());

        if (!data) {
          setAlerts([]);
          return;
        }

        const list = Object.entries(data)
          .map(([key, val]) => ({ key, ...val }))
          .sort((a, b) => b.timestamp - a.timestamp);

        setAlerts((prev) => {
          const prevKeys = new Set(prev.map((a) => a.key));
          list.forEach((alert) => {
            if (!prevKeys.has(alert.key) && prev.length > 0) {
              if (permGranted.current) {
                sendLocalNotification(
                  `⚠️ ${alert.alert_type} Alert`,
                  alert.message
                );
              }
            }
          });
          list.forEach((alert) => seenKeys.current.add(alert.key));
          return list;
        });
      },
      (error) => {
        console.error("Firebase alerts error:", error);
        setLoading(false);
      }
    );

    return () => off(alertsRef, "value", listener);
  }, []);

  const criticalCount = alerts.filter((a) => a.alert_type === "Temperature").length;
  const warningCount  = alerts.filter((a) => a.alert_type !== "Temperature").length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      {/* Header */}
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
                    Real-time Analysis | තත්කාලීන විශ්ලේෂණය
                  </Text>
                </View>
                <Text style={styles.brandText}>Alerts | අනතුරු ඇඟවීම්</Text>
              </View>
            </View>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <LinearGradient colors={["#FF6B6B", "#EE5A5A"]} style={styles.summaryIconBg}>
                <Ionicons name="alert-circle" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{criticalCount}</Text>
              <Text style={styles.summaryLabel}>Critical | බරපතල</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: "#FF6B6B" }]} />
            </View>
            <View style={styles.summaryCard}>
              <LinearGradient colors={["#FDCB6E", "#F39C12"]} style={styles.summaryIconBg}>
                <Ionicons name="warning" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{warningCount}</Text>
              <Text style={styles.summaryLabel}>Warning | අවවාදය</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: "#F39C12" }]} />
            </View>
            <View style={styles.summaryCard}>
              <LinearGradient colors={["#00B894", "#00A085"]} style={styles.summaryIconBg}>
                <Ionicons name={loading ? "pulse" : "wifi"} size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{loading ? "..." : alerts.length}</Text>
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
              Loading alerts... | අනතුරු ඇඟවීම් පූරණය වෙමින්...
            </Text>
          </View>
        )}

        {/* Active alerts banner */}
        {!loading && alerts.length > 0 && (
          <TouchableOpacity activeOpacity={0.9} style={styles.bannerWrapper}>
            <LinearGradient
              colors={["#FF6B6B", "#E74C3C", "#C0392B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerCard}
            >
              <View style={styles.bannerDecor1} />
              <View style={styles.bannerDecor2} />
              <View style={styles.bannerContent}>
                <View style={styles.bannerIconContainer}>
                  <View style={styles.bannerPulse} />
                  <Ionicons name="warning" size={28} color="#FFF" />
                </View>
                <View style={styles.bannerTextContainer}>
                  <View style={styles.bannerTitleRow}>
                    <Text style={styles.bannerTitle}>{alerts.length} Alerts Active</Text>
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentBadgeText}>LIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.bannerSubtitle}>
                    ක්‍රියාකාරී ඇඟවීම් • Cinnamon Warehouse
                  </Text>
                  <View style={styles.bannerLastUpdated}>
                    <View style={[styles.liveDot, { backgroundColor: "#FFF", opacity: 0.7 }]} />
                    <Text style={styles.bannerLastUpdatedText}>
                      {lastUpdate
                        ? `Last updated: ${lastUpdate.toLocaleTimeString()}`
                        : "Connecting to Firebase..."}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Section header */}
        {!loading && alerts.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Alerts | ක්‍රියාකාරී ඇඟවීම්</Text>
          </View>
        )}

        {/* No alerts */}
        {!loading && alerts.length === 0 && (
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
                <Text style={styles.optimalBadgeText}>ALL CLEAR</Text>
              </View>
              <Text style={styles.optimalTitle}>No Active Alerts</Text>
              <Text style={styles.optimalTitleSinhala}>ක්‍රියාකාරී ඇඟවීම් නොමැත</Text>
              <Text style={styles.optimalSubtitle}>
                All sensor readings are within safe ranges. Your cinnamon warehouse is in optimal condition.
              </Text>
              <View style={styles.optimalStats}>
                <View style={styles.optimalStatItem}>
                  <LinearGradient colors={["#00B894", "#00A085"]} style={styles.optimalStatIcon}>
                    <Ionicons name="analytics" size={16} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.optimalStatValue}>Safe</Text>
                  <Text style={styles.optimalStatLabel}>Conditions</Text>
                </View>
                <View style={styles.optimalStatDivider} />
                <View style={styles.optimalStatItem}>
                  <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.optimalStatIcon}>
                    <Ionicons name="eye" size={16} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.optimalStatValue}>24/7</Text>
                  <Text style={styles.optimalStatLabel}>Monitoring</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Alert cards */}
        {!loading && alerts.map((alert, index) => {
          const cfg = alertTypeConfig(alert.alert_type);
          return (
            <View key={alert.key} style={styles.card}>
              {/* Left gradient priority bar */}
              <LinearGradient
                colors={cfg.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.priorityIndicator}
              />

              <View style={styles.cardContent}>
                {/* Card header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <LinearGradient colors={cfg.gradient} style={styles.iconContainer}>
                      <Ionicons name={cfg.icon} size={24} color="#FFF" />
                    </LinearGradient>
                    <View style={styles.cardTitleTextContainer}>
                      <Text style={styles.cardTitle}>{alert.alert_type}</Text>
                      <View style={styles.cardNumberRow}>
                        <View style={styles.cardNumberDot} />
                        <Text style={styles.cardNumber}>Alert #{index + 1}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <View style={[styles.badgeDot, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.badgeText, { color: cfg.color }]}>
                      {cfg.badge}
                    </Text>
                  </View>
                </View>

                {/* Message */}
                {(() => {
                  const colonIdx = alert.message ? alert.message.indexOf(":") : -1;
                  if (colonIdx > -1) {
                    const label = alert.message.slice(0, colonIdx);
                    const body = alert.message.slice(colonIdx + 1).trim();
                    return (
                      <Text style={styles.alertMessage}>
                        <Text style={[styles.alertMessageLabel, { color: cfg.color }]}>{label}: </Text>
                        {body}
                      </Text>
                    );
                  }
                  return <Text style={styles.alertMessage}>{alert.message}</Text>;
                })()}

                {/* Metrics row */}
                <LinearGradient
                  colors={[cfg.bg, `${cfg.bg}50`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.metricsContainer}
                >
                  <View style={styles.metricCard}>
                    <View style={styles.metricIconWrapper}>
                      <Ionicons name="thermometer-outline" size={14} color={cfg.color} />
                    </View>
                    <Text style={styles.metricLabel}>Temp</Text>
                    <Text style={[styles.metricValue, { color: cfg.color }]}>
                      {alert.temperature != null ? `${alert.temperature.toFixed(1)}°C` : "—"}
                    </Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricCard}>
                    <View style={styles.metricIconWrapper}>
                      <Ionicons name="water-outline" size={14} color="#0984E3" />
                    </View>
                    <Text style={styles.metricLabel}>Humidity</Text>
                    <Text style={[styles.metricValue, { color: "#0984E3" }]}>
                      {alert.humidity != null ? `${alert.humidity.toFixed(1)}%` : "—"}
                    </Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricCard}>
                    <View style={styles.metricIconWrapper}>
                      <Ionicons name="cloud-outline" size={14} color="#6C5CE7" />
                    </View>
                    <Text style={styles.metricLabel}>CO₂</Text>
                    <Text style={[styles.metricValue, { color: "#6C5CE7" }]}>
                      {alert.co2 != null ? `${alert.co2.toFixed(0)}ppm` : "—"}
                    </Text>
                  </View>
                </LinearGradient>

                {/* Timestamp row */}
                <View style={[styles.timestampContainer, { borderLeftColor: cfg.color }]}>
                  <View style={styles.timestampLeft}>
                    <Ionicons name="time-outline" size={14} color={cfg.color} />
                    <Text style={[styles.timestampTitle, { color: cfg.color }]}>Detected At</Text>
                  </View>
                  <Text style={styles.timestampValue}>{alert.date_time ?? "—"}</Text>
                </View>

              </View>
            </View>
          );
        })}

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
  scrollView:    { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 20 },

  lastUpdatedContainer: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  liveDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  lastUpdated: { fontSize: 12, color: "#666", fontWeight: "500" },

  loadingContainer: { alignItems: "center", paddingVertical: 60 },
  loadingText: { marginTop: 16, fontSize: 14, color: "#666", textAlign: "center" },

  // ── Active banner ────────────────────────────────────────────────────────────
  bannerWrapper: {
    marginBottom: 20, borderRadius: 22,
    shadowColor: "#FF6B6B", shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  bannerCard: { borderRadius: 22, padding: 20, overflow: "hidden" },
  bannerDecor1: {
    position: "absolute", top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  bannerDecor2: {
    position: "absolute", bottom: -20, left: 40,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bannerContent: { flexDirection: "row", alignItems: "center" },
  bannerIconContainer: {
    width: 60, height: 60, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center", alignItems: "center", marginRight: 16,
  },
  bannerPulse: {
    position: "absolute", width: 60, height: 60,
    borderRadius: 20, backgroundColor: "rgba(255,255,255,0.3)",
  },
  bannerTextContainer: { flex: 1 },
  bannerTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  bannerTitle: { fontSize: 20, fontWeight: "800", color: "#FFF", letterSpacing: 0.3 },
  urgentBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, marginLeft: 10,
  },
  urgentBadgeText: { fontSize: 9, fontWeight: "700", color: "#FFF", letterSpacing: 0.5 },
  bannerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: "500", marginBottom: 6 },
  bannerLastUpdated: { flexDirection: "row", alignItems: "center" },
  bannerLastUpdatedText: { fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: "500", marginLeft: 5 },
  bannerArrow: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#1A1A1A", letterSpacing: 0.3 },

  // ── Alert card ───────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    flexDirection: "row",
    overflow: "hidden",
  },
  priorityIndicator: { width: 5 },
  cardContent: { flex: 1, padding: 20 },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 12,
  },
  cardTitleContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  cardTitleTextContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 6, letterSpacing: 0.2 },
  cardNumberRow: { flexDirection: "row", alignItems: "center" },
  cardNumberDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#CCC", marginRight: 6 },
  cardNumber: { fontSize: 12, color: "#888", fontWeight: "600" },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },

  alertMessage: { fontSize: 13, color: "#444", marginBottom: 14, lineHeight: 19 },
  alertMessageLabel: { fontWeight: "700", fontSize: 13 },

  // ── Metrics ──────────────────────────────────────────────────────────────────
  metricsContainer: { flexDirection: "row", borderRadius: 16, padding: 14, marginBottom: 14 },
  metricCard: { flex: 1, alignItems: "center" },
  metricIconWrapper: { marginBottom: 5 },
  metricDivider: { width: 1, backgroundColor: "rgba(0,0,0,0.08)", marginHorizontal: 8 },
  metricLabel: { fontSize: 10, color: "#666", marginBottom: 4, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3, textAlign: "center" },
  metricValue: { fontSize: 16, fontWeight: "800", color: "#1A1A1A", textAlign: "center" },

  // ── Timestamp ────────────────────────────────────────────────────────────────
  timestampContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)", borderRadius: 12,
    padding: 12, marginBottom: 14,
    borderLeftWidth: 3,
    gap: 8,
  },
  timestampLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  timestampTitle: { fontSize: 12, fontWeight: "700" },
  timestampValue: { fontSize: 12, color: "#555", fontWeight: "500", flex: 1, textAlign: "right" },

  // ── All Clear card ───────────────────────────────────────────────────────────
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
  optimalSubtitle: { fontSize: 13, color: "#4CAF50", textAlign: "center", lineHeight: 20, marginBottom: 20, paddingHorizontal: 10 },
  optimalStats: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 18, paddingVertical: 18, paddingHorizontal: 24,
  },
  optimalStatItem: { flex: 1, alignItems: "center" },
  optimalStatIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  optimalStatDivider: { width: 1, height: 50, backgroundColor: "rgba(76,175,80,0.3)", marginHorizontal: 20 },
  optimalStatValue: { fontSize: 22, fontWeight: "800", color: "#1B5E20", marginBottom: 4 },
  optimalStatLabel: { fontSize: 11, color: "#4CAF50", fontWeight: "600" },

  bottomSpacing: { height: 100 },
});

export default ComparisonScreen;
