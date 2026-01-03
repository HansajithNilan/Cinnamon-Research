import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { colors } from "./src/styles/colors";

// Import screens
import DashboardScreen from "./src/screens/DashboardScreen";
import SensorScreen from "./src/screens/SensorScreen";
import ComparisonScreen from "./src/screens/ComparisonScreen";
import SuggestionScreen from "./src/screens/SuggestionScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
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
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Sensor" component={SensorScreen} />
        <Tab.Screen name="Comparison" component={ComparisonScreen} />
        <Tab.Screen name="Suggestion" component={SuggestionScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
