import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ImageScreen from "./src/screens/ImageScreen";
import AnalysisScreen from "./src/screens/AnalysisScreen";
import AnalysisDetailsScreen from "./src/screens/AnalysisDetailsScreen";
import GuideScreen from "./src/screens/GuideScreen";
import { StatusBar } from "expo-status-bar";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Image"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Image" component={ImageScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
        <Stack.Screen name="Details" component={AnalysisDetailsScreen} />
        <Stack.Screen name="Guide" component={GuideScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
