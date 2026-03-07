import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    ActivityIndicator,
    Platform,
    TouchableOpacity,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { colors } from "../styles/colors";
import { subscribeToLatestReading, formatTimestamp, formatTimeAgo } from "../services/firebaseService";

// Import screens
import AnalysisScreen from "./AnalysisScreen";
import TipsScreen from "./TipsScreen";
import HistoryScreen from "./HistoryScreen";
import SettingsScreen from "./SettingsScreen";
import SoilAnalyzeScreen from "./soilAnalyzeScreen";

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get("window");

// Responsive tab bar height based on screen size
const getTabBarHeight = () => {
    if (height < 700) return 60; // Small screens
    if (height < 800) return 65; // Medium screens
    return 70; // Large screens
};

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
        <View style={styles.temperatureCard}>
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
        </View>
    );
};

function SoilMonitorScreen({ navigation }) {
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isOnline, setIsOnline] = useState(false);

    // Real-time sensor data from Firebase
    const [sensorData, setSensorData] = useState({
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        moisture: 0,
        ph: 0,
        ec: 0,
        temperature: 0,
    });

    // Subscribe to Firebase real-time updates
    useEffect(() => {
        console.log('Subscribing to Firebase real-time data...');

        const unsubscribe = subscribeToLatestReading((result) => {
            if (result.success) {
                console.log('Received sensor data from Firebase:', result.data);

                // Convert sensor readings to percentage (0-100 scale for display)
                const nitrogenPercent = Math.min((result.data.nitrogen / 100) * 100, 100);
                const phosphorusPercent = Math.min((result.data.phosphorus / 60) * 100, 100);
                const potassiumPercent = Math.min((result.data.potassium / 120) * 100, 100);
                const moisturePercent = Math.min(result.data.moisture, 100);

                setSensorData({
                    nitrogen: Math.round(nitrogenPercent),
                    phosphorus: Math.round(phosphorusPercent),
                    potassium: Math.round(potassiumPercent),
                    moisture: Math.round(moisturePercent),
                    ph: result.data.ph || 0,
                    ec: result.data.ec || 0,
                    temperature: result.data.temperature || 0,
                });

                // Always use timestamp from Firebase data
                const dataTimestamp = result.data.timestamp;
                setLastUpdate(dataTimestamp);

                // Check if data is fresh (within 1 minute)
                const now = Date.now();
                const timeDifference = now - dataTimestamp;
                const isDataFresh = timeDifference < 60000; // 1 minute

                setIsOnline(isDataFresh);
                setIsLoading(false);
            } else {
                console.error('Failed to fetch sensor data:', result.error);
                setIsOnline(false);
                setIsLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => {
            console.log('Unsubscribing from Firebase...');
            unsubscribe();
        };
    }, []);

    // Check if data is stale (older than 1 minute) and update online status
    useEffect(() => {
        const checkDataFreshness = () => {
            if (lastUpdate) {
                const now = Date.now();
                const oneMinute = 60 * 1000; // 1 minute in milliseconds
                const timeSinceUpdate = now - lastUpdate;

                if (timeSinceUpdate > oneMinute) {
                    // Data is stale - mark as offline
                    if (isOnline) {
                        console.log('Data is stale (>1 min). Marking device as offline.');
                        setIsOnline(false);
                    }
                } else {
                    // Data is fresh - ensure marked as online
                    if (!isOnline) {
                        setIsOnline(true);
                    }
                }
            }
        };

        // Check immediately
        checkDataFreshness();

        // Then check every 5 seconds
        const interval = setInterval(checkDataFreshness, 5000);

        return () => clearInterval(interval);
    }, [lastUpdate, isOnline]);

    // Show loading screen
    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#1B5E20" />
                <Text style={{ marginTop: 10, color: "#666" }}>Loading sensor data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <LinearGradient
                colors={["#1B5E20", "#2E7D32", "#43A047"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                {/* Decorative circles */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
                <View style={styles.decorativeCircle3} />

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
                        <View style={styles.rightButton}>
                            <LinearGradient
                                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                                style={styles.rightButtonGradient}
                            >
                                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Module Status Card */}
                    <View style={styles.statusCard}>
                    <View style={styles.statusCardTop}>
                        <View style={styles.moduleInfo}>
                            <View style={styles.chipIconContainer}>
                                <MaterialCommunityIcons name="chip" size={18} color="#1B5E20" />
                            </View>
                            <View>
                                <Text style={styles.moduleText}>ESP32-A1</Text>
                                <Text style={styles.moduleSubtext}>Soil Sensor Module</Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadge, {
                            backgroundColor: isOnline ? "#E8F5E9" : "#FFEBEE"
                        }]}>
                            <View style={[styles.statusDot, {
                                backgroundColor: isOnline ? "#4CAF50" : "#F44336"
                            }]} />
                            <Text style={[styles.statusText, {
                                color: isOnline ? "#2E7D32" : "#C62828"
                            }]}>
                                {isOnline ? "Online" : "Offline"}
                            </Text>
                        </View>
                    </View>

                    {lastUpdate && (
                        <View style={styles.syncInfo}>
                            <View style={[styles.syncIconContainer, {
                                backgroundColor: isOnline ? "#E8F5E9" : "#FFF3E0"
                            }]}>
                                <MaterialCommunityIcons
                                    name={isOnline ? "sync" : "sync-alert"}
                                    size={14}
                                    color={isOnline ? "#43A047" : "#F57C00"}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.syncText, {
                                    color: isOnline ? "#616161" : "#757575"
                                }]}>
                                    Last sync: {formatTimestamp(lastUpdate)}
                                </Text>
                                <Text style={styles.syncTimeAgo}>
                                    {formatTimeAgo(lastUpdate)}
                                </Text>
                            </View>
                            <View style={[styles.syncBadge, {
                                backgroundColor: isOnline ? "#E8F5E9" : "#FFF3E0"
                            }]}>
                                <MaterialCommunityIcons
                                    name={isOnline ? "check-circle" : "alert-circle"}
                                    size={12}
                                    color={isOnline ? "#4CAF50" : "#F57C00"}
                                />
                            </View>
                        </View>
                    )}
                </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: getTabBarHeight() + 20 }
                ]}
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
            </ScrollView>
        </View>
    );
}

