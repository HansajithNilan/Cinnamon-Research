import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { colors } from "../styles/colors";

// Import screens
import AnalysisScreen from "./AnalysisScreen";
import TipsScreen from "./TipsScreen";
import MapScreen from "./MapScreen";
import HistoryScreen from "./HistoryScreen";
import SettingsScreen from "./SettingsScreen";
import SoilAnalyzeScreen from "./soilAnalyzeScreen";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get("window");

// Color schemes for different metrics
const metricColors = {
    nitrogen: { primary: "#4CAF50", secondary: "#81C784", bg: "#E8F5E9" },
    phosphorus: { primary: "#FF9800", secondary: "#FFB74D", bg: "#FFF3E0" },
    potassium: { primary: "#9C27B0", secondary: "#BA68C8", bg: "#F3E5F5" },
    moisture: { primary: "#2196F3", secondary: "#64B5F6", bg: "#E3F2FD" },
    ph: { primary: "#00BCD4", secondary: "#4DD0E1", bg: "#E0F7FA" },
    ec: { primary: "#FF5722", secondary: "#FF8A65", bg: "#FBE9E7" },
    temperature: { primary: "#E91E63", secondary: "#F06292", bg: "#FCE4EC" },
};

// Enhanced Circular Progress Component with gradient
const CircularProgress = ({
    percentage,
    size = 100,
    showPercentage = true,
    color = "#2D5016",
    icon,
    value,
    unit,
}) => {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={[styles.circularProgress, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <Defs>
                    <SvgGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={color} stopOpacity="1" />
                        <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
                    </SvgGradient>
                </Defs>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#F0F0F0"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
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
                {icon ? (
                    <MaterialCommunityIcons name={icon} size={24} color={color} />
                ) : value ? (
                    <View style={styles.valueContainer}>
                        <Text style={[styles.valueText, { color }]}>{value}</Text>
                        {unit && <Text style={[styles.unitText, { color }]}>{unit}</Text>}
                    </View>
                ) : (
                    <Text style={[styles.percentageText, { color }]}>{percentage}%</Text>
                )}
            </View>
        </View>
    );
};

// Data Card Component
const DataCard = ({ title, titleSinhala, percentage, color, icon, value, unit, status }) => {
    const getStatusColor = () => {
        if (percentage >= 70) return "#4CAF50";
        if (percentage >= 40) return "#FF9800";
        return "#F44336";
    };

    return (
        <View style={[styles.dataCard, { borderLeftColor: color.primary, borderLeftWidth: 4 }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: color.bg }]}>
                    <MaterialCommunityIcons name={icon} size={22} color={color.primary} />
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + "20" }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                    <Text style={[styles.statusBadgeText, { color: getStatusColor() }]}>
                        {percentage >= 70 ? "Good" : percentage >= 40 ? "Fair" : "Low"}
                    </Text>
                </View>
            </View>
            <CircularProgress
                percentage={percentage}
                size={90}
                color={color.primary}
                value={value}
                unit={unit}
            />
            <Text style={styles.dataLabel}>{title}</Text>
            <Text style={styles.dataLabelSinhala}>{titleSinhala}</Text>
        </View>
    );
};

