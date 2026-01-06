import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";

const { width } = Dimensions.get("window");
const cardWidth = (width - 52) / 2;

const SensorScreen = ({ navigation }) => {
  const sensorData = [
    {
      id: 1,
      icon: "thermometer-outline",
      title: "Temperature | උෂ්ණත්වය",
      value: "22°C",
      unit: "",
      status: "Normal | සාමාන්‍ය",
      statusColor: "#00B894",
      gradient: ["#FF6B6B", "#EE5A5A"],
      iconBg: "rgba(255, 107, 107, 0.15)",
      trend: "stable",
      lastReading: "2 min ago | මිනිත්තු 2කට පෙර",
    },
    {
      id: 2,
      icon: "water-outline",
      title: "Humidity | ආර්ද්‍රතාවය",
      value: "65",
      unit: "%",
      status: "Optimal | ප්‍රශස්ත",
      statusColor: "#00B894",
      gradient: ["#4ECDC4", "#45B7AA"],
      iconBg: "rgba(78, 205, 196, 0.15)",
      trend: "up",
      lastReading: "1 min ago | මිනිත්තු 1කට පෙර",
    },
    {
      id: 3,
      icon: "sunny-outline",
      title: "Light Intensity | ආලෝක තීව්‍රතාවය",
      value: "450",
      unit: " lux",
      status: "Indirect | වක්‍ර",
      statusColor: "#00B894",
      gradient: ["#FFE66D", "#FFD93D"],
      iconBg: "rgba(255, 230, 109, 0.2)",
      trend: "down",
      lastReading: "3 min ago | මිනිත්තු 3කට පෙර",
    },
    {
      id: 4,
      icon: "shield-checkmark-outline",
      title: "Pest Control | පළිබෝධ පාලනය",
      value: "Low | අඩු",
      unit: " Activity | ක්‍රියාකාරිත්වය",
      status: "Clean | පිරිසිදු",
      statusColor: "#00B894",
      gradient: ["#00B894", "#00A085"],
      iconBg: "rgba(0, 184, 148, 0.15)",
      trend: "stable",
      lastReading: "5 min ago | මිනිත්තු 5කට පෙර",
    },
    {
      id: 6,
      icon: "speedometer-outline",
      title: "Air Quality | වායු ගුණාත්මකභාවය",
      value: "Good | හොඳ",
      unit: "",
      status: "Healthy | සෞඛ්‍ය සම්පන්න",
      statusColor: "#00B894",
      gradient: ["#74B9FF", "#5AA3E8"],
      iconBg: "rgba(116, 185, 255, 0.15)",
      trend: "up",
      lastReading: "2 min ago | මිනිත්තු 2කට පෙර",
    },
    {
      id: 7,
      icon: "cloud-outline",
      title: "CO₂ Level | CO₂ මට්ටම",
      value: "420",
      unit: " ppm",
      status: "Normal | සාමාන්‍ය",
      statusColor: "#00B894",
      gradient: ["#A29BFE", "#8B7CF6"],
      iconBg: "rgba(162, 155, 254, 0.15)",
      trend: "stable",
      lastReading: "1 min ago | මිනිත්තු 1කට පෙර",
    },
    {
      id: 8,
      icon: "rainy-outline",
      title: "Air Moisture | වායු තෙතමනය",
      value: "58",
      unit: " g/m³",
      status: "Optimal | ප්‍රශස්ත",
      statusColor: "#00B894",
      gradient: ["#81ECEC", "#00CEC9"],
      iconBg: "rgba(129, 236, 236, 0.15)",
      trend: "down",
      lastReading: "2 min ago | මිනිත්තු 2කට පෙර",
    },
    {
      id: 9,
      icon: "flask-outline",
      title: "VOC Level | VOC මට්ටම",
      value: "0.12",
      unit: " mg/m³",
      status: "Safe | ආරක්ෂිත",
      statusColor: "#00B894",
      gradient: ["#FD79A8", "#E84393"],
      iconBg: "rgba(253, 121, 168, 0.15)",
      trend: "stable",
      lastReading: "3 min ago | මිනිත්තු 3කට පෙර",
    },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return "trending-up";
      case "down": return "trending-down";
      default: return "remove-outline";
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "up": return "#00B894";
      case "down": return "#FF6B6B";
      default: return "#999";
    }
  };

  const activeSensors = sensorData.filter(s => s.status !== "Offline").length;
  const optimalSensors = sensorData.filter(s => s.statusColor === "#00B894").length;

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
          {/* Decorative Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              <View>
                <Text style={styles.greetingText}>Live Data Feed | සජීවී දත්ත</Text>
                <Text style={styles.brandText}>Sensor Monitoring | සංවේදක නිරීක්ෂණය</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                style={styles.profileGradient}
              >
                <Ionicons name="hardware-chip" size={22} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconBg, { backgroundColor: "rgba(0, 184, 148, 0.2)" }]}>
                <Ionicons name="radio" size={18} color="#00B894" />
              </View>
              <Text style={styles.summaryValue}>{activeSensors}</Text>
              <Text style={styles.summaryLabel}>Active | සක්‍රිය</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconBg, { backgroundColor: "rgba(116, 185, 255, 0.2)" }]}>
                <Ionicons name="checkmark-done" size={18} color="#74B9FF" />
              </View>
              <Text style={styles.summaryValue}>{optimalSensors}</Text>
              <Text style={styles.summaryLabel}>Optimal | ප්‍රශස්ත</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconBg, { backgroundColor: "rgba(255, 255, 255, 0.2)" }]}>
                <Ionicons name="pulse" size={18} color="#FFF" />
              </View>
              <Text style={styles.summaryValue}>Live | සජීවී</Text>
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
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.liveDot} />
            <Text style={styles.sectionTitle}>All Sensors | සියලුම සංවේදක</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {sensorData.map((item) => (
            <TouchableOpacity key={item.id} activeOpacity={0.85}>
              <View style={styles.card}>
                {/* Gradient Header */}
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

                {/* Card Body */}
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

        {/* Connection Status Card */}
        <LinearGradient
          colors={["#E8F5E9", "#C8E6C9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.connectionCard}
        >
          <View style={styles.connectionIcon}>
            <Ionicons name="wifi" size={28} color="#4CAF50" />
          </View>
          <View style={styles.connectionContent}>
            <Text style={styles.connectionTitle}>All Sensors Connected | සියලුම සංවේදක සම්බන්ධිතයි</Text>
            <Text style={styles.connectionSubtitle}>
              Data syncing every 30 seconds • Last sync: just now | සෑම තත්පර 30කට දත්ත සමමුහුර්ත වේ
            </Text>
          </View>
          <View style={styles.signalBars}>
            <View style={[styles.signalBar, styles.signalBarActive]} />
            <View style={[styles.signalBar, styles.signalBarActive]} />
            <View style={[styles.signalBar, styles.signalBarActive]} />
            <View style={[styles.signalBar, styles.signalBarActive]} />
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
    backgroundColor: "#00B894",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "rgba(76, 175, 80, 0.15)",
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
    color: "#2E7D32",
    marginBottom: 4,
  },
  connectionSubtitle: {
    fontSize: 12,
    color: "#4CAF50",
    lineHeight: 18,
  },
  signalBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 24,
  },
  signalBar: {
    width: 4,
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    borderRadius: 2,
    marginLeft: 3,
  },
  signalBarActive: {
    backgroundColor: "#4CAF50",
  },
  bottomSpacing: {
    height: 100,
  },
});

// Signal bar heights
const signalBarHeights = [8, 12, 16, 22];

export default SensorScreen;
