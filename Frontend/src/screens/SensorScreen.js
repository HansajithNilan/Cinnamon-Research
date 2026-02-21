import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";
import {
  THRESHOLDS,
  getTempStatus,
  getHumidityStatus,
  getCO2Status,
  getVOCStatus,
  getLightStatus,
  getMotionStatus,
  getAirQualityStatus,
} from "../config/warehouseThresholds";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, off } from "firebase/database";

const { width } = Dimensions.get("window");
const cardWidth = (width - 52) / 2;

// Warehouse Firebase config (separate from soil project)
const warehouseFirebaseConfig = {
  apiKey: "AIzaSyDUFvbL5N39Jt_eAOf-X1RrDhkWOzBD0Fk",
  databaseURL: "https://cinnamon-warehouse-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "cinnamon-warehouse",
};

const DEVICE_ID = "249627E81F84";

// Initialize warehouse Firebase app (avoid duplicate initialization)
let warehouseApp;
const existingApp = getApps().find((a) => a.name === "warehouse");
if (existingApp) {
  warehouseApp = existingApp;
} else {
  warehouseApp = initializeApp(warehouseFirebaseConfig, "warehouse");
}
const warehouseDb = getDatabase(warehouseApp);

function formatTimeAgo(dateTimeStr) {
  if (!dateTimeStr) return "—";
  try {
    // ESP32 sends local time (GMT+5:30) — append offset so JS parses correctly
    const [datePart, timePart] = dateTimeStr.split(" ");
    const past = new Date(`${datePart}T${timePart}+05:30`);
    const diffMs = Date.now() - past.getTime();
    if (diffMs < 0) return "just now";
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const days = Math.floor(hr / 24);
    if (sec < 60) return `${sec}s ago | තත්ප ${sec}කට පෙර`;
    if (min < 60) return `${min} min ago | මිනිත්තු ${min}කට පෙර`;
    if (hr < 24) return `${hr} hr ago | පැය ${hr}කට පෙර`;
    if (days === 1) return `1 day ago | දිනයකට පෙර`;
    return `${days} days ago | දින ${days}කට පෙර`;
  } catch {
    return dateTimeStr;
  }
}

// Fetch the latest entry from a date-partitioned path
function subscribeLatest(path, callback) {
  const dbRef = ref(warehouseDb, path);
  // Listen to the whole category node; we pick the last date and last timestamp
  const listener = onValue(dbRef, (snap) => {
    const data = snap.val();
    if (!data) { callback(null); return; }

    const dates = Object.keys(data).sort();
    const latestDate = dates[dates.length - 1];
    const timestamps = Object.keys(data[latestDate]).sort((a, b) => Number(a) - Number(b));
    const latestTs = timestamps[timestamps.length - 1];
    callback(data[latestDate][latestTs]);
  }, (error) => {
    console.error(`Firebase error at ${path}:`, error);
    callback(null);
  });

  return () => off(dbRef, "value", listener);
}

