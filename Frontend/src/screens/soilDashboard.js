import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../styles/colors";

// Import screens
import AnalysisScreen from "./AnalysisScreen";
import TipsScreen from "./TipsScreen";
import MapScreen from "./MapScreen";
import HistoryScreen from "./HistoryScreen";
import SettingsScreen from "./SettingsScreen";
import SoilAnalyzeScreen from "./soilAnalyzeScreen";

const Tab = createBottomTabNavigator();

// Circular Progress Component with SVG
const CircularProgress = ({
    percentage,
    size = 120,
    showPercentage = true,
}) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={[styles.circularProgress, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E8E8E8"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#2D5016"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            {showPercentage && (
                <View style={styles.percentageContainer}>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                </View>
            )}
        </View>
    );
};

// Temperature display component
const TemperatureDisplay = ({ temperature, size = 140 }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const percentage = 75;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={[styles.circularProgress, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E8E8E8"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#2D5016"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            <View style={styles.percentageContainer}>
                <Text style={styles.temperatureValue}>{temperature}°C</Text>
            </View>
        </View>
    );
};

function SoilMonitorScreen() {
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
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{ marginRight: 15 }}
                            >
                                <Ionicons name="arrow-back" size={28} color={colors.white} />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.greetingText}>Welcome Back,</Text>
                                <Text style={styles.brandText}>Soil Monitor</Text>
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
                showsVerticalScrollIndicator={false}
            >
                {/* Module Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Module 1</Text>

                    {/* Status Card */}
                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <Text style={styles.statusLabel}>Status / තත්වය</Text>
                            <View style={styles.onlineIndicator} />
                        </View>
                        <Text style={styles.statusText}>Online</Text>
                    </View>
                </View>

                {/* Real-time Data Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Real-time Data / තත්‍ය කාලීන දත්ත
                    </Text>

                    {/* Data Grid */}
                    <View style={styles.dataGrid}>
                        {/* Nitrogen */}
                        <View style={styles.dataCard}>
                            <CircularProgress percentage={75} size={110} />
                            <Text style={styles.dataLabel}>Nitrogen (N)</Text>
                            <Text style={styles.dataLabelSinhala}>නයිට්රජන්</Text>
                        </View>

                        {/* Phosphorus */}
                        <View style={styles.dataCard}>
                            <CircularProgress percentage={50} size={110} />
                            <Text style={styles.dataLabel}>Phosphorus (P)</Text>
                            <Text style={styles.dataLabelSinhala}>පොස්පරස්</Text>
                        </View>

                        {/* Potassium */}
                        <View style={styles.dataCard}>
                            <CircularProgress percentage={60} size={110} />
                            <Text style={styles.dataLabel}>Potassium (K)</Text>
                            <Text style={styles.dataLabelSinhala}>පොටෑසියම්</Text>
                        </View>

                        {/* Moisture */}
                        <View style={styles.dataCard}>
                            <CircularProgress percentage={80} size={110} />
                            <Text style={styles.dataLabel}>Moisture</Text>
                            <Text style={styles.dataLabelSinhala}>තෙතමනය</Text>
                        </View>
                    </View>

                    {/* Temperature Card */}
                    <View style={styles.temperatureCard}>
                        <TemperatureDisplay temperature={25} size={150} />
                        <Text style={styles.dataLabel}>Temperature</Text>
                        <Text style={styles.dataLabelSinhala}>උෂ්ණත්වය</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default function SoilDashboardNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === "Dashboard") {
                        iconName = focused ? "grid" : "grid-outline";
                    } else if (route.name === "Analysis") {
                        iconName = focused ? "analytics" : "analytics-outline";
                    } else if (route.name === "Tips") {
                        iconName = focused ? "bulb" : "bulb-outline";
                    } else if (route.name === "Map") {
                        iconName = focused ? "map" : "map-outline";
                    } else if (route.name === "History") {
                        iconName = focused ? "time" : "time-outline";
                    } else if (route.name === "Settings") {
                        iconName = focused ? "settings" : "settings-outline";
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
            <Tab.Screen name="Dashboard" component={SoilMonitorScreen} />
            <Tab.Screen name="Analysis" component={SoilAnalyzeScreen} />
            <Tab.Screen name="Tips" component={TipsScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

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
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 16,
    },
    statusCard: {
        backgroundColor: "#D8E5D0",
        borderRadius: 16,
        padding: 20,
    },
    statusHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    statusLabel: {
        fontSize: 13,
        color: "#5A7047",
    },
    onlineIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#4CAF50",
    },
    statusText: {
        fontSize: 25,
        fontWeight: "bold",
        color: "#2D5016",
    },
    dataGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    dataCard: {
        width: "48%",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    circularProgress: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    percentageContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
    },
    percentageText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2D5016",
    },
    dataLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
        textAlign: "center",
        marginTop: 4,
    },
    dataLabelSinhala: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        marginTop: 2,
    },
    temperatureCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    temperatureValue: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#2D5016",
    },
});