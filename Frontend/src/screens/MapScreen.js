import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";
import { useNavigation } from "@react-navigation/native";

export default function MapScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={[colors.primary, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              <View>
                <Text style={styles.greetingText}>Field Monitor</Text>
                <Text style={styles.brandText}>Live Map</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons
                name="person-circle-outline"
                size={36}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location / ස්ථානයක් සොය..."
            placeholderTextColor="#999"
          />
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>Map View</Text>
          <Text style={styles.mapSubtext}>(Google Maps Integration)</Text>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="navigate" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Alerts Section */}
      <View style={styles.alertsSection}>
        <View style={styles.alertsHeader}>
          <Text style={styles.alertsTitle}>Alerts / ඇඟවීම්</Text>
          <TouchableOpacity style={styles.addSensorButton}>
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addSensorText}>Add Sensor</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.alertsList}
          showsVerticalScrollIndicator={false}
        >
          {/* Alert Item 1 */}
          <TouchableOpacity style={styles.alertItem}>
            <View style={[styles.alertIcon, { backgroundColor: "#fdd" }]}>
              <Ionicons name="radio" size={24} color="#d32f2f" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertName}>ESP32-A1</Text>
              <Text style={styles.alertStatus}>Low N. Threshold</Text>
            </View>
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>Alert</Text>
              <Ionicons name="chevron-forward" size={20} color="#d32f2f" />
            </View>
          </TouchableOpacity>

          {/* Alert Item 2 */}
          <TouchableOpacity style={styles.alertItem}>
            <View style={[styles.alertIcon, { backgroundColor: "#fff4e5" }]}>
              <Ionicons name="radio" size={24} color="#f57c00" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertName}>ESP32-B3</Text>
              <Text style={styles.alertStatus}>High P. Threshold</Text>
            </View>
            <View style={styles.alertBadge}>
              <Text style={[styles.alertBadgeText, { color: "#f57c00" }]}>
                Warning
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#f57c00" />
            </View>
          </TouchableOpacity>

          {/* Alert Item 3 */}
          <TouchableOpacity style={styles.alertItem}>
            <View style={[styles.alertIcon, { backgroundColor: "#e8f5e9" }]}>
              <Ionicons name="wifi-outline" size={24} color="#66bb6a" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertName}>ESP32-C2</Text>
              <Text style={styles.alertStatus}>Offline</Text>
            </View>
            <View style={styles.alertBadge}>
              <Text style={[styles.alertBadgeText, { color: "#66bb6a" }]}>
                Offline
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#66bb6a" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerWrapper: {
    marginBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  brandText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: "bold",
  },
  profileButton: {
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  mapContainer: {
    height: "50%",
    position: "relative",
  },
  searchContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#c8e6c9",
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2e7d32",
  },
  mapSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  mapControls: {
    position: "absolute",
    right: 16,
    bottom: 80,
    zIndex: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: "300",
    color: "#000",
  },
  alertsSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 20,
  },
  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  addSensorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2e5d1e",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addSensorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  alertsList: {
    paddingHorizontal: 16,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  alertIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  alertStatus: {
    fontSize: 13,
    color: "#666",
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d32f2f",
    marginRight: 4,
  },
});
