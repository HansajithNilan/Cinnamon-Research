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

const ComparisonScreen = ({ navigation }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Optimal":
        return "#00B894";
      case "Warning":
        return "#FDCB6E";
      case "Alert":
        return "#FF6B6B";
      default:
        return "#00B894";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "Optimal":
        return "rgba(0, 184, 148, 0.12)";
      case "Warning":
        return "rgba(253, 203, 110, 0.15)";
      case "Alert":
        return "rgba(255, 107, 107, 0.12)";
      default:
        return "rgba(0, 184, 148, 0.12)";
    }
  };

  const getCardGradient = (status) => {
    switch (status) {
      case "Optimal":
        return ["#FFFFFF", "#F0FFF4"];
      case "Warning":
        return ["#FFFFFF", "#FFFBF0"];
      case "Alert":
        return ["#FFFFFF", "#FFF5F5"];
      default:
        return ["#FFFFFF", "#F0FFF4"];
    }
  };

  const getIconColor = (status) => {
    switch (status) {
      case "Optimal":
        return "#00B894";
      case "Warning":
        return "#F39C12";
      case "Alert":
        return "#E74C3C";
      default:
        return "#00B894";
    }
  };

  const sensorReadings = [
    {
      id: 1,
      icon: "thermometer-outline",
      title: "Temperature | උෂ්ණත්වය",
      value: "29°C",
      status: "Warning",
      standard: "Standard | ප්‍රමිතිය: 20°C - 28°C",
      progress: 0.9,
      trend: "up",
    },
    {
      id: 2,
      icon: "water-outline",
      title: "Humidity | ආර්ද්‍රතාවය",
      value: "68%",
      status: "Optimal",
      standard: "Standard | ප්‍රමිතිය: 60% - 75%",
      progress: 0.67,
      trend: "stable",
    },
    {
      id: 3,
      icon: "sunny-outline",
      title: "Sunlight Exposure | හිරු එළිය",
      value: "1200 Lux",
      status: "Alert",
      standard: "Standard | ප්‍රමිතිය: < 500 Lux",
      progress: 1,
      trend: "up",
    },
    {
      id: 4,
      icon: "cloud-outline",
      title: "CO₂ Level | CO₂ මට්ටම",
      value: "420 ppm",
      status: "Optimal",
      standard: "Standard | ප්‍රමිතිය: < 600 ppm",
      progress: 0.7,
      trend: "stable",
    },
    {
      id: 5,
      icon: "rainy-outline",
      title: "Air Moisture | වායු තෙතමනය",
      value: "58 g/m³",
      status: "Optimal",
      standard: "Standard | ප්‍රමිතිය: 50-65 g/m³",
      progress: 0.65,
      trend: "down",
    },
    {
      id: 6,
      icon: "flask-outline",
      title: "VOC Level | VOC මට්ටම",
      value: "0.12 mg/m³",
      status: "Optimal",
      standard: "Standard | ප්‍රමිතිය: < 0.5 mg/m³",
      progress: 0.24,
      trend: "stable",
    },
  ];

  const alertCount = sensorReadings.filter(s => s.status === "Alert").length;
  const warningCount = sensorReadings.filter(s => s.status === "Warning").length;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return "trending-up";
      case "down": return "trending-down";
      default: return "remove-outline";
    }
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
                <Text style={styles.greetingText}>Real-time Analysis | තත්කාලීන විශ්ලේෂණය</Text>
                <Text style={styles.brandText}>Condition Check | තත්ත්ව පරීක්ෂාව</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                style={styles.profileGradient}
              >
                <Ionicons name="pulse" size={22} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconBg, { backgroundColor: "rgba(0, 184, 148, 0.2)" }]}>
                <Ionicons name="checkmark-circle" size={20} color="#00B894" />
              </View>
              <Text style={styles.summaryValue}>{sensorReadings.filter(s => s.status === "Optimal").length}</Text>
              <Text style={styles.summaryLabel}>Optimal | ප්‍රශස්ත</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconBg, { backgroundColor: "rgba(253, 203, 110, 0.2)" }]}>
                <Ionicons name="warning" size={20} color="#F39C12" />
              </View>
              <Text style={styles.summaryValue}>{warningCount}</Text>
              <Text style={styles.summaryLabel}>Warning | අවවාදය</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIconBg, { backgroundColor: "rgba(255, 107, 107, 0.2)" }]}>
                <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
              </View>
              <Text style={styles.summaryValue}>{alertCount}</Text>
              <Text style={styles.summaryLabel}>Alert | ඇඟවීම</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <View style={styles.lastUpdatedContainer}>
          <View style={styles.liveDot} />
          <Text style={styles.lastUpdated}>Live | සජීවී • Last updated | අවසන් යාවත්කාල: 14 Aug, 11:32 AM</Text>
          <TouchableOpacity style={styles.refreshButton}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Alert Card */}
        {(alertCount > 0 || warningCount > 0) && (
          <LinearGradient
            colors={["#FF6B6B", "#EE5A5A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.alertCard}
          >
            <View style={styles.alertIconContainer}>
              <Ionicons name="notifications" size={28} color="#FFF" />
            </View>
            <View style={styles.alertContent}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{alertCount + warningCount} Issues Detected | ගැටළු හඳුනාගත්</Text>
                <View style={styles.alertBadge}>
                  <Ionicons name="alert" size={16} color="#FF6B6B" />
                </View>
              </View>
              <Text style={styles.alertDescription}>
                Some conditions are outside the recommended quality ranges. Immediate attention required. | සමහර තත්ත්වයන් නිර්දේශිත ගුණාත්මක පරාසයන්ට පිටතය. ක්ෂණික අවධානය අවශ්‍යයි.
              </Text>
              <TouchableOpacity style={styles.alertButton}>
                <Text style={styles.alertButtonText}>View Details | විස්තර බලන්න</Text>
                <Ionicons name="chevron-forward" size={18} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {/* Section Header */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Sensor Readings | සජීවී සංවේදක කියවීම්</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View> */}

        {/* Sensor Cards */}
        {/* {sensorReadings.map((sensor) => (
          <TouchableOpacity key={sensor.id} activeOpacity={0.8}>
            <LinearGradient
              colors={getCardGradient(sensor.status)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sensorCard}
            >
              <View style={styles.sensorHeader}>
                <View style={styles.sensorTitleRow}>
                  <View style={[styles.sensorIconContainer, { backgroundColor: getStatusBgColor(sensor.status) }]}>
                    <Ionicons name={sensor.icon} size={24} color={getIconColor(sensor.status)} />
                  </View>
                  <View style={styles.sensorTitleContainer}>
                    <Text style={styles.sensorTitle}>{sensor.title}</Text>
                    <Text style={styles.sensorStandard}>{sensor.standard}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(sensor.status) }]}>
                  <View
                    style={[styles.statusDot, { backgroundColor: getStatusColor(sensor.status) }]}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(sensor.status) }]}>
                    {sensor.status}
                  </Text>
                </View>
              </View>

              <View style={styles.valueRow}>
                <Text style={[styles.sensorValue, { color: getIconColor(sensor.status) }]}>
                  {sensor.value}
                </Text>
                <View style={styles.trendContainer}>
                  <Ionicons 
                    name={getTrendIcon(sensor.trend)} 
                    size={20} 
                    color={sensor.trend === "up" ? "#FF6B6B" : sensor.trend === "down" ? "#00B894" : "#999"} 
                  />
                </View>
              </View>

             
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[getStatusColor(sensor.status), getStatusColor(sensor.status) + "80"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${sensor.progress * 100}%` }]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(sensor.progress * 100)}%</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))} */}

        {/* Recommendation Card */}
        <LinearGradient
          colors={["#E8F5E9", "#C8E6C9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.recommendationCard}
        >
          <View style={styles.recommendationIcon}>
            <Ionicons name="bulb" size={28} color="#4CAF50" />
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>Quick Tip | ඉක්මන් ඉඟිය</Text>
            <Text style={styles.recommendationText}>
              Consider adjusting the sunlight exposure by closing blinds during peak hours (10 AM - 3 PM). | උච්ච වේලාවන්හි (පෙ.ව. 10 - ප.ව. 3) අන්ධකාරය වසා හිරු එළිය සකසන්න.
            </Text>
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
    fontSize: 22,
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
    paddingTop: 16,
  },
  lastUpdatedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00B894",
    marginRight: 8,
  },
  lastUpdated: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  alertIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  alertBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  alertDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 14,
    lineHeight: 20,
  },
  alertButton: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  alertButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B6B",
    marginRight: 4,
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  sensorCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  sensorHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sensorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sensorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  sensorTitleContainer: {
    flex: 1,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  sensorStandard: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sensorValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  trendContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 5,
    overflow: "hidden",
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    minWidth: 40,
    textAlign: "right",
  },
  recommendationCard: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    alignItems: "center",
  },
  recommendationIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: "#4CAF50",
    lineHeight: 19,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ComparisonScreen;
