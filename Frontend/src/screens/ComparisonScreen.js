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
import { ref, onValue, off } from "firebase/database";
import { database as warehouseDb } from "../config/warehouse/firebase";
import {
  compareAgainstThresholds,
} from "../config/warehouse/warehouseThresholds";

const DEVICE_ID = "249627E81F84";

// Helper to subscribe to date-partitioned paths
function subscribeLatest(path, callback) {
  const dbRef = ref(warehouseDb, path);
  console.log("🔗 Subscribing to:", path);
  const listener = onValue(dbRef, (snap) => {
    const data = snap.val();
    console.log(`📦 Data from ${path}:`, data);
    if (!data) {
      console.warn(`⚠️  No data at ${path}`);
      callback(null);
      return;
    }

    const dates = Object.keys(data).sort();
    const latestDate = dates[dates.length - 1];
    const timestamps = Object.keys(data[latestDate]).sort((a, b) => Number(a) - Number(b));
    const latestTs = timestamps[timestamps.length - 1];
    const entry = data[latestDate][latestTs];
    console.log(`✅ Latest from ${path}:`, entry);
    callback(entry);
  }, (error) => {
    console.error(`❌ Firebase error at ${path}:`, error);
    callback(null);
  });

  return () => off(dbRef, "value", listener);
}

