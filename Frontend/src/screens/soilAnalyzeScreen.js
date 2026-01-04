import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";

const { width } = Dimensions.get("window");

// Color schemes for nutrient status
const statusColors = {
    critical: { primary: "#D32F2F", secondary: "#FFCDD2", gradient: ["#D32F2F", "#EF5350"] },
    warning: { primary: "#F57C00", secondary: "#FFE0B2", gradient: ["#F57C00", "#FFB74D"] },
    optimal: { primary: "#388E3C", secondary: "#C8E6C9", gradient: ["#388E3C", "#66BB6A"] },
    good: { primary: "#1976D2", secondary: "#BBDEFB", gradient: ["#1976D2", "#64B5F6"] },
};

// Circular Gauge Component
const CircularGauge = ({ percentage, color, size = 70 }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#F0F0F0"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
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
            <View style={styles.gaugeCenter}>
                <Text style={[styles.gaugePercentage, { color }]}>{percentage}%</Text>
            </View>
        </View>
    );
};

// Enhanced Progress Card Component
const NutrientCard = ({
    label,
    labelSinhala,
    percentage,
    status,
    statusSinhala,
    statusType,
    icon,
    recommendation,
}) => {
    const colorScheme = statusColors[statusType] || statusColors.warning;

    return (
        <View style={[styles.nutrientCard, { borderLeftColor: colorScheme.primary }]}>
            <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: colorScheme.secondary }]}>
                        <MaterialCommunityIcons name={icon} size={24} color={colorScheme.primary} />
                    </View>
                    <View style={styles.labelContainer}>
                        <Text style={styles.nutrientLabel}>{label}</Text>
                        <Text style={styles.nutrientLabelSinhala}>{labelSinhala}</Text>
                    </View>
                </View>
                <CircularGauge percentage={percentage} color={colorScheme.primary} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
                <View style={styles.progressBarBackground}>
                    <LinearGradient
                        colors={colorScheme.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${percentage}%` }]}
                    />
                </View>
            </View>

            {/* Status and Recommendation */}
            <View style={styles.statusSection}>
                <View style={[styles.statusBadge, { backgroundColor: colorScheme.secondary }]}>
                    <View style={[styles.statusDot, { backgroundColor: colorScheme.primary }]} />
                    <Text style={[styles.statusText, { color: colorScheme.primary }]}>{status}</Text>
                </View>
                <Text style={styles.statusSinhala}>{statusSinhala}</Text>
            </View>

            {recommendation && (
                <View style={styles.recommendationSection}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#666" />
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
            )}
        </View>
    );
};

// Summary Card Component
const SummaryCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.summaryCard, { borderTopColor: color }]}>
        <View style={[styles.summaryIcon, { backgroundColor: color + "20" }]}>
            <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <Text style={[styles.summaryValue, { color }]}>{value}</Text>
        <Text style={styles.summaryTitle}>{title}</Text>
        {subtitle && <Text style={styles.summarySubtitle}>{subtitle}</Text>}
    </View>
);

export default function SoilAnalyzeScreen() {
    const navigation = useNavigation();

    // Sample data - replace with real data
    const nutrients = [
        {
            label: "Nitrogen (N)",
            labelSinhala: "නයිට්රජන්",
            percentage: 20,
            status: "High Deficit",
            statusSinhala: "අධික හිඟය",
            statusType: "critical",
            icon: "leaf",
            recommendation: "Apply nitrogen-rich fertilizer within 7 days",
        },
        {
            label: "Phosphorus (P)",
            labelSinhala: "පොස්පරස්",
            percentage: 50,
            status: "Moderate Deficit",
            statusSinhala: "මධ්‍යස්ථ හිඟය",
            statusType: "warning",
            icon: "atom",
            recommendation: "Consider adding bone meal or rock phosphate",
        },
        {
            label: "Potassium (K)",
            labelSinhala: "පොටෑසියම්",
            percentage: 80,
            status: "Optimal Level",
            statusSinhala: "ප්‍රශස්ත මට්ටම",
            statusType: "optimal",
            icon: "flask",
            recommendation: "Maintain current fertilization schedule",
        },
        {
            label: "pH Level",
            labelSinhala: "pH මට්ටම",
            percentage: 65,
            status: "Slightly Acidic",
            statusSinhala: "සුළු අම්ලීය",
            statusType: "good",
            icon: "test-tube",
            recommendation: "Add lime to increase pH if needed",
        },
        {
            label: "Electrical Conductivity",
            labelSinhala: "විද්‍යුත් සන්නායකතාව",
            percentage: 45,
            status: "Low",
            statusSinhala: "අඩු",
            statusType: "warning",
            icon: "flash",
            recommendation: "Monitor salt levels in irrigation water",
        },
    ];

    const overallHealth = Math.round(
        nutrients.reduce((sum, n) => sum + n.percentage, 0) / nutrients.length
    );

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
                            <Text style={styles.greetingText}>Soil Analysis</Text>
                            <Text style={styles.brandText}>Nutrient Deficit</Text>
                        </View>
                        <TouchableOpacity style={styles.menuButton}>
                            <LinearGradient
                                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                                style={styles.menuGradient}
                            >
                                <Ionicons name="options-outline" size={22} color="#FFFFFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Overall Health Indicator */}
                    <View style={styles.healthOverview}>
                        <View style={styles.healthCircle}>
                            <Text style={styles.healthValue}>{overallHealth}%</Text>
                            <Text style={styles.healthLabel}>Overall</Text>
                        </View>
                        <View style={styles.healthInfo}>
                            <Text style={styles.healthTitle}>Soil Health Score</Text>
                            <Text style={styles.healthSubtitle}>පස සෞඛ්‍ය ලකුණු</Text>
                            <View style={styles.healthStatus}>
                                <View style={[styles.healthDot, { backgroundColor: overallHealth >= 60 ? "#4CAF50" : "#FF9800" }]} />
                                <Text style={styles.healthStatusText}>
                                    {overallHealth >= 70 ? "Good Condition" : overallHealth >= 50 ? "Needs Attention" : "Critical"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Summary Cards */}
                <View style={styles.summarySection}>
                    <SummaryCard
                        title="Critical"
                        value="1"
                        icon="alert-circle"
                        color="#D32F2F"
                        subtitle="Needs action"
                    />
                    <SummaryCard
                        title="Warning"
                        value="2"
                        icon="alert"
                        color="#F57C00"
                        subtitle="Monitor"
                    />
                    <SummaryCard
                        title="Optimal"
                        value="2"
                        icon="check-circle"
                        color="#388E3C"
                        subtitle="Healthy"
                    />
                </View>

                {/* Nutrient Analysis Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="chart-bar" size={24} color="#1B5E20" />
                        <Text style={styles.sectionTitle}>Nutrient Analysis</Text>
                    </View>

                    {nutrients.map((nutrient, index) => (
                        <NutrientCard key={index} {...nutrient} />
                    ))}
                </View>

                {/* Info Card */}
                <LinearGradient
                    colors={["#E8F5E9", "#F1F8E9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.infoCard}
                >
                    <View style={styles.infoHeader}>
                        <MaterialCommunityIcons name="information" size={24} color="#1B5E20" />
                        <Text style={styles.infoTitle}>Understanding Your Results</Text>
                    </View>
                    <Text style={styles.infoText}>
                        These percentages indicate the current nutrient levels in your soil.
                        Aim for higher percentages to ensure optimal plant growth.
                    </Text>
                    <Text style={styles.infoTextSinhala}>
                        මෙම ප්‍රතිශත මඟින් ඔබේ පසෙහි පවතින පෝෂක මට්ටම් පෙන්නුම් කරයි.
                        ප්‍රශස්ත ශාක වර්ධනයක් සහතික කිරීම සඳහා ඉහළ ප්‍රතිශත ඉලක්ක කරන්න.
                    </Text>
                </LinearGradient>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <TouchableOpacity style={styles.primaryButton}>
                        <LinearGradient
                            colors={["#1B5E20", "#2E7D32"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryButtonGradient}
                        >
                            <MaterialCommunityIcons name="file-document-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.primaryButtonText}>Generate Full Report</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.secondaryButtons}>
                        <TouchableOpacity style={styles.secondaryButton}>
                            <MaterialCommunityIcons name="share-variant" size={20} color="#1B5E20" />
                            <Text style={styles.secondaryButtonText}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton}>
                            <MaterialCommunityIcons name="history" size={20} color="#1B5E20" />
                            <Text style={styles.secondaryButtonText}>History</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAF8",
    },
    headerGradient: {
        paddingTop: 50,
        paddingBottom: 25,
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
    menuButton: {
        marginLeft: 10,
    },
    menuGradient: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    healthOverview: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 16,
        padding: 16,
    },
    healthCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(255,255,255,0.25)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#FFFFFF",
    },
    healthValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    healthLabel: {
        fontSize: 10,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "500",
    },
    healthInfo: {
        flex: 1,
        marginLeft: 16,
    },
    healthTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    healthSubtitle: {
        fontSize: 12,
        color: "rgba(255,255,255,0.7)",
        marginTop: 2,
    },
    healthStatus: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    healthDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    healthStatusText: {
        fontSize: 13,
        color: "#FFFFFF",
        fontWeight: "500",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 20,
    },
    summarySection: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    summaryCard: {
        width: (width - 56) / 3,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
        borderTopWidth: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: "bold",
    },
    summaryTitle: {
        fontSize: 11,
        fontWeight: "600",
        color: "#444",
        marginTop: 2,
    },
    summarySubtitle: {
        fontSize: 9,
        color: "#888",
        marginTop: 2,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1B5E20",
        marginLeft: 10,
    },
    nutrientCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    cardContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    cardLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    labelContainer: {
        marginLeft: 12,
        flex: 1,
    },
    nutrientLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    nutrientLabelSinhala: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
    gaugeCenter: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    gaugePercentage: {
        fontSize: 14,
        fontWeight: "bold",
    },
    progressSection: {
        marginBottom: 12,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: "#F0F0F0",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 4,
    },
    statusSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    statusSinhala: {
        fontSize: 11,
        color: "#888",
        marginLeft: 10,
    },
    recommendationSection: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#F8F9FA",
        borderRadius: 10,
        padding: 10,
        marginTop: 4,
    },
    recommendationText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 8,
        flex: 1,
        lineHeight: 18,
    },
    infoCard: {
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
    },
    infoHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#1B5E20",
        marginLeft: 10,
    },
    infoText: {
        fontSize: 13,
        color: "#2D5016",
        lineHeight: 20,
        marginBottom: 10,
    },
    infoTextSinhala: {
        fontSize: 12,
        color: "#558B2F",
        lineHeight: 20,
    },
    actionSection: {
        paddingHorizontal: 20,
    },
    primaryButton: {
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 14,
        shadowColor: "#1B5E20",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    primaryButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginLeft: 10,
    },
    secondaryButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    secondaryButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 14,
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1B5E20",
        marginLeft: 8,
    },
});