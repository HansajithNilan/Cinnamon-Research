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
  getTempStatus,
  getHumidityStatus,
  getCO2Status,
  getVOCStatus,
  getLightStatus,
  getMotionStatus,
  getAirQualityStatus,
} from "../config/soil/warehouseThresholds";
import { ref, onValue } from "firebase/database";
import { database as warehouseDb } from "../config/warehouse/firebase";

const { width } = Dimensions.get("window");
const cardWidth = (width - 52) / 2;

const DEVICE_ID = "249627E81F84";

function formatTimeAgo(dateTimeStr) {
  if (!dateTimeStr) return "—";

  try {
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
    if (days === 1) return "1 day ago | දිනයකට පෙර";

    return `${days} days ago | දින ${days}කට පෙර`;
  } catch {
    return dateTimeStr;
  }
}

function parseSensorDateTime(dateTimeStr) {
  if (!dateTimeStr) return null;

  try {
    const [datePart, timePart] = dateTimeStr.split(" ");
    return new Date(`${datePart}T${timePart}+05:30`).getTime();
  } catch {
    return null;
  }
}

function getTodaySriLankaDate() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Colombo",
  });
}

function buildDateTimeFromCurrent(current) {
  if (!current) return null;

  if (current.date_time) {
    return current.date_time;
  }

  if (current.date && current.time) {
    return `${current.date} ${current.time}`;
  }

  if (current.last_update) {
    return `${getTodaySriLankaDate()} ${current.last_update}`;
  }

  return null;
}

function normalizeBoolean(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;

  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();

    if (
      normalized === "true" ||
      normalized === "yes" ||
      normalized === "detected" ||
      normalized === "motion detected"
    ) {
      return true;
    }

    if (
      normalized === "false" ||
      normalized === "no" ||
      normalized === "clear" ||
      normalized === "not detected" ||
      normalized === "no motion"
    ) {
      return false;
    }
  }

  return null;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? null : numberValue;
}

function subscribeLatest(path, callback) {
  const dbRef = ref(warehouseDb, path);

  console.log("🔗 Subscribing to:", path);

  const unsubscribe = onValue(
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

      if (!data[latestDate]) {
        callback(null);
        return;
      }

      const timestamps = Object.keys(data[latestDate]).sort(
        (a, b) => Number(a) - Number(b)
      );

      const latestTs = timestamps[timestamps.length - 1];
      const entry = data[latestDate][latestTs];

      console.log(`✅ Latest from ${path} (${latestDate}@${latestTs}):`, entry);

      callback(entry);
    },
    (error) => {
      console.error(`❌ Firebase error at ${path}:`, error);
      callback(null);
    }
  );

  return unsubscribe;
}