// ── Notification setup ─────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
const ComparisonScreen = ({ navigation }) => {
  const [sensorData, setSensorData] = useState({
    temperature: null,
    humidity: null,
    co2: null,
    voc: null,
    light: null,
  });
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [alertTime, setAlertTime] = useState(null);

  const unsubRef = useRef([]);
  const permGranted = useRef(false);

  // Request notification permission
  useEffect(() => {
    Notifications.requestPermissionsAsync().then(({ status }) => {
      permGranted.current = status === "granted";
    });
  }, []);

  // Fetch sensor data from Firebase
  useEffect(() => {
    const basePath = `devices/${DEVICE_ID}`;
    const sensors = {};
    let loadedCount = 0;
    const totalSources = 4; // temp, humidity, air quality, light

    const markLoaded = () => {
      loadedCount++;
      console.log(`📊 Loaded ${loadedCount}/${totalSources}`);

      if (loadedCount >= totalSources && Object.keys(sensors).length > 0) {
        setLoading(false);
        // Perform comparison
        const comp = compareAgainstThresholds(sensors);
        setComparison(comp);
        setAlertTime(new Date());
        console.log("📊 Comparison Result:", comp);
      }
    };

    // Temperature
    const unsubTemp = subscribeLatest(`${basePath}/temperature_data`, (entry) => {
      if (entry) {
        sensors.temperature = entry.value;
        setSensorData((prev) => ({ ...prev, temperature: entry.value }));
        markLoaded();
      }
    });

    // Humidity
    const unsubHumid = subscribeLatest(`${basePath}/humidity_data`, (entry) => {
      if (entry) {
        sensors.humidity = entry.value;
        setSensorData((prev) => ({ ...prev, humidity: entry.value }));
        markLoaded();
      }
    });

    // Air Quality
    const unsubAir = subscribeLatest(`${basePath}/air_quality_data`, (entry) => {
      if (entry) {
        sensors.co2 = entry.co2;
        sensors.voc = entry.voc;
        setSensorData((prev) => ({ ...prev, co2: entry.co2, voc: entry.voc }));
        markLoaded();
      }
    });

    // Light
    const unsubLight = subscribeLatest(`${basePath}/light_data`, (entry) => {
      if (entry) {
        sensors.light = entry.lux;
        setSensorData((prev) => ({ ...prev, light: entry.lux }));
        setLastUpdate(new Date());
        markLoaded();
      }
    });

    unsubRef.current = [unsubTemp, unsubHumid, unsubAir, unsubLight];
    return () => {
      unsubRef.current.forEach((fn) => fn && fn());
    };
  }, []);

  // Render
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Comparing sensor data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOptimal = comparison?.isOptimal ?? false;

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

          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.greetingText}>Quality Analysis</Text>
              <Text style={styles.brandText}>Comparison | සංසන්දනය</Text>
            </View>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <LinearGradient colors={["#FF6B6B", "#EE5A5A"]} style={styles.summaryIconBg}>
                <Ionicons name="alert-circle" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>
                {comparison?.deviations.filter((d) => d.severity === "critical").length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Critical</Text>
            </View>
            <View style={styles.summaryCard}>
              <LinearGradient colors={["#FDCB6E", "#F39C12"]} style={styles.summaryIconBg}>
                <Ionicons name="warning" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>
                {comparison?.deviations.filter((d) => d.severity === "warning").length || 0}
              </Text>
              <Text style={styles.summaryLabel}>Warning</Text>
            </View>
            <View style={styles.summaryCard}>
              <LinearGradient colors={["#00B894", "#00A085"]} style={styles.summaryIconBg}>
                <Ionicons name="checkmark-done" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{isOptimal ? "✓" : "!"}</Text>
              <Text style={styles.summaryLabel}>Status</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isOptimal ? (
          <View style={styles.optimalContainer}>
            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9"]}
              style={styles.optimalCard}
            >
              <Ionicons name="checkmark-circle" size={60} color="#00B894" />
              <Text style={styles.optimalTitle}>All Parameters Optimal</Text>
              <Text style={styles.optimalSubtitle}>
                Your cinnamon storage conditions are perfect
              </Text>
            </LinearGradient>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {comparison?.deviations.map((deviation, idx) => {
              const isCritical = deviation.severity === "critical";
              const iconName = deviation.sensor.toLowerCase().includes("temp")
                ? "thermometer"
                : deviation.sensor.toLowerCase().includes("humid")
                ? "water"
                : deviation.sensor.toLowerCase().includes("moisture")
                ? "leaf"
                : deviation.sensor.toLowerCase().includes("co2")
                ? "analytics"
                : "alert-circle";
              const bgColor = isCritical ? "#FFF5F5" : "#FFFBF0";
              const iconBgColor = isCritical ? "#D32F2F" : "#F57F17";
              const badgeColor = isCritical ? "#FF6B6B" : "#FDCB6E";
              const badgeLabel = isCritical ? "High" : "Medium";

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() =>
                    navigation.navigate("Suggestion", { deviation })
                  }
                  activeOpacity={0.75}
                >
                  <View style={[styles.alertCard, { backgroundColor: bgColor }]}>
                    <View style={styles.alertIconWrapper}>
                      <View
                        style={[
                          styles.alertIconBg,
                          { backgroundColor: iconBgColor },
                        ]}
                      >
                        <Ionicons name={iconName} size={32} color="#FFF" />
                      </View>
                    </View>
                    <View style={styles.alertMainContent}>
                      <View style={styles.alertHeaderRow}>
                        <View style={styles.alertTitleWrapper}>
                          <Text style={styles.alertTitle}>{deviation.sensor}</Text>
                          <Text style={styles.alertTime}>
                            {alertTime?.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: badgeColor },
                          ]}
                        >
                          <Text style={styles.statusBadgeText}>{badgeLabel}</Text>
                        </View>
                      </View>
                      <Text style={styles.alertMessage}>
                        {deviation.sensor} is {deviation.value}{deviation.unit},
                        {isCritical ? " above" : " near"} safe range (
                        {deviation.optimal}).
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {!isOptimal && (
          <TouchableOpacity
            style={styles.viewActionsButton}
            onPress={() => navigation.navigate("Suggestion")}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#F59E0B", "#FDCB6E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.viewActionsButtonGradient}
            >
              <Ionicons name="bulb" size={20} color="#FFF" />
              <Text style={styles.viewActionsButtonText}>View Actions</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {lastUpdate && (
          <View style={styles.lastUpdateContainer}>
            <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
            <Text style={styles.lastUpdateText}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFBFC" },

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
    bottom: 30,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerText: { flex: 1 },
  greetingText: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 2 },
  brandText: { fontSize: 22, color: "#FFF", fontWeight: "bold" },

  summaryContainer: { flexDirection: "row", justifyContent: "space-between" },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 5,
    alignItems: "center",
  },
  summaryIconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryValue: { fontSize: 24, fontWeight: "800", color: "#FFF", marginBottom: 4 },
  summaryLabel: { fontSize: 9, color: "rgba(255,255,255,0.8)", fontWeight: "600" },

  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#666" },

  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 16 },

  optimalContainer: { alignItems: "center", paddingVertical: 40 },
  optimalCard: {
    width: "80%",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
  },
  optimalTitle: { fontSize: 20, fontWeight: "800", color: "#00B894", marginTop: 16 },
  optimalSubtitle: { fontSize: 14, color: "#4CAF50", marginTop: 8, textAlign: "center" },

  deviationCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
  },
  deviationIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)",
    marginRight: 12,
  },
  deviationContent: { flex: 1 },
  deviationSensor: { fontSize: 16, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
  deviationValue: { fontSize: 14, color: "#333", marginBottom: 2 },
  deviationOptimal: { fontSize: 12, color: "#666", fontStyle: "italic" },

  severityBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  severityText: { fontSize: 18 },

  alertCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: "flex-start",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  alertIconWrapper: {
    marginRight: 14,
  },
  alertIconBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  alertMainContent: {
    flex: 1,
  },
  alertHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  alertTitleWrapper: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: "#999",
  },
  alertMessage: {
    fontSize: 13,
    color: "#555",
    lineHeight: 19,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },

  historyButton: {
    marginVertical: 20,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#DC143C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  historyButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginHorizontal: 12,
    letterSpacing: 0.3,
  },

  viewActionsButton: {
    marginVertical: 20,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  viewActionsButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  viewActionsButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.3,
  },

  lastUpdateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 20,
  },
  lastUpdateText: { fontSize: 12, color: "#666", marginLeft: 6, fontWeight: "500" },

  bottomSpacing: { height: 100 },
});

export default ComparisonScreen;