// ─── Component ─────────────────────────────────────────────────────────────────
const SensorScreen = ({ navigation }) => {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [airQuality, setAirQuality] = useState(null); // { co2, voc, date_time }
  const [light, setLight] = useState(null);           // { lux, brightness, date_time }
  const [motion, setMotion] = useState(null);         // { motion_detected, motion_confidence, date_time }
  const [loading, setLoading] = useState(true);
  const [lastSyncTs, setLastSyncTs] = useState(null); // ms timestamp
  const [isOnline, setIsOnline] = useState(false);

  const unsubscribers = useRef([]);

  // Check data freshness every 5 seconds (same logic as SoilDashboard)
  useEffect(() => {
    const check = () => {
      if (lastSyncTs) {
        const stale = Date.now() - lastSyncTs > 60000; // 1-minute threshold
        setIsOnline(!stale);
      }
    };
    check();
    const id = setInterval(check, 5000);
    return () => clearInterval(id);
  }, [lastSyncTs]);

  useEffect(() => {
    const basePath = `devices/${DEVICE_ID}`;
    let loadedCount = 0;
    const totalSources = 4;

    // Parse "YYYY-MM-DD HH:MM:SS" from ESP32 into a ms timestamp
    function parseSensorDateTime(dateTimeStr) {
      if (!dateTimeStr) return null;
      try {
        const [datePart, timePart] = dateTimeStr.split(" ");
        return new Date(`${datePart}T${timePart}+05:30`).getTime();
      } catch {
        return null;
      }
    }

    function markLoaded(entry) {
      loadedCount++;
      // Use the actual sensor date_time so freshness reflects real device activity
      if (entry?.date_time) {
        const ts = parseSensorDateTime(entry.date_time);
        if (ts) setLastSyncTs(ts);
      }
      if (loadedCount >= totalSources) {
        setLoading(false);
      }
    }

    // Temperature
    const unsubTemp = subscribeLatest(`${basePath}/temperature_data`, (entry) => {
      setTemperature(entry);
      markLoaded(entry);
    });

    // Humidity
    const unsubHumid = subscribeLatest(`${basePath}/humidity_data`, (entry) => {
      setHumidity(entry);
      markLoaded(entry);
    });

    // Air quality (CO2 + VOC)
    const unsubAir = subscribeLatest(`${basePath}/air_quality_data`, (entry) => {
      setAirQuality(entry);
      markLoaded(entry);
    });

    // Light
    const unsubLight = subscribeLatest(`${basePath}/light_data`, (entry) => {
      setLight(entry);
      markLoaded(entry);
    });

    // Motion — stored under motion_data, same date-partitioned structure
    const motionRef = ref(warehouseDb, `${basePath}/motion_data`);
    const motionListener = onValue(motionRef, (snap) => {
      const data = snap.val();
      if (!data) { setMotion(null); return; }
      const dates = Object.keys(data).sort();
      const latestDate = dates[dates.length - 1];
      const timestamps = Object.keys(data[latestDate]).sort((a, b) => Number(a) - Number(b));
      const latestTs = timestamps[timestamps.length - 1];
      setMotion(data[latestDate][latestTs]);
    });

    unsubscribers.current = [
      unsubTemp,
      unsubHumid,
      unsubAir,
      unsubLight,
      () => off(motionRef, "value", motionListener),
    ];

    return () => {
      unsubscribers.current.forEach((fn) => fn && fn());
    };
  }, []);

  // Derived values
  const tempVal = temperature?.value ?? null;
  const humidVal = humidity?.value ?? null;
  const co2Val = airQuality?.co2 ?? null;
  const vocVal = airQuality?.voc ?? null;
  const luxVal = light?.lux ?? null;
  const motionDetected = motion?.motion_detected ?? null;
  const motionConfidence = motion?.motion_confidence ?? null;

  const tempStatus = getTempStatus(tempVal);
  const humidStatus = getHumidityStatus(humidVal);
  const co2Status = getCO2Status(co2Val);
  const vocStatus = getVOCStatus(vocVal);
  const lightStatus = getLightStatus(luxVal);
  const motionStatus = getMotionStatus(motionDetected);
  const airQualityStatus = getAirQualityStatus(co2Val);

  const sensorData = [
    {
      id: 1,
      icon: "thermometer-outline",
      title: "Temperature | උෂ්ණත්වය",
      value: tempVal !== null ? tempVal.toFixed(1) : "--",
      unit: "°C",
      status: tempStatus.label,
      statusColor: tempStatus.color,
      gradient: ["#FF6B6B", "#EE5A5A"],
      trend: "stable",
      lastReading: formatTimeAgo(temperature?.date_time),
    },
    {
      id: 2,
      icon: "water-outline",
      title: "Humidity | ආර්ද්‍රතාවය",
      value: humidVal !== null ? humidVal.toFixed(1) : "--",
      unit: "%",
      status: humidStatus.label,
      statusColor: humidStatus.color,
      gradient: ["#4ECDC4", "#45B7AA"],
      trend: "stable",
      lastReading: formatTimeAgo(humidity?.date_time),
    },
    {
      id: 3,
      icon: "sunny-outline",
      title: "Light Intensity | ආලෝක තීව්‍රතාවය",
      value: luxVal !== null ? Math.round(luxVal).toLocaleString() : "--",
      unit: " lux",
      status: lightStatus.label,
      statusColor: lightStatus.color,
      gradient: ["#FFE66D", "#FFD93D"],
      trend: "stable",
      lastReading: formatTimeAgo(light?.date_time),
    },
    {
      id: 4,
      icon: "shield-checkmark-outline",
      title: "Pest Control | පළිබෝධ පාලනය",
      value: motionDetected === null ? "--" : motionDetected ? "Active | සක්‍රිය" : "Low | අඩු",
      unit: motionConfidence !== null ? ` (${motionConfidence}%)` : "",
      status: motionStatus.label,
      statusColor: motionStatus.color,
      gradient: ["#00B894", "#00A085"],
      trend: "stable",
      lastReading: formatTimeAgo(motion?.date_time),
    },
    {
      id: 6,
      icon: "speedometer-outline",
      title: "Air Quality | වායු ගුණාත්මකභාවය",
      value: airQualityStatus.label.split("|")[0].trim(),
      unit: "",
      status: airQualityStatus.label,
      statusColor: airQualityStatus.color,
      gradient: ["#74B9FF", "#5AA3E8"],
      trend: "stable",
      lastReading: formatTimeAgo(airQuality?.date_time),
    },
    {
      id: 7,
      icon: "cloud-outline",
      title: "CO₂ Level | CO₂ මට්ටම",
      value: co2Val !== null ? Math.round(co2Val).toString() : "--",
      unit: " ppm",
      status: co2Status.label,
      statusColor: co2Status.color,
      gradient: ["#A29BFE", "#8B7CF6"],
      trend: "stable",
      lastReading: formatTimeAgo(airQuality?.date_time),
    },
    {
      id: 8,
      icon: "rainy-outline",
      title: "Air Moisture | වායු තෙතමනය",
      value: humidVal !== null ? humidVal.toFixed(1) : "--",
      unit: " %RH",
      status: humidStatus.label,
      statusColor: humidStatus.color,
      gradient: ["#81ECEC", "#00CEC9"],
      trend: "stable",
      lastReading: formatTimeAgo(humidity?.date_time),
    },
    {
      id: 9,
      icon: "flask-outline",
      title: "VOC Level | VOC මට්ටම",
      value: vocVal !== null ? vocVal.toFixed(1) : "--",
      unit: " ppm",
      status: vocStatus.label,
      statusColor: vocStatus.color,
      gradient: ["#FD79A8", "#E84393"],
      trend: "stable",
      lastReading: formatTimeAgo(airQuality?.date_time),
    },
  ];

  const activeSensors = sensorData.filter((s) => s.value !== "--").length;
  const optimalSensors = sensorData.filter((s) => s.statusColor === "#00B894").length;

  const getTrendIcon = () => "remove-outline";

  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    const d = new Date(ts);
    if (isNaN(d.getTime())) return "Just now";
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatTimeAgoMs = (ts) => {
    if (!ts) return "Never";
    const diff = Date.now() - ts;
    if (diff < 0) return "just now";
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const days = Math.floor(hr / 24);
    if (sec < 10) return "just now";
    if (sec < 60) return `${sec} seconds ago`;
    if (min === 1) return "1 minute ago";
    if (min < 60) return `${min} minutes ago`;
    if (hr === 1) return "1 hour ago";
    if (hr < 24) return `${hr} hours ago`;
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

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

          <View style={styles.topBar}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingText}>Live Data Feed | සජීවී දත්ත</Text>
                <Text style={styles.brandText}>
                  Sensor Monitoring | සංවේදක නිරීක්ෂණය
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconBg, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Ionicons name="radio" size={18} color="#FFF" />
              </View>
              <Text style={styles.summaryValue}>{activeSensors}</Text>
              <Text style={styles.summaryLabel}>Active | සක්‍රිය</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconBg, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Ionicons name="checkmark-done" size={18} color="#FFF" />
              </View>
              <Text style={styles.summaryValue}>{optimalSensors}</Text>
              <Text style={styles.summaryLabel}>Optimal | ප්‍රශස්ත</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconBg, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Ionicons
                  name={loading ? "pulse" : isOnline ? "wifi" : "cloud-offline-outline"}
                  size={18}
                  color="#FFF"
                />
              </View>
              <Text style={styles.summaryValue}>
                {loading ? "..." : isOnline ? "Online" : "Offline"}
              </Text>
              <Text style={styles.summaryLabel}>
                Status | තත්ත්වය
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.liveDot, { backgroundColor: loading ? "#FDCB6E" : "#00B894" }]} />
            <Text style={styles.sectionTitle}>All Sensors | සියලුම සංවේදක</Text>
          </View>
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              Connecting to Firebase... | Firebase වෙත සම්බන්ධ වෙමින්...
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {sensorData.map((item) => (
              <TouchableOpacity key={item.id} activeOpacity={0.85}>
                <View style={styles.card}>
                  <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardHeader}
                  >
                    <View style={styles.cardHeaderContent}>
                      <View style={styles.iconContainerWhite}>
                        <Ionicons name={item.icon} size={24} color={item.gradient[0]} />
                      </View>
                      <View style={[styles.trendBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                        <Ionicons
                          name={getTrendIcon(item.trend)}
                          size={14}
                          color="#FFF"
                        />
                      </View>
                    </View>
                  </LinearGradient>

                  <View style={styles.cardBody}>
                    <Text style={styles.title}>{item.title}</Text>
                    <View style={styles.valueRow}>
                      <Text style={styles.value}>{item.value}</Text>
                      <Text style={styles.unit}>{item.unit}</Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={[styles.statusContainer, { backgroundColor: `${item.statusColor}15` }]}>
                        <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
                        <Text style={[styles.status, { color: item.statusColor }]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.lastReading}>
                      <Ionicons name="time-outline" size={10} color="#999" /> {item.lastReading}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Connection Status Card */}
        <LinearGradient
          colors={isOnline ? ["#E8F5E9", "#C8E6C9"] : ["#FFEBEE", "#FFCDD2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.connectionCard}
        >
          <View style={[
            styles.connectionIcon,
            { backgroundColor: isOnline ? "rgba(76, 175, 80, 0.15)" : "rgba(244, 67, 54, 0.15)" },
          ]}>
            <Ionicons
              name={isOnline ? "wifi" : "wifi-outline"}
              size={28}
              color={isOnline ? "#4CAF50" : "#F44336"}
            />
          </View>
          <View style={styles.connectionContent}>
            <Text style={[styles.connectionTitle, { color: isOnline ? "#2E7D32" : "#C62828" }]}>
              {isOnline
                ? "All Sensors Connected | සියලුම සංවේදක සම්බන්ධිතයි"
                : "Device Offline | උපාංගය නොබැඳිව"}
            </Text>
            <Text style={[styles.connectionSubtitle, { color: isOnline ? "#4CAF50" : "#F44336" }]}>
              {lastSyncTs
                ? `Last sync: ${formatTimestamp(lastSyncTs)} • ${formatTimeAgoMs(lastSyncTs)}`
                : "Connecting... | සම්බන්ධ වෙමින්..."}
            </Text>
          </View>
          <View style={styles.signalBars}>
            {[8, 12, 16, 22].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.signalBar,
                  { height: h },
                  isOnline ? styles.signalBarOnline : styles.signalBarOffline,
                ]}
              />
            ))}
          </View>
        </LinearGradient>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  greetingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    marginBottom: 2,
  },
  brandText: {
    fontSize: 22,
    color: colors.white,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  profileButton: {
    overflow: "hidden",
    borderRadius: 16,
  },
  profileGradient: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    alignItems: "center",
  },
  summaryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  cardHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainerWhite: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    padding: 14,
    paddingTop: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  value: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  unit: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 2,
  },
  cardFooter: {
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  status: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  lastReading: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
  },
  connectionCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    alignItems: "center",
  },
  connectionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  connectionContent: {
    flex: 1,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  connectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  signalBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 24,
  },
  signalBar: {
    width: 4,
    borderRadius: 2,
    marginLeft: 3,
  },
  signalBarOnline: {
    backgroundColor: "#4CAF50",
  },
  signalBarOffline: {
    backgroundColor: "#F44336",
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SensorScreen;