export default function SoilDashboardNavigator() {
    const tabBarHeight = getTabBarHeight();
    const isSmallScreen = height < 700;

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
                    } else if (route.name === "History") {
                        iconName = focused ? "time" : "time-outline";
                    }

                    // Responsive icon size
                    const iconSize = isSmallScreen ? 22 : 24;
                    return <Ionicons name={iconName} size={iconSize} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    height: tabBarHeight,
                    paddingBottom: Platform.OS === 'ios' ? (isSmallScreen ? 8 : 10) : 8,
                    paddingTop: isSmallScreen ? 6 : 8,
                    paddingHorizontal: width > 400 ? 10 : 5,
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
                    fontSize: isSmallScreen ? 9 : 10,
                    fontWeight: "600",
                    marginTop: isSmallScreen ? 1 : 2,
                    marginBottom: Platform.OS === 'android' ? 2 : 0,
                },
                tabBarItemStyle: {
                    paddingVertical: isSmallScreen ? 4 : 6,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={SoilMonitorScreen}
                options={{ tabBarLabel: 'Dashboard' }}
            />
            <Tab.Screen
                name="Analysis"
                component={SoilAnalyzeScreen}
                options={{ tabBarLabel: 'Analysis' }}
            />
            <Tab.Screen
                name="Tips"
                component={TipsScreen}
                options={{ tabBarLabel: 'Tips' }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ tabBarLabel: 'History' }}
            />
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
        position: "relative",
        overflow: "hidden",
    },
    decorativeCircle1: {
        position: "absolute",
        top: -60,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    decorativeCircle2: {
        position: "absolute",
        bottom: -40,
        left: -40,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.06)",
    },
    decorativeCircle3: {
        position: "absolute",
        top: 40,
        left: width * 0.4,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.04)",
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
        marginRight: 12,
    },
    headerTitleContainer: {
        flex: 1,
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
    rightButton: {
        marginLeft: 10,
    },
    rightButtonGradient: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    statusCard: {
        marginTop: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statusCardTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    moduleInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    chipIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#E8F5E9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    moduleText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1B5E20",
        letterSpacing: 0.3,
    },
    moduleSubtext: {
        fontSize: 12,
        color: "#757575",
        marginTop: 2,
        fontWeight: "500",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    syncInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
    },
    syncIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#E8F5E9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    syncText: {
        fontSize: 13,
        color: "#616161",
        fontWeight: "600",
    },
    syncTimeAgo: {
        fontSize: 11,
        color: "#9E9E9E",
        fontWeight: "500",
        marginTop: 2,
    },
    syncSubtext: {
        fontSize: 11,
        color: "#F57C00",
        fontWeight: "500",
        marginTop: 3,
    },
    syncBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#E8F5E9",
        justifyContent: "center",
        alignItems: "center",
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
        backgroundColor: metricColors.temperature.bg,
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
});