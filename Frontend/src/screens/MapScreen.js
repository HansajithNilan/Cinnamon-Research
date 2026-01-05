import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function MapScreen() {
  const navigation = useNavigation();
  const [searchFocused, setSearchFocused] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const mapScaleAnim = useRef(new Animated.Value(0.95)).current;
  const alertAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(mapScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered alert animations
    const alertStagger = alertAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, alertStagger).start();
  }, []);

  const alerts = [
    {
      id: 1,
      name: "ESP32-A1",
      status: "Low N. Threshold",
      statusSinhala: "අඩු නයිට්‍රජන්",
      type: "critical",
      color: "#D32F2F",
      bgColor: "#FFEBEE",
      badge: "Alert",
      icon: "radio",
      location: "Zone A - North Field",
    },
    {
      id: 2,
      name: "ESP32-B3",
      status: "High P. Threshold",
      statusSinhala: "ඉහළ පොස්පරස්",
      type: "warning",
      color: "#F57C00",
      bgColor: "#FFF3E0",
      badge: "Warning",
      icon: "radio",
      location: "Zone B - Central Field",
    },
    {
      id: 3,
      name: "ESP32-C2",
      status: "Sensor Offline",
      statusSinhala: "සංවේදකය නොබැඳි",
      type: "offline",
      color: "#78909C",
      bgColor: "#ECEFF1",
      badge: "Offline",
      icon: "wifi-outline",
      location: "Zone C - South Field",
    },
  ];

  const mapStats = [
    { label: "Active", value: "8", icon: "radio-button-on", color: "#4CAF50" },
    { label: "Alerts", value: "2", icon: "warning", color: "#F57C00" },
    { label: "Offline", value: "1", icon: "cloud-offline", color: "#78909C" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      {/* Enhanced Header Section */}
      <Animated.View 
        style={[
          styles.headerWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#1B5E20", "#2E7D32", "#43A047"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Decorative elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greetingText}>Field Monitor</Text>
                <Text style={styles.brandText}>Live Map</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.layersButton} activeOpacity={0.8}>
              <LinearGradient
                colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
                style={styles.layersGradient}
              >
                <MaterialCommunityIcons name="layers-triple" size={22} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Map Stats */}
          <View style={styles.statsContainer}>
            {mapStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}25` }]}>
                  <Ionicons name={stat.icon} size={18} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Map Container */}
      <Animated.View 
        style={[
          styles.mapContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: mapScaleAnim }],
          },
        ]}
      >
        {/* Enhanced Search Bar */}
        <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
          <View style={styles.searchIconContainer}>
            <Ionicons name="search" size={18} color={searchFocused ? "#2E7D32" : "#9E9E9E"} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search location / ස්ථානයක් සොයන්න..."
            placeholderTextColor="#9E9E9E"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <TouchableOpacity style={styles.voiceButton}>
            <Ionicons name="mic-outline" size={20} color="#757575" />
          </TouchableOpacity>
        </View>

        {/* Map Placeholder with Grid */}
        <View style={styles.mapPlaceholder}>
          <LinearGradient
            colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
            style={styles.mapGradient}
          >
            {/* Grid overlay */}
            <View style={styles.gridOverlay}>
              {[...Array(6)].map((_, i) => (
                <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 14}%` }]} />
              ))}
              {[...Array(5)].map((_, i) => (
                <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 16}%` }]} />
              ))}
            </View>
            
            {/* Map markers */}
            <View style={[styles.mapMarker, styles.markerActive, { top: "30%", left: "25%" }]}>
              <FontAwesome5 name="map-marker-alt" size={24} color="#2E7D32" />
            </View>
            <View style={[styles.mapMarker, styles.markerAlert, { top: "45%", left: "60%" }]}>
              <FontAwesome5 name="map-marker-alt" size={24} color="#D32F2F" />
            </View>
            <View style={[styles.mapMarker, styles.markerWarning, { top: "65%", left: "40%" }]}>
              <FontAwesome5 name="map-marker-alt" size={24} color="#F57C00" />
            </View>

            {/* Center content */}
            <View style={styles.mapCenterContent}>
              <MaterialCommunityIcons name="map-marker-radius" size={48} color="#2E7D32" />
              <Text style={styles.mapText}>Interactive Map</Text>
              <Text style={styles.mapSubtext}>Google Maps Integration</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Enhanced Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
            <LinearGradient
              colors={["#FFFFFF", "#F5F5F5"]}
              style={styles.controlGradient}
            >
              <Ionicons name="add" size={22} color="#424242" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
            <LinearGradient
              colors={["#FFFFFF", "#F5F5F5"]}
              style={styles.controlGradient}
            >
              <Ionicons name="remove" size={22} color="#424242" />
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.controlDivider} />
          <TouchableOpacity style={styles.controlButton} activeOpacity={0.8}>
            <LinearGradient
              colors={["#2E7D32", "#43A047"]}
              style={styles.controlGradient}
            >
              <Ionicons name="navigate" size={20} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Map type selector */}
        <View style={styles.mapTypeContainer}>
          <TouchableOpacity style={[styles.mapTypeButton, styles.mapTypeActive]}>
            <MaterialCommunityIcons name="map" size={16} color={colors.white} />
            <Text style={styles.mapTypeTextActive}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapTypeButton}>
            <MaterialCommunityIcons name="satellite-variant" size={16} color="#757575" />
            <Text style={styles.mapTypeText}>Satellite</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Alerts Section */}
      <View style={styles.alertsSection}>
        <View style={styles.alertsHeader}>
          <View style={styles.alertsTitleContainer}>
            <MaterialCommunityIcons name="bell-ring-outline" size={22} color="#D32F2F" />
            <Text style={styles.alertsTitle}>Sensor Alerts</Text>
            <View style={styles.alertCountBadge}>
              <Text style={styles.alertCountText}>{alerts.length}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addSensorButton} activeOpacity={0.9}>
            <LinearGradient
              colors={["#2E7D32", "#43A047"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addSensorGradient}
            >
              <Ionicons name="add-circle" size={18} color={colors.white} />
              <Text style={styles.addSensorText}>Add Sensor</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.alertsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.alertsListContent}
        >
          {alerts.map((alert, index) => (
            <Animated.View
              key={alert.id}
              style={[
                {
                  opacity: alertAnimations[index],
                  transform: [{
                    translateX: alertAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  }],
                },
              ]}
            >
              <TouchableOpacity style={styles.alertItem} activeOpacity={0.95}>
                <View style={[styles.alertIcon, { backgroundColor: alert.bgColor }]}>
                  <Ionicons name={alert.icon} size={24} color={alert.color} />
                </View>
                <View style={styles.alertContent}>
                  <View style={styles.alertNameRow}>
                    <Text style={styles.alertName}>{alert.name}</Text>
                    <View style={[styles.statusDot, { backgroundColor: alert.color }]} />
                  </View>
                  <Text style={styles.alertStatus}>{alert.status}</Text>
                  <View style={styles.alertLocationRow}>
                    <Ionicons name="location-outline" size={12} color="#9E9E9E" />
                    <Text style={styles.alertLocation}>{alert.location}</Text>
                  </View>
                </View>
                <View style={styles.alertRight}>
                  <View style={[styles.alertBadge, { backgroundColor: alert.bgColor }]}>
                    <Text style={[styles.alertBadgeText, { color: alert.color }]}>
                      {alert.badge}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.alertArrow}>
                    <Ionicons name="chevron-forward" size={20} color={alert.color} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },
  headerWrapper: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 55 : 45,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -50,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -30,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerTextContainer: {
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  brandText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: "bold",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  layersButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  layersGradient: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 12,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  statLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
    fontWeight: "500",
  },
  mapContainer: {
    height: "42%",
    position: "relative",
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchContainerFocused: {
    borderColor: "#2E7D32",
    shadowColor: "#2E7D32",
    shadowOpacity: 0.2,
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A1A",
    paddingVertical: 8,
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  mapGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(46, 125, 50, 0.1)",
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(46, 125, 50, 0.1)",
  },
  mapMarker: {
    position: "absolute",
    padding: 4,
  },
  markerActive: {
    opacity: 0.9,
  },
  markerAlert: {
    opacity: 1,
  },
  markerWarning: {
    opacity: 0.9,
  },
  mapCenterContent: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  mapText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  mapControls: {
    position: "absolute",
    right: 12,
    bottom: 60,
    zIndex: 10,
  },
  controlButton: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlGradient: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  controlDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
    marginHorizontal: 8,
  },
  mapTypeContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapTypeActive: {
    backgroundColor: "#2E7D32",
  },
  mapTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
    marginLeft: 4,
  },
  mapTypeTextActive: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
    marginLeft: 4,
  },
  alertsSection: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 12,
    paddingTop: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  alertsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  alertsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertsTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  alertCountBadge: {
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  alertCountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#D32F2F",
  },
  addSensorButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addSensorGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addSensorText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
  alertsList: {
    flex: 1,
  },
  alertsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  alertIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  alertContent: {
    flex: 1,
  },
  alertNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  alertName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginRight: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertStatus: {
    fontSize: 13,
    color: "#616161",
    marginBottom: 4,
  },
  alertLocationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertLocation: {
    fontSize: 11,
    color: "#9E9E9E",
    marginLeft: 4,
  },
  alertRight: {
    alignItems: "flex-end",
  },
  alertBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  alertArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
});
