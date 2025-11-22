import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../styles/colors";

// Circular Progress Component with SVG
const CircularProgress = ({
  percentage,
  size = 120,
  showPercentage = true,
}) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.circularProgress, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8E8E8"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2D5016"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {showPercentage && (
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      )}
    </View>
  );
};

// Temperature display component
const TemperatureDisplay = ({ temperature, size = 140 }) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = 75;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.circularProgress, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E8E8E8"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2D5016"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.percentageContainer}>
        <Text style={styles.temperatureValue}>{temperature}°C</Text>
      </View>
    </View>
  );
};

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cinnamon Soil Monitor</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Module Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Module 1</Text>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusLabel}>Status / තත්වය</Text>
              <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        {/* Real-time Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Real-time Data / තත්‍ය කාලීන දත්ත
          </Text>

          {/* Data Grid */}
          <View style={styles.dataGrid}>
            {/* Nitrogen */}
            <View style={styles.dataCard}>
              <CircularProgress percentage={75} size={110} />
              <Text style={styles.dataLabel}>Nitrogen (N)</Text>
              <Text style={styles.dataLabelSinhala}>නයිට්රජන්</Text>
            </View>

            {/* Phosphorus */}
            <View style={styles.dataCard}>
              <CircularProgress percentage={50} size={110} />
              <Text style={styles.dataLabel}>Phosphorus (P)</Text>
              <Text style={styles.dataLabelSinhala}>පොස්පරස්</Text>
            </View>

            {/* Potassium */}
            <View style={styles.dataCard}>
              <CircularProgress percentage={60} size={110} />
              <Text style={styles.dataLabel}>Potassium (K)</Text>
              <Text style={styles.dataLabelSinhala}>පොටෑසියම්</Text>
            </View>

            {/* Moisture */}
            <View style={styles.dataCard}>
              <CircularProgress percentage={80} size={110} />
              <Text style={styles.dataLabel}>Moisture</Text>
              <Text style={styles.dataLabelSinhala}>තෙතමනය</Text>
            </View>
          </View>

          {/* Temperature Card */}
          <View style={styles.temperatureCard}>
            <TemperatureDisplay temperature={25} size={150} />
            <Text style={styles.dataLabel}>Temperature</Text>
            <Text style={styles.dataLabelSinhala}>උෂ්ණත්වය</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginTop: 20,
    paddingTop: 10,
  },
  settingsButton: {
    padding: 4,
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: "#D8E5D0",
    borderRadius: 16,
    padding: 20,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: "#5A7047",
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  statusText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#2D5016",
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dataCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  circularProgress: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  percentageContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D5016",
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
    marginTop: 4,
  },
  dataLabelSinhala: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  temperatureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  temperatureValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2D5016",
  },
});
