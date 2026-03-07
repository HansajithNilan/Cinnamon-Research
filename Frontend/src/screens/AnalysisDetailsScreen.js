import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    const statusColor = isHealthy ? "#2e7d32" : "#e53935"; 

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 }} // Added to ensure smooth scrolling to the very bottom
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.imageSection}>
                {processedImage ? (
                    <Image 
                        source={{ uri: processedImage }} 
                        style={styles.image} 
                        resizeMode="contain"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="image-outline" size={50} color="#666" />
                    </View>
                )}
            </View>

            <View style={styles.detailsCard}>
                <Text style={styles.title}>Diagnosis Report</Text>
                
                {/*   Plant Status */}
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Plant Status:</Text>
                    <Text style={[styles.value, { color: statusColor, fontWeight: 'bold' }]}>
                        {conditionStatus}
                    </Text>
                </View>
                
              
                {!isHealthy && (
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Detected Disease:</Text>
                        <Text style={[styles.value, { color: '#555' }]}>{diseaseName}</Text>
                    </View>
                )}
                
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Risk Level:</Text>
                    <Text style={[styles.value, { fontWeight: 'bold' }]}>{riskColor} {riskStatus}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Current Severity:</Text>
                    <Text style={styles.value}>{severity}%</Text>
                </View>
            </View>

            {diseaseName !== "Healthy Leaf" && (
                <View style={styles.forecastCard}>
                    <Text style={styles.cardTitle}>Spread Forecast</Text>
                    <View style={styles.forecastRow}>
                        <Text style={styles.forecastLabel}>Day 1 (Tomorrow):</Text>
                        <Text style={styles.forecastValue}>{forecast.day_1}%</Text>
                    </View>
                    <View style={styles.forecastRow}>
                        <Text style={styles.forecastLabel}>Day 3:</Text>
                        <Text style={styles.forecastValue}>{forecast.day_3}%</Text>
                    </View>
                    <View style={styles.forecastRow}>
                        <Text style={styles.forecastLabel}>Day 7 (Week):</Text>
                        <Text style={styles.forecastValue}>{forecast.day_7}%</Text>
                    </View>
                </View>
            )}

            <View style={styles.adviceCard}>
                <Text style={styles.cardTitle}>Advisory</Text>
                <Text style={styles.adviceText}>{advice}</Text>
            </View>

            <TouchableOpacity 
                style={styles.backButton} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Dashboard')} // Changed to Dashboard (or use 'Main') based on your App.js routing
            >
                <Ionicons name="home-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.backButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    imageSection: { width: '100%', height: 300, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: '100%' },
    placeholderImage: { justifyContent: 'center', alignItems: 'center' },
    detailsCard: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    label: { fontSize: 16, color: '#666', fontWeight: '500' },
    value: { fontSize: 16, color: '#333', fontWeight: 'bold', maxWidth: '60%', textAlign: 'right' },
    forecastCard: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, padding: 20, borderRadius: 15, elevation: 3 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    forecastRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    forecastLabel: { fontSize: 15, color: '#555' },
    forecastValue: { fontSize: 15, fontWeight: 'bold', color: '#e53935' },
    adviceCard: { backgroundColor: '#e8f5e9', marginHorizontal: 15, marginBottom: 20, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#c8e6c9' },
    adviceText: { fontSize: 15, color: '#2e7d32', lineHeight: 22 },
    backButton: { backgroundColor: '#2e7d32', flexDirection: 'row', marginHorizontal: 15, marginTop: 10, padding: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});