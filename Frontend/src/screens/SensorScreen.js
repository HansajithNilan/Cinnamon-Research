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

const SensorScreen = ({ navigation }) => {
  const sensorData = [
    {
      id: 1,
      icon: "thermometer-outline",
      title: "Temperature",
      value: "22°C",
      status: "Normal",
      statusColor: "#34C759",
      bgColor: "#FFF3E0",
    },
    {
      id: 2,
      icon: "water-outline",
      title: "Humidity",
      value: "65%",
      status: "Optimal",
      statusColor: "#34C759",
      bgColor: "#E3F2FD",
    },
    {
      id: 3,
      icon: "sunny-outline",
      title: "Light Intensity",
      value: "450 lux",
      status: "Indirect",
      statusColor: "#34C759",
      bgColor: "#FFF9C4",
    },
    {
      id: 4,
      icon: "sync-outline",
      title: "Ventilation",
      value: "85%",
      status: "Optimal",
      statusColor: "#34C759",
      bgColor: "#F3E5F5",
    },
    {
      id: 5,
      icon: "bug-outline",
      title: "Pest Control",
      value: "Low Activity",
      status: "Clean",
      statusColor: "#34C759",
      bgColor: "#E8F5E9",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sensor Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {sensorData.map((item) => (
            <View key={item.id} style={styles.card}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: item.bgColor },
                ]}
              >
                <Ionicons name={item.icon} size={25} color="#000" />
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.value}>{item.value}</Text>

              <View style={styles.statusContainer}>
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
          ))}
        </View>
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
    marginTop: 15,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
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
    width: 50,
    height: 50,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  value: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default SensorScreen;
