import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

// Progress Bar Component
const ProgressBar = ({
    label,
    labelSinhala,
    percentage,
    status,
    statusSinhala,
    color,
}) => {
    return (
        <View style={styles.progressBarContainer}>
            <View style={styles.progressHeader}>
                <Text style={styles.nutrientLabel}>{label}</Text>
                <Text style={[styles.percentageText, { color: color }]}>
                    {percentage}%
                </Text>
            </View>

            <View style={styles.progressBarBackground}>
                <View
                    style={[
                        styles.progressBarFill,
                        { width: `${percentage}%`, backgroundColor: color },
                    ]}
                />
            </View>

            <Text style={styles.statusText}>
                {status} / {statusSinhala}
            </Text>
        </View>
    );
};

export default function SoilAnalyzeScreen() {
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
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                                <Ionicons name="arrow-back" size={24} color={colors.white} />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.greetingText}>Soil Analysis</Text>
                                <Text style={styles.brandText}>Nutrient Deficit</Text>
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
                {/* Current Deficits Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Deficits</Text>

                    {/* Nitrogen Progress */}
                    <ProgressBar
                        label="Nitrogen (N)"
                        labelSinhala="නයිට්රජන්"
                        percentage={20}
                        status="High Deficit"
                        statusSinhala="අධික හිඟය"
                        color="#D32F2F"
                    />

                    {/* Phosphorus Progress */}
                    <ProgressBar
                        label="Phosphorus (P)"
                        labelSinhala="පොස්පරස්"
                        percentage={50}
                        status="Moderate Deficit"
                        statusSinhala="මධ්‍යස්ථ හිඟය"
                        color="#F57C00"
                    />

                    {/* Potassium Progress */}
                    <ProgressBar
                        label="Potassium (K)"
                        labelSinhala="පොටෑසියම්"
                        percentage={80}
                        status="Optimal Level"
                        statusSinhala="ප්‍රශස්ත මට්ටම"
                        color="#388E3C"
                    />
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                        These percentages indicate the current nutrient levels in your soil.
                        Aim for higher percentages to ensure optimal plant growth. /{" "}
                        <Text style={styles.infoTextSinhala}>
                            මෙම ප්‍රතිශත මඟින් ඔබේ පසෙහි පවතින පෝෂක මට්ටම් පෙන්නුම් කරයි.
                            ප්‍රශස්ත ශාක වර්ධනයක් සහතික කිරීම සඳහා ඉහළ ප්‍රතිශත ඉලක්ක කරන්න.
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
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
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 24,
    },
    progressBarContainer: {
        marginBottom: 32,
    },
    progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    nutrientLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    percentageText: {
        fontSize: 20,
        fontWeight: "bold",
    },
    progressBarBackground: {
        height: 12,
        backgroundColor: "#E0E0E0",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 8,
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 6,
    },
    statusText: {
        fontSize: 14,
        color: "#666",
    },
    infoCard: {
        backgroundColor: "#E8F5E9",
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    infoText: {
        fontSize: 14,
        color: "#2D5016",
        lineHeight: 22,
    },
    infoTextSinhala: {
        fontSize: 14,
        color: "#2D5016",
    },
});