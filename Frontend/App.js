import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { colors } from "./src/styles/colors";

// Import screens
import HomeScreen from "./src/screens/HomeScreen";
import AnalyzeScreen from "./src/screens/AnalyzeScreen";
import ChatScreen from "./src/screens/ChatScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Analyze") {
              iconName = focused ? "document-text" : "document-text-outline";
            } else if (route.name === "Chat") {
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            height: 70,
            paddingBottom: 28,
            paddingTop: 8,
         
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Analyze" component={AnalyzeScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
