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
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../styles/colors";

// Import screens
import SensorScreen from "./SensorScreen";
import ComparisonScreen from "./ComparisonScreen";
import SuggestionScreen from "./SuggestionScreen";

const { width } = Dimensions.get("window");
const Tab = createBottomTabNavigator();

const DashboardContent = () => {
  const navigation = useNavigation();

  const standards = [
    {
      id: 1,
      icon: "thermometer-outline",
      title: "Temperature | උෂ්ණත්වය",
      description: "Prevents moisture loss and preserves quality | තෙතමනය නැතිවීම වළක්වා ගුණාත්මකභාවය ආරක්ෂා කරයි",
      value: "18°C - 24°C",
      valueColor: "#FF6B6B",
      bgColor: "rgba(255, 107, 107, 0.12)",
      iconBg: "rgba(255, 107, 107, 0.15)",
      status: "optimal",
    },
    {
      id: 2,
      icon: "water-outline",
      title: "Humidity | ආර්ද්‍රතාවය",
      description: "Avoids mold growth and maintains stickiness | පුස් වර්ධනය වළක්වා ස්වභාවය පවත්වයි",
      value: "60-70% RH",
      valueColor: "#4ECDC4",
      bgColor: "rgba(78, 205, 196, 0.12)",
      iconBg: "rgba(78, 205, 196, 0.15)",
      status: "optimal",
    },
    {
      id: 3,
      icon: "sunny-outline",
      title: "Sunlight Exposure | හිරු එළිය",
      description: "Protects from UV degradation and fading | UV හානියෙන් සහ වර්ණ මැකීමෙන් ආරක්ෂා කරයි",
      value: "Indirect Light | වක්‍ර ආලෝකය",
      valueColor: "#FFE66D",
      bgColor: "rgba(255, 230, 109, 0.12)",
      iconBg: "rgba(255, 230, 109, 0.2)",
      status: "good",
    },
    {
      id: 4,
      icon: "shield-checkmark-outline",
      title: "Pest Control | පළිබෝධ පාලනය",
      description: "Maintains purity and prevents contamination | පිරිසිදුකම පවත්වා දූෂණය වළක්වයි",
      value: "Monitored | නිරීක්ෂණය",
      valueColor: "#00B894",
      bgColor: "rgba(0, 184, 148, 0.12)",
      iconBg: "rgba(0, 184, 148, 0.15)",
      status: "active",
    },
    {
      id: 5,
      icon: "cloud-outline",
      title: "CO₂ Level | CO₂ මට්ටම",
      description: "Monitors carbon dioxide for storage safety | ගබඩා ආරක්ෂාව සඳහා කාබන් ඩයොක්සයිඩ් නිරීක්ෂණය කරයි",
      value: "< 600 ppm",
      valueColor: "#A29BFE",
      bgColor: "rgba(162, 155, 254, 0.12)",
      iconBg: "rgba(162, 155, 254, 0.15)",
      status: "optimal",
    },
    {
      id: 6,
      icon: "rainy-outline",
      title: "Air Moisture | වායුගෝලීය තෙතමනය",
      description: "Tracks absolute moisture in the air | වාතයේ නිරපේක්ෂ තෙතමනය නිරීක්ෂණය කරයි",
      value: "50-65 g/m³",
      valueColor: "#81ECEC",
      bgColor: "rgba(129, 236, 236, 0.12)",
      iconBg: "rgba(129, 236, 236, 0.15)",
      status: "optimal",
    },
    {
      id: 7,
      icon: "flask-outline",
      title: "VOC Level | VOC මට්ටම",
      description: "Detects volatile organic compounds | වාෂ්පශීලී කාබනික සංයෝග හඳුනා ගනියි",
      value: "< 0.5 mg/m³",
      valueColor: "#FD79A8",
      bgColor: "rgba(253, 121, 168, 0.12)",
      iconBg: "rgba(253, 121, 168, 0.15)",
      status: "optimal",
    },
    {
      id: 8,
      icon: "leaf-outline",
      title: "Air Quality | වායු ගුණත්වය",
      description: "Overall air quality index for storage environment | ගබඩා පරිසරය සඳහා සමස්ත වායු ගුණාත්මක දර්ශකය",
      value: "AQI: 50 (Good)",
      valueColor: "#00CEC9",
      bgColor: "rgba(0, 206, 201, 0.12)",
      iconBg: "rgba(0, 206, 201, 0.15)",
      status: "optimal",
    },
  ];

  const quickStats = [
    { label: "Quality Score | ගුණාත්මක ලකුණු", value: "92%", icon: "analytics-outline", color: "#4CAF50" },
    { label: "Active Sensors | සක්‍රිය සංවේදක", value: "12", icon: "hardware-chip-outline", color: "#2196F3" },
    { label: "Alerts | ඇඟවීම්", value: "0", icon: "notifications-outline", color: "#FF9800" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "optimal": return "#00B894";
      case "good": return "#FFB74D";
      case "active": return "#4CAF50";
      default: return "#999";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header Section */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={["#2E7D32", "#4CAF50", "#66BB6A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
          
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <View style={styles.greetingRow}>
                  <Text style={styles.greetingText}>Welcome Back | ආයුබෝවන්</Text>
                  <View style={styles.liveBadge}>
                    <View style={styles.livePulse} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                </View>
                <Text style={styles.brandText}>Warehouse Quality | ගබඩා ගුණාත්මකභාවය</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <LinearGradient
                colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0.15)"]}
                style={styles.profileGradient}
              >
                <Ionicons name="leaf" size={22} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            {quickStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <LinearGradient
                  colors={[`${stat.color}30`, `${stat.color}10`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statIconContainer}
                >
                  <Ionicons name={stat.icon} size={20} color="#FFF" />
                </LinearGradient>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={[styles.statIndicator, { backgroundColor: stat.color }]} />
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Storage Standards | ගබඩා ප්‍රමිතීන්</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            {/* <Text style={styles.seeAllText}>See All | සියල්ල</Text> */}
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {standards.map((item, index) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[item.bgColor, `${item.bgColor}80`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Accent Line */}
              <View style={[styles.cardAccent, { backgroundColor: item.valueColor }]} />
              
              <View style={styles.cardInner}>
                <LinearGradient
                  colors={[item.valueColor, `${item.valueColor}CC`]}
                  style={styles.iconContainer}
                >
                  <Ionicons name={item.icon} size={26} color="#FFF" />
                </LinearGradient>

                <View style={styles.contentContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{item.title}</Text>
                  </View>
                  <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.cardFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                      </Text>
                    </View>
                    <View style={styles.valueTag}>
                      <Text style={[styles.value, { color: item.valueColor }]}>
                        {item.value}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.arrowContainer}>
                  <Ionicons name="chevron-forward" size={20} color={item.valueColor} />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Info Card */}
        <View style={styles.infoCardWrapper}>
          <LinearGradient
            colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoCard}
          >
            {/* Decorative Pattern */}
            <View style={styles.infoDecor1} />
            <View style={styles.infoDecor2} />
            
            <View style={styles.infoMainContent}>
              <LinearGradient
                colors={["#4CAF50", "#2E7D32"]}
                style={styles.infoIconContainer}
              >
                <Ionicons name="shield-checkmark" size={30} color="#FFF" />
              </LinearGradient>
              <View style={styles.infoContent}>
                <View style={styles.infoTitleRow}>
                  <Text style={styles.infoTitle}>Optimal Conditions | ප්‍රශස්ත තත්ත්වයන්</Text>
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                </View>
                <Text style={styles.infoDescription}>
                  All storage parameters are within the recommended range for premium cinnamon quality. | සියලුම ගබඩා පරාමිතීන් උසස් කුරුඳු ගුණාත්මකභාවය සඳහා නිර්දේශිත පරාසය තුළ පවතී.
                </Text>
              </View>
            </View>
            
            {/* Progress Indicator */}
            <View style={styles.qualityProgress}>
              <View style={styles.qualityProgressBar}>
                <LinearGradient
                  colors={["#4CAF50", "#66BB6A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.qualityProgressFill}
                />
              </View>
              <Text style={styles.qualityProgressText}>92% Quality</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

// Main Tab Navigator Component
const DashboardNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "Sensor") {
            iconName = focused ? "hardware-chip" : "hardware-chip-outline";
          } else if (route.name === "Comparison") {
            iconName = focused ? "swap-horizontal" : "swap-horizontal-outline";
          } else if (route.name === "Suggestion") {
            iconName = focused ? "bulb" : "bulb-outline";
          }

          return (
            <View style={focused ? tabStyles.activeIconContainer : tabStyles.iconContainer}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#A0A0A0",
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          paddingTop: 12,
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: "absolute",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardContent} />
      <Tab.Screen name="Sensor" component={SensorScreen} />
      <Tab.Screen name="Comparison" component={ComparisonScreen} />
      <Tab.Screen name="Suggestion" component={SuggestionScreen} />
    </Tab.Navigator>
  );
};

const tabStyles = StyleSheet.create({
  iconContainer: {
    padding: 6,
  },
  activeIconContainer: {
    padding: 8,
    backgroundColor: "rgba(76, 175, 80, 0.12)",
    borderRadius: 14,
  },
});

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
    top: 80,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decorativeCircle3: {
    position: "absolute",
    bottom: 20,
    right: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.06)",
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
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTextContainer: {
    justifyContent: "center",
    flex: 1,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
    marginRight: 4,
  },
  liveText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  statIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    marginRight: 2,
  },
  card: {
    marginBottom: 14,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardGradient: {
    borderRadius: 22,
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardInner: {
    flexDirection: "row",
    padding: 18,
    paddingLeft: 20,
    alignItems: "center",
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.2,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  valueTag: {
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 12,
    color: "#555",
    lineHeight: 17,
  },
  value: {
    fontSize: 12,
    fontWeight: "700",
  },
  infoCardWrapper: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  infoCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
  },
  infoDecor1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  infoDecor2: {
    position: "absolute",
    bottom: -30,
    left: 50,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(76, 175, 80, 0.08)",
  },
  infoMainContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    flex: 1,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  infoDescription: {
    fontSize: 12,
    color: "#2E7D32",
    lineHeight: 18,
  },
  qualityProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  qualityProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 12,
  },
  qualityProgressFill: {
    width: "92%",
    height: "100%",
    borderRadius: 4,
  },
  qualityProgressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D32",
  },
  bottomSpacing: {
    height: 100,
  },
});

export default DashboardNavigator;
