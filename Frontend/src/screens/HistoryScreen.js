import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";

export default function HistoryScreen() {
  const nutrientData = [
    {
      name: "Nitrogen (N) / නයිට්‍රජන්",
      change: "+12%",
      lastDays: "Last 30 Days",
      percentage: "+12%",
      color: "#2e7d32",
      isPositive: true,
    },
    {
      name: "Phosphorus (P) / පොස්පරස්",
      change: "-5%",
      lastDays: "Last 30 Days",
      percentage: "-5%",
      color: "#d32f2f",
      isPositive: false,
    },
    {
      name: "Potassium (K) / පොටෑසියම්",
      change: "+8%",
      lastDays: "Last 30 Days",
      percentage: "+8%",
      color: "#2e7d32",
      isPositive: true,
    },
    {
      name: "Moisture / තෙතමනය",
      change: "+3%",
      lastDays: "Last 30 Days",
      percentage: "+3%",
      color: "#2e7d32",
      isPositive: true,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>30-Day Changes</Text>

        {nutrientData.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={[styles.cardChange, { color: item.color }]}>
              {item.change}
            </Text>
            <View style={styles.cardSubtitle}>
              <Text style={styles.lastDaysText}>{item.lastDays}</Text>
              <Text style={[styles.percentageText, { color: item.color }]}>
                {item.percentage}
              </Text>
            </View>

            {/* Chart Placeholder */}
            <View style={styles.chartContainer}>
              <View
                style={[
                  styles.chartLine,
                  { backgroundColor: item.isPositive ? "#e8f5e9" : "#ffebee" },
                ]}
              >
                <View style={styles.wavyLine}>
                  <Text
                    style={[styles.chartPath, { color: item.color }]}
                  ></Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    paddingTop: 25,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
    marginRight: -10,
    paddingTop: 15,
    marginTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    color: "#000",
    marginBottom: 8,
  },
  cardChange: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardSubtitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  lastDaysText: {
    fontSize: 13,
    color: "#999",
    marginRight: 8,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chartContainer: {
    height: 120,
    marginTop: 8,
  },
  chartLine: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  wavyLine: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  chartPath: {
    fontSize: 40,
    fontWeight: "300",
    letterSpacing: -2,
  },
});
