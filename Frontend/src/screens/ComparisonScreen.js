import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ComparisonScreen = ({ navigation }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Optimal":
        return "#34C759";
      case "Warning":
        return "#FFA500";
      case "Alert":
        return "#FF3B30";
      default:
        return "#34C759";
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case "Optimal":
        return "#34C759";
      case "Warning":
        return "#FFA500";
      case "Alert":
        return "#FF3B30";
      default:
        return "#34C759";
    }
  };

  const sensorReadings = [
    {
      id: 1,
      icon: "thermometer-outline",
      title: "Temperature",
      value: "29°C",
      status: "Warning",
      standard: "Standard: 20°C - 28°C",
      progress: 0.9,
    },
    {
      id: 2,
      icon: "water-outline",
      title: "Humidity",
      value: "68%",
      status: "Optimal",
      standard: "Standard: 60% - 75%",
      progress: 0.67,
    },

    {
      id: 3,
      icon: "sunny-outline",
      title: "Sunlight Exposure",
      value: "1200 Lux",
      status: "Alert",
      standard: "Standard: < 500 Lux",
      progress: 1,
    },
    {
      id: 4,
      icon: "sync-outline",
      title: "Ventilation",
      value: "75%",
      status: "Optimal",
      standard: "Standard: < 85%",
      progress: 0.75,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Condition Comparison</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <Text style={styles.lastUpdated}>Last updated: 14 Aug, 11:32 AM</Text>

        {/* Alert Card */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertTitle}>2 Alerts Active</Text>
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>!</Text>
            </View>
          </View>
          <Text style={styles.alertDescription}>
            Some conditions are outside the standard quality ranges.
          </Text>
          <TouchableOpacity style={styles.alertButton}>
            <Text style={styles.alertButtonText}>View Alert Details</Text>
          </TouchableOpacity>
        </View>

        {/* Live Sensor Readings */}
        <Text style={styles.sectionTitle}>Live Sensor Readings</Text>

        {/* Sensor Cards */}
        {sensorReadings.map((sensor) => (
          <View key={sensor.id} style={styles.sensorCard}>
            <View style={styles.sensorHeader}>
              <View style={styles.sensorTitleRow}>
                <Ionicons name={sensor.icon} size={24} color="#000" />
                <Text style={styles.sensorTitle}>{sensor.title}</Text>
              </View>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(sensor.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(sensor.status) },
                  ]}
                >
                  {sensor.status}
                </Text>
              </View>
            </View>

            <Text style={styles.sensorValue}>{sensor.value}</Text>
            <Text style={styles.sensorStandard}>{sensor.standard}</Text>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${sensor.progress * 100}%`,
                    backgroundColor: getProgressColor(sensor.status),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 4,
    marginTop: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
    marginTop: 25,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },

  lastUpdated: {
    fontSize: 10,
    color: "#999",
    marginBottom: 20,
  },
  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  alertBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  alertBadgeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF3B30",
  },
  alertDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  alertButton: {
    backgroundColor: "#D97031",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  alertButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },
  sensorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sensorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sensorTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sensorValue: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  sensorStandard: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});

export default ComparisonScreen;
