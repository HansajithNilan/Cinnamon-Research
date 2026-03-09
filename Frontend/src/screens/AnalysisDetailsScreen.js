import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AnalysisDetailsScreen({ route, navigation }) {
    // Receive the data passed from AnalysisScreen/AnalyzeScreen
    const { imageUri, analysisData } = route.params || {};

    // Safely extract backend data with fallbacks
    const diseaseName = analysisData?.disease || "Unknown Condition";
    const severity = analysisData?.severity || 0;
    const riskStatus = analysisData?.risk_status || "Safe";
    const riskColor = analysisData?.risk_color || "🟢";
    const advice = analysisData?.advice || "No advice available at the moment.";
    const processedImage = analysisData?.processed_image_base64 || imageUri;
    const forecast = analysisData?.forecast || { day_1: 0, day_3: 0, day_7: 0 };

    const isHealthy = diseaseName === "Healthy Leaf";
    const conditionStatus = isHealthy ? "Healthy" : "Infected";
    const statusColor = isHealthy ? "#10B981" : "#EF4444";

    const getRiskStatus = (value) => {
        if (isHealthy) return { label: "SAFE", color: "#10B981", bg: "#D1FAE5", text: "#065F46" };
        const val = parseFloat(value);
        if (val < 35) {
            return { label: "LOW RISK", color: "#10B981", bg: "#D1FAE5", text: "#065F46" };
        } else if (val >= 35 && val < 70) {
            return { label: "HIGH RISK", color: "#F59E0B", bg: "#FEF3C7", text: "#92400E" };
        } else {
            return { label: "CRITICAL", color: "#EF4444", bg: "#FEE2E2", text: "#991B1B" };
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
            >
                {/* Image Header Background */}
                <View style={styles.imageContainer}>
                    {processedImage ? (
                        <Image source={{ uri: processedImage }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={[styles.image, styles.placeholderImage]}>
                            <Ionicons name="leaf-outline" size={60} color="#9ca3af" />
                        </View>
                    )}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', '#F9FAFB']}
                        locations={[0, 0.4, 1]}
                        style={styles.gradient}
                    />

                    {/* Top Header Navigation inside image view */}
                    <View style={styles.headerTopBar}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={22} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Analysis Report</Text>
                        <View style={styles.placeholderIcon} />
                    </View>
                </View>

                {/* Main Content (Overlapping the image) */}
                <View style={styles.contentContainer}>

                    {/* Status Badge */}
                    <View style={styles.badgeContainer}>
                        <View style={[styles.badge, { backgroundColor: isHealthy ? '#D1FAE5' : '#FEE2E2' }]}>
                            <Ionicons name={isHealthy ? "checkmark-circle" : "alert-circle"} size={20} color={statusColor} />
                            <Text style={[styles.badgeText, { color: statusColor }]}>{conditionStatus}</Text>
                        </View>
                    </View>

                    {/* Main Info Card */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Diagnosis details</Text>

                        {!isHealthy && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Detected Disease</Text>
                                <Text style={styles.valueHighlight}>{diseaseName}</Text>
                            </View>
                        )}

                        <View style={styles.row}>
                            <Text style={styles.label}>Risk Level</Text>
                            <View style={[styles.riskBadgeSmall, { backgroundColor: getRiskStatus(severity).bg }]}>
                                <Text style={[styles.riskBadgeTextSmall, { color: getRiskStatus(severity).text }]}>
                                    {getRiskStatus(severity).label}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.severityContainer}>
                            <View style={[styles.row, { borderBottomWidth: 0 }]}>
                                <Text style={styles.label}>Severity</Text>
                                <Text style={[styles.valueSecondary, { color: isHealthy ? '#10B981' : '#EF4444' }]}>
                                    {severity}%
                                </Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { width: `${severity}%`, backgroundColor: isHealthy ? '#10B981' : '#EF4444' }
                                    ]}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Forecast Card */}
                    {!isHealthy && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Spread Forecast</Text>
                            <View style={styles.forecastGrid}>
                                <View style={styles.forecastItem}>
                                    <Text style={styles.forecastLabel}> In 7 Days</Text>
                                    <Text style={[styles.forecastValue, { color: getRiskStatus(forecast.day_1).color }]}>{forecast.day_1}%</Text>
                                    <View style={[styles.smallBadge, { backgroundColor: getRiskStatus(forecast.day_1).bg }]}>
                                        <Text style={[styles.smallBadgeText, { color: getRiskStatus(forecast.day_1).text }]}>
                                            {getRiskStatus(forecast.day_1).label}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.forecastItem}>
                                    <Text style={styles.forecastLabel}>In Two Weeks</Text>
                                    <Text style={[styles.forecastValue, { color: getRiskStatus(forecast.day_3).color }]}>{forecast.day_3}%</Text>
                                    <View style={[styles.smallBadge, { backgroundColor: getRiskStatus(forecast.day_3).bg }]}>
                                        <Text style={[styles.smallBadgeText, { color: getRiskStatus(forecast.day_3).text }]}>
                                            {getRiskStatus(forecast.day_3).label}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.forecastItem}>
                                    <Text style={styles.forecastLabel}>After One Month</Text>
                                    <Text style={[styles.forecastValue, { color: getRiskStatus(forecast.day_7).color }]}>{forecast.day_7}%</Text>
                                    <View style={[styles.smallBadge, { backgroundColor: getRiskStatus(forecast.day_7).bg }]}>
                                        <Text style={[styles.smallBadgeText, { color: getRiskStatus(forecast.day_7).text }]}>
                                            {getRiskStatus(forecast.day_7).label}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Advisory Card */}
                    <View style={[styles.card, styles.advisoryCard]}>
                        <View style={styles.advisoryHeader}>
                            <Ionicons name="medical" size={20} color="#059669" />
                            <Text style={styles.advisoryTitle}>Advisory & Treatment</Text>
                        </View>
                        <Text style={styles.adviceText}>{advice}</Text>
                    </View>

                    {/* View Guide Button */}
                    <TouchableOpacity
                        style={styles.primaryButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Guide', { riskLevel: getRiskStatus(severity).label })}
                    >
                        <Ionicons name="book-outline" size={22} color="#fff" />
                        <Text style={styles.primaryButtonText}>View Management Guide</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        height: 380,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    headerTopBar: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    placeholderIcon: {
        width: 42,
        height: 42,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    contentContainer: {
        paddingHorizontal: 20,
        marginTop: -80,
    },
    badgeContainer: {
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    badgeText: {
        fontWeight: '700',
        fontSize: 15,
        marginLeft: 6,
        letterSpacing: 0.3,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        elevation: 10,
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 15,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    label: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    valueHighlight: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '700',
    },
    valueSecondary: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '600',
    },
    severityContainer: {
        marginTop: 5,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        marginTop: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    forecastGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    forecastItem: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    forecastLabel: {
        fontSize: 11,
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    forecastValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#EF4444',
        marginBottom: 4,
    },
    forecastDay: {
        fontSize: 11,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '500',
    },
    riskBadgeSmall: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    riskBadgeTextSmall: {
        fontSize: 12,
        fontWeight: '700',
    },
    smallBadge: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        marginTop: 4,
    },
    smallBadgeText: {
        fontSize: 8,
        fontWeight: '800',
    },
    advisoryCard: {
        backgroundColor: '#ECFDF5',
        borderColor: '#D1FAE5',
        borderWidth: 1,
    },
    advisoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    advisoryTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#065F46',
        marginLeft: 8,
    },
    adviceText: {
        fontSize: 15,
        color: '#065F46',
        lineHeight: 24,
    },
    primaryButton: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        marginTop: 10,
        marginBottom: 20,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        marginLeft: 10,
        letterSpacing: 0.5,
    }
});