// Temperature Card Component
const TemperatureCard = ({ temperature }) => {
    const getTemperatureStatus = (temp) => {
        if (temp >= 20 && temp <= 30) return { status: "Optimal", color: "#4CAF50" };
        if (temp >= 15 && temp < 20) return { status: "Cool", color: "#2196F3" };
        if (temp > 30 && temp <= 35) return { status: "Warm", color: "#FF9800" };
        return { status: "Extreme", color: "#F44336" };
    };

    const tempStatus = getTemperatureStatus(temperature);
    const percentage = Math.min((temperature / 50) * 100, 100);

    return (
        <LinearGradient
            colors={[metricColors.temperature.bg, "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.temperatureCard}
        >
            <View style={styles.tempHeader}>
                <View style={[styles.tempIconContainer, { backgroundColor: metricColors.temperature.primary + "20" }]}>
                    <MaterialCommunityIcons name="thermometer" size={28} color={metricColors.temperature.primary} />
                </View>
                <View style={[styles.tempStatusBadge, { backgroundColor: tempStatus.color + "20" }]}>
                    <Text style={[styles.tempStatusText, { color: tempStatus.color }]}>{tempStatus.status}</Text>
                </View>
            </View>
            <View style={styles.tempContent}>
                <CircularProgress
                    percentage={percentage}
                    size={130}
                    color={metricColors.temperature.primary}
                    value={temperature}
                    unit="°C"
                />
            </View>
            <Text style={styles.tempLabel}>Temperature / උෂ්ණත්වය</Text>
            <View style={styles.tempRange}>
                <Text style={styles.tempRangeText}>Optimal: 20°C - 30°C</Text>
            </View>
        </LinearGradient>
    );
};

function SoilMonitorScreen() {
    const navigation = useNavigation();
    
    // Sample data - replace with real sensor data
    const sensorData = {
        nitrogen: 75,
        phosphorus: 50,
        potassium: 60,
        moisture: 80,
        ph: 6.5,
        ec: 1.2,
        temperature: 25,
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <LinearGradient
                colors={["#1B5E20", "#2E7D32", "#43A047"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <View style={styles.topBar}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.greetingText}>Welcome Back</Text>
                            <Text style={styles.brandText}>Soil Monitor</Text>
                        </View>
                        <TouchableOpacity style={styles.profileButton}>
                            <LinearGradient
                                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                                style={styles.profileGradient}
                            >
                                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Module Status */}
                    <View style={styles.moduleStatus}>
                        <View style={styles.moduleInfo}>
                            <MaterialCommunityIcons name="chip" size={20} color="#FFFFFF" />
                            <Text style={styles.moduleText}>Module 1</Text>
                        </View>
                        <View style={styles.onlineStatus}>
                            <View style={styles.pulseOuter}>
                                <View style={styles.pulseInner} />
                            </View>
                            <Text style={styles.onlineText}>Online</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Real-time Data Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="chart-timeline-variant" size={24} color="#1B5E20" />
                        <Text style={styles.sectionTitle}>Real-time Data</Text>
                        <Text style={styles.sectionSubtitle}>තත්‍ය කාලීන දත්ත</Text>
                    </View>

                    {/* Data Grid */}
                    <View style={styles.dataGrid}>
                        <DataCard
                            title="Nitrogen (N)"
                            titleSinhala="නයිට්රජන්"
                            percentage={sensorData.nitrogen}
                            color={metricColors.nitrogen}
                            icon="leaf"
                        />
                        <DataCard
                            title="Phosphorus (P)"
                            titleSinhala="පොස්පරස්"
                            percentage={sensorData.phosphorus}
                            color={metricColors.phosphorus}
                            icon="atom"
                        />
                        <DataCard
                            title="Potassium (K)"
                            titleSinhala="පොටෑසියම්"
                            percentage={sensorData.potassium}
                            color={metricColors.potassium}
                            icon="flask"
                        />
                        <DataCard
                            title="Moisture"
                            titleSinhala="තෙතමනය"
                            percentage={sensorData.moisture}
                            color={metricColors.moisture}
                            icon="water"
                        />
                        <DataCard
                            title="pH Level"
                            titleSinhala="pH මට්ටම"
                            percentage={(sensorData.ph / 14) * 100}
                            value={sensorData.ph.toFixed(1)}
                            color={metricColors.ph}
                            icon="test-tube"
                        />
                        <DataCard
                            title="EC (mS/cm)"
                            titleSinhala="විද්‍යුත් සන්නායකතාව"
                            percentage={(sensorData.ec / 4) * 100}
                            value={sensorData.ec.toFixed(1)}
                            color={metricColors.ec}
                            icon="flash"
                        />
                    </View>

                    {/* Temperature Card */}
                    <TemperatureCard temperature={sensorData.temperature} />
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient
                                colors={["#2196F3", "#1976D2"]}
                                style={styles.actionGradient}
                            >
                                <MaterialCommunityIcons name="refresh" size={22} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={styles.actionText}>Refresh</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient
                                colors={["#4CAF50", "#388E3C"]}
                                style={styles.actionGradient}
                            >
                                <MaterialCommunityIcons name="download" size={22} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={styles.actionText}>Export</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient
                                colors={["#FF9800", "#F57C00"]}
                                style={styles.actionGradient}
                            >
                                <MaterialCommunityIcons name="bell-outline" size={22} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={styles.actionText}>Alerts</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <LinearGradient
                                colors={["#9C27B0", "#7B1FA2"]}
                                style={styles.actionGradient}
                            >
                                <MaterialCommunityIcons name="history" size={22} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={styles.actionText}>History</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 30 }} />
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
        backgroundColor: "#F8FAF8",
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 15,
    },
    greetingText: {
        fontSize: 13,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "500",
    },
    brandText: {
        fontSize: 22,
        color: "#FFFFFF",
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    profileButton: {
        marginLeft: 10,
    },
    profileGradient: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    moduleStatus: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 14,
        padding: 14,
    },
    moduleInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    moduleText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
        marginLeft: 10,
    },
    onlineStatus: {
        flexDirection: "row",
        alignItems: "center",
    },
    pulseOuter: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "rgba(76, 175, 80, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    pulseInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#4CAF50",
    },
    onlineText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 10,
    },
    section: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1B5E20",
        marginLeft: 10,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: "#666",
        marginLeft: 8,
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
        borderRadius: 18,
        padding: 16,
        alignItems: "center",
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 10,
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: "600",
    },
    circularProgress: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    percentageContainer: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
    },
    valueContainer: {
        alignItems: "center",
    },
    valueText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    unitText: {
        fontSize: 11,
        fontWeight: "500",
        marginTop: -2,
    },
    percentageText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    dataLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1A1A1A",
        textAlign: "center",
        marginTop: 4,
    },
    dataLabelSinhala: {
        fontSize: 11,
        color: "#888",
        textAlign: "center",
        marginTop: 2,
    },
    temperatureCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        shadowColor: "#E91E63",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    tempHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 15,
    },
    tempIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    tempStatusBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tempStatusText: {
        fontSize: 13,
        fontWeight: "700",
    },
    tempContent: {
        marginVertical: 10,
    },
    tempLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
        marginTop: 10,
    },
    tempRange: {
        marginTop: 8,
        backgroundColor: "rgba(233, 30, 99, 0.1)",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
    },
    tempRangeText: {
        fontSize: 12,
        color: "#E91E63",
        fontWeight: "500",
    },
    quickActions: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    quickActionsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1B5E20",
        marginBottom: 14,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    actionButton: {
        alignItems: "center",
        width: "22%",
    },
    actionGradient: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    actionText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#444",
        marginTop: 8,
    },
});