const SensorScreen = ({ navigation }) => {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [light, setLight] = useState(null);
  const [motion, setMotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncTs, setLastSyncTs] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [dataUpdateCount, setDataUpdateCount] = useState(0);

  const unsubscribers = useRef([]);
  const loadedSources = useRef(new Set());

  useEffect(() => {
    const check = () => {
      if (lastSyncTs) {
        const stale = Date.now() - lastSyncTs > 60000;
        setIsOnline(!stale);
      } else {
        setIsOnline(false);
      }
    };

    check();

    const id = setInterval(check, 5000);

    return () => clearInterval(id);
  }, [lastSyncTs]);

  useEffect(() => {
    const basePath = `devices/${DEVICE_ID}`;

    console.log("📍 Firebase Base Path:", basePath);
    console.log("🔧 Expected Paths:");
    console.log("  - Temperature:", `${basePath}/temperature_data`);
    console.log("  - Humidity:", `${basePath}/humidity_data`);
    console.log("  - Air Quality:", `${basePath}/air_quality_data`);
    console.log("  - Current for LDR and Motion:", `${basePath}/current`);

    const totalSources = 4;

    function markLoaded(sourceName, entry) {
      loadedSources.current.add(sourceName);

      if (entry?.date_time) {
        const ts = parseSensorDateTime(entry.date_time);

        if (ts) {
          setLastSyncTs(ts);
        }
      }

      if (loadedSources.current.size >= totalSources) {
        setLoading(false);
      }

      setDataUpdateCount((prev) => prev + 1);

      console.log(
        `📊 Loaded sources: ${loadedSources.current.size}/${totalSources}`
      );
    }

    const unsubTemp = subscribeLatest(`${basePath}/temperature_data`, (entry) => {
      console.log("🌡️ Temperature:", entry);
      setTemperature(entry);
      markLoaded("temperature", entry);
    });

    const unsubHumid = subscribeLatest(`${basePath}/humidity_data`, (entry) => {
      console.log("💧 Humidity:", entry);
      setHumidity(entry);
      markLoaded("humidity", entry);
    });

    const unsubAir = subscribeLatest(`${basePath}/air_quality_data`, (entry) => {
      console.log("🌫️ Air Quality:", entry);
      setAirQuality(entry);
      markLoaded("air", entry);
    });

    const currentRef = ref(warehouseDb, `${basePath}/current`);

    const unsubCurrent = onValue(
      currentRef,
      (snap) => {
        const current = snap.val();

        console.log("📦 Current Data for LDR and Motion:", current);

        if (!current) {
          console.warn("⚠️ No current data found");

          setLight(null);
          setMotion(null);

          markLoaded("current", null);
          return;
        }

        const dateTime = buildDateTimeFromCurrent(current);

        const luxValue = normalizeNumber(
          current.lux ??
            current.ldr ??
            current.light ??
            current.light_intensity ??
            current.lightIntensity
        );

        const brightnessValue = normalizeNumber(
          current.brightness ??
            current.brightness_percent ??
            current.brightnessPercent
        );

        const motionValue =
          current.motion ?? current.motion_detected ?? current.motionDetected;

        const motionDetected = normalizeBoolean(motionValue);

        setLight({
          lux: luxValue,
          brightness: brightnessValue,
          date_time: dateTime,
        });

        setMotion({
          motion_detected: motionDetected,
          motion_confidence: motionDetected ? 100 : 0,
          date_time: dateTime,
        });

        console.log("💡 LDR Data:", {
          lux: luxValue,
          brightness: brightnessValue,
          date_time: dateTime,
        });

        console.log("🚨 Motion Data:", {
          motion_detected: motionDetected,
          date_time: dateTime,
        });

        markLoaded("current", { date_time: dateTime });
      },
      (error) => {
        console.error("❌ Firebase error at current:", error);

        setLight(null);
        setMotion(null);

        markLoaded("current", null);
      }
    );

    unsubscribers.current = [
      unsubTemp,
      unsubHumid,
      unsubAir,
      unsubCurrent,
    ];

    return () => {
      unsubscribers.current.forEach((unsubscribe) => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      });
    };
  }, []);

  useEffect(() => {
    if (temperature || humidity || airQuality || light || motion) {
      console.log("\n🔍 REAL-TIME DATA RECEIVED:");
      console.log(
        "✅ Temperature:",
        temperature?.value,
        "°C @",
        temperature?.date_time
      );
      console.log(
        "✅ Humidity:",
        humidity?.value,
        "% @",
        humidity?.date_time
      );
      console.log(
        "✅ Air Quality:",
        {
          co2: airQuality?.co2,
          voc: airQuality?.voc,
        },
        "@",
        airQuality?.date_time
      );
      console.log("✅ LDR Light:", light?.lux, "lux @", light?.date_time);
      console.log("✅ Brightness:", light?.brightness, "@", light?.date_time);
      console.log("✅ Motion:", motion?.motion_detected, "@", motion?.date_time);
      console.log("📊 Total Updates:", dataUpdateCount);
      console.log(
        "⏱️ Last Sync:",
        lastSyncTs ? new Date(lastSyncTs).toLocaleString() : "Never"
      );
      console.log("🌐 Status:", isOnline ? "🟢 ONLINE" : "🔴 OFFLINE", "\n");
    }
  }, [
    temperature,
    humidity,
    airQuality,
    light,
    motion,
    dataUpdateCount,
    isOnline,
    lastSyncTs,
  ]);

  const tempVal = normalizeNumber(temperature?.value);
  const humidVal = normalizeNumber(humidity?.value);
  const co2Val = normalizeNumber(airQuality?.co2);
  const vocVal = normalizeNumber(airQuality?.voc);
  const luxVal = normalizeNumber(light?.lux);
  const brightnessVal = normalizeNumber(light?.brightness);
  const motionDetected = motion?.motion_detected ?? null;

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
      title: "LDR Light | ආලෝක සංවේදකය",
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
      icon: "bulb-outline",
      title: "Brightness | දීප්තිය",
      value: brightnessVal !== null ? Math.round(brightnessVal).toString() : "--",
      unit: " %",
      status: lightStatus.label,
      statusColor: lightStatus.color,
      gradient: ["#FDCB6E", "#E17055"],
      trend: "stable",
      lastReading: formatTimeAgo(light?.date_time),
    },
    {
      id: 5,
      icon: "shield-checkmark-outline",
      title: "Motion | චලනය",
      value:
        motionDetected === false
          ? "Detected"
          : motionDetected
          ? "Detected | හඳුනාගත්"
          : "Clear | පැහැදිලි",
      unit: "",
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

  const activeSensors = sensorData.filter((sensor) => sensor.value !== "--").length;
  const optimalSensors = sensorData.filter(
    (sensor) => sensor.statusColor === "#00B894"
  ).length;

  const getTrendIcon = () => "remove-outline";

  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";

    const d = new Date(ts);

    if (isNaN(d.getTime())) return "Just now";

    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
                <Text style={styles.greetingText}>
                  Live Data Feed | සජීවී දත්ත
                </Text>
                <Text style={styles.brandText}>
                  Sensor Monitoring | සංවේදක නිරීක්ෂණය
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <View
                style={[
                  styles.summaryIconBg,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
              >
                <Ionicons name="radio" size={18} color="#FFF" />
              </View>
              <Text style={styles.summaryValue}>{activeSensors}</Text>
              <Text style={styles.summaryLabel}>Active | සක්‍රිය</Text>
            </View>

            <View style={styles.summaryCard}>
              <View
                style={[
                  styles.summaryIconBg,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
              >
                <Ionicons name="checkmark-done" size={18} color="#FFF" />
              </View>
              <Text style={styles.summaryValue}>{optimalSensors}</Text>
              <Text style={styles.summaryLabel}>Optimal | ප්‍රශස්ත</Text>
            </View>

            <View style={styles.summaryCard}>
              <View
                style={[
                  styles.summaryIconBg,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
              >
                <Ionicons
                  name={
                    loading
                      ? "pulse"
                      : isOnline
                      ? "wifi"
                      : "cloud-offline-outline"
                  }
                  size={18}
                  color="#FFF"
                />
              </View>
              <Text style={styles.summaryValue}>
                {loading ? "..." : isOnline ? "Online" : "Offline"}
              </Text>
              <Text style={styles.summaryLabel}>Status | තත්ත්වය</Text>
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
            <View
              style={[
                styles.liveDot,
                { backgroundColor: loading ? "#FDCB6E" : "#00B894" },
              ]}
            />
            <Text style={styles.sectionTitle}>
              All Sensors | සියලුම සංවේදක
            </Text>
          </View>

          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        <View style={styles.realtimeStatus}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isOnline ? "#4CAF50" : "#F44336" },
            ]}
          >
            <Ionicons
              name={isOnline ? "checkmark-circle" : "close-circle"}
              size={14}
              color="#FFF"
            />
            <Text style={styles.statusText}>
              {isOnline ? "🔴 Live Data" : "⚫ No Data"} • Updates: {dataUpdateCount}
            </Text>
          </View>
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
                        <Ionicons
                          name={item.icon}
                          size={24}
                          color={item.gradient[0]}
                        />
                      </View>

                      <View
                        style={[
                          styles.trendBadge,
                          { backgroundColor: "rgba(255,255,255,0.25)" },
                        ]}
                      >
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
                      <View
                        style={[
                          styles.statusContainer,
                          { backgroundColor: `${item.statusColor}15` },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: item.statusColor },
                          ]}
                        />
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

        <LinearGradient
          colors={isOnline ? ["#E8F5E9", "#C8E6C9"] : ["#FFEBEE", "#FFCDD2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.connectionCard}
        >
          <View
            style={[
              styles.connectionIcon,
              {
                backgroundColor: isOnline
                  ? "rgba(76, 175, 80, 0.15)"
                  : "rgba(244, 67, 54, 0.15)",
              },
            ]}
          >
            <Ionicons
              name={isOnline ? "wifi" : "wifi-outline"}
              size={28}
              color={isOnline ? "#4CAF50" : "#F44336"}
            />
          </View>

          <View style={styles.connectionContent}>
            <Text
              style={[
                styles.connectionTitle,
                { color: isOnline ? "#2E7D32" : "#C62828" },
              ]}
            >
              {isOnline
                ? "All Sensors Connected | සියලුම සංවේදක සම්බන්ධිතයි"
                : "Device Offline | උපාංගය නොබැඳිව"}
            </Text>

            <Text
              style={[
                styles.connectionSubtitle,
                { color: isOnline ? "#4CAF50" : "#F44336" },
              ]}
            >
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
  realtimeStatus: {
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
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
