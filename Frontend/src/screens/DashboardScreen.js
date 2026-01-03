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
import { colors } from "../styles/colors";

const DashboardScreen = () => {
  const standards = [
    {
      id: 1,
      icon: "thermometer-outline",
      title: "Temperature",
      description: "Prevents moisture loss and preserves...",
      value: "18°C - 24°C",
      valueColor: "#FF9500",
    },
    {
      id: 2,
      icon: "water-outline",
      title: "Humidity",
      description: "Avoids mold growth and maintains stick...",
      value: "60-70% RH",
      valueColor: "#edbf7eff",
    },
    {
      id: 3,
      icon: "sunny-outline",
      title: "Sunlight...",
      description: "Protects from UV degradation and...",
      value: "Indirect Light",
      valueColor: "#FF9500",
    },
    {
      id: 4,
      icon: "sync-outline",
      title: "Ventilation",
      description: "Ensures consistent conditions and...",
      value: "Good Airflow",
      valueColor: "#FF9500",
    },
    {
      id: 5,
      icon: "bug-outline",
      title: "Pest Control",
      description: "Maintains purity and prevents...",
      value: "Monitored",
      valueColor: "#FF9500",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {standards.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={20} color="#000" />
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>

            <View style={styles.valueContainer}>
              <Text style={[styles.value, { color: item.valueColor }]}>
                {item.value}
              </Text>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
    marginRight: 24,
    paddingTop: 10,
    marginTop: 10,
  },
  menuButton: {
    padding: 4,
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: "#999",
    lineHeight: 20,
  },
  valueContainer: {
    alignItems: "flex-end",
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
  },
});

export default DashboardScreen;
