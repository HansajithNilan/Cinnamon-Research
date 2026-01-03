import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";

// Import screens
import SensorScreen from "./SensorScreen";
// Assuming ComparisonScreen and SuggestionScreen exist or will be created/imported correctly.
// If not, we might need placeholders, but user requested these specific imports.
import ComparisonScreen from "./ComparisonScreen";
import SuggestionScreen from "./SuggestionScreen";

const Tab = createBottomTabNavigator();

const DashboardContent = () => {
  const navigation = useNavigation();
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
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="arrow-back" size={28} color={colors.white} />
              </TouchableOpacity>
              <View>
                <Text style={styles.greetingText}>Welcome Back,</Text>
                <Text style={styles.brandText}>Warehouse Quality</Text>
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
            iconName = focused
              ? "swap-horizontal"
              : "swap-horizontal-outline";
          } else if (route.name === "Suggestion") {
            iconName = focused ? "bulb" : "bulb-outline";
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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

export default DashboardNavigator;
