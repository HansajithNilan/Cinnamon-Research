import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

const AnalysisScreen = ({ navigation, route }) => {
  const { imageUri, analysisData } = route.params || {};

  // --- getRiskStatus Function ---
  const getRiskStatus = (valueStr) => {
    if (valueStr === "Calculating..." || !valueStr) return { label: "", color: "#D1D5DB", bg: "#F3F4F6", text: "#6B7280" };

    const value = parseFloat(valueStr.replace('%', ''));

    if (value < 35) {
      return { label: "LOW RISK", color: "#10B981", bg: "#D1FAE5", text: "#065F46" };
    } else if (value >= 35 && value < 70) {
      return { label: "HIGH RISK", color: "#F59E0B", bg: "#FEF3C7", text: "#92400E" };
    } else {
      return { label: "CRITICAL", color: "#EF4444", bg: "#FEE2E2", text: "#991B1B" };
    }
  };

  const [progress, setProgress] = useState(0);
  const [animatedProgress] = useState(new Animated.Value(0));
  const [analysisStage, setAnalysisStage] = useState("Scanning leaf structure...");

  const [parameters, setParameters] = useState({
    currentInfection: "Calculating...",
    prediction1Day: "Calculating...",
    prediction3Days: "Calculating...",
    prediction7Days: "Calculating...",
  });

  // Validation for non-fungus/garbage images
  useEffect(() => {
    if (analysisData && analysisData.status === "error") {
      Alert.alert(
        "Invalid Image",
        "The uploaded image does not appear to be a leaf or no fungal patterns were detected. Please try again with a clearer photo.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, [analysisData]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 4;
      });
    }, 120);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 120,
      useNativeDriver: false,
    }).start();

    if (progress >= 15 && progress < 40) {
      setAnalysisStage("Detecting fungal patterns...");
    } else if (progress >= 40 && progress < 65) {
      setAnalysisStage("Calculating spread rate...");
    } else if (progress >= 65 && progress < 90) {
      setAnalysisStage("Predicting infection growth...");
    } else if (progress >= 90) {
      setAnalysisStage("Finalizing predictions...");
    }

    if (analysisData) {
      setParameters((prev) => ({
        ...prev,
        currentInfection: progress >= 25 ? (analysisData.severity !== undefined ? `${analysisData.severity}%` : "0%") : prev.currentInfection,
        prediction1Day: progress >= 50 ? (analysisData.forecast?.day_1 !== undefined ? `${analysisData.forecast.day_1}%` : "0%") : prev.prediction1Day,
        prediction3Days: progress >= 70 ? (analysisData.forecast?.day_3 !== undefined ? `${analysisData.forecast.day_3}%` : "0%") : prev.prediction3Days,
        prediction7Days: progress >= 90 ? (analysisData.forecast?.day_7 !== undefined ? `${analysisData.forecast.day_7}%` : "0%") : prev.prediction7Days,
      }));
    }

  }, [progress, analysisData, animatedProgress]);

  const handleViewResults = () => {
    navigation.navigate("Details", {
      imageUri: imageUri,
      analysisData: analysisData,
    });
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyzing Seedling</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        <View style={styles.progressSection}>
          <View style={styles.circleContainer}>
            <Svg width="240" height="240" style={styles.svg}>
              <Circle cx="120" cy="120" r="90" stroke="#E8F5E9" strokeWidth="18" fill="none" />
              <Circle
                cx="120" cy="120" r="90" stroke="#1B9568" strokeWidth="18" fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 120 120)"
              />
            </Svg>
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageText}>{progress}%</Text>
              <Text style={styles.percentageLabel}>Complete</Text>
            </View>
          </View>
          <View style={styles.stageContainer}>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dotAnimated1]} />
              <View style={[styles.dot, styles.dotAnimated2]} />
              <View style={[styles.dot, styles.dotAnimated3]} />
            </View>
            <Text style={styles.analyzingText}>{analysisStage}</Text>
          </View>
        </View>

        <View style={styles.predictionsSection}>
          <Text style={styles.sectionTitle}>Infection Spread Predictions</Text>

          {/* Current Infection */}
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View style={styles.iconBadge}><Ionicons name="pulse" size={20} color="#1B9568" /></View>
              <Text style={styles.predictionLabel}>Current Infection Rate</Text>
            </View>
            <View style={styles.predictionValueContainer}>
              <Text style={[styles.predictionValue, parameters.currentInfection !== "Calculating..." && { color: getRiskStatus(parameters.currentInfection).color }]}>
                {parameters.currentInfection}
              </Text>
              {parameters.currentInfection !== "Calculating..." && (
                <View style={[styles.riskBadge, { backgroundColor: getRiskStatus(parameters.currentInfection).bg }]}>
                  <Text style={[styles.riskBadgeText, { color: getRiskStatus(parameters.currentInfection).text }]}>
                    {getRiskStatus(parameters.currentInfection).label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* 1 Day Prediction */}
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View style={styles.iconBadge}><Ionicons name="time-outline" size={20} color="#10B981" /></View>
              <Text style={styles.predictionLabel}>In 7 Days</Text>
            </View>
            <View style={styles.predictionValueContainer}>
              <Text style={[styles.predictionValue, parameters.prediction1Day !== "Calculating..." && { color: getRiskStatus(parameters.prediction1Day).color }]}>
                {parameters.prediction1Day}
              </Text>
              {parameters.prediction1Day !== "Calculating..." && (
                <View style={[styles.riskBadge, { backgroundColor: getRiskStatus(parameters.prediction1Day).bg }]}>
                  <Text style={[styles.riskBadgeText, { color: getRiskStatus(parameters.prediction1Day).text }]}>
                    {getRiskStatus(parameters.prediction1Day).label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* 3 Days Prediction */}
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View style={[styles.iconBadge, { backgroundColor: getRiskStatus(parameters.prediction3Days).bg }]}>
                <Ionicons name="alert-circle-outline" size={20} color={getRiskStatus(parameters.prediction3Days).color} />
              </View>
              <Text style={styles.predictionLabel}>In Two Weeks</Text>
            </View>
            <View style={styles.predictionValueContainer}>
              <Text style={[styles.predictionValue, parameters.prediction3Days !== "Calculating..." && { color: getRiskStatus(parameters.prediction3Days).color }]}>
                {parameters.prediction3Days}
              </Text>
              {parameters.prediction3Days !== "Calculating..." && (
                <View style={[styles.riskBadge, { backgroundColor: getRiskStatus(parameters.prediction3Days).bg }]}>
                  <Text style={[styles.riskBadgeText, { color: getRiskStatus(parameters.prediction3Days).text }]}>
                    {getRiskStatus(parameters.prediction3Days).label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* 7 Days Prediction */}
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View style={[styles.iconBadge, { backgroundColor: getRiskStatus(parameters.prediction7Days).bg }]}>
                <Ionicons name="warning-outline" size={20} color={getRiskStatus(parameters.prediction7Days).color} />
              </View>
              <Text style={styles.predictionLabel}>After One Month</Text>
            </View>
            <View style={styles.predictionValueContainer}>
              <Text style={[styles.predictionValue, parameters.prediction7Days !== "Calculating..." && { color: getRiskStatus(parameters.prediction7Days).color }]}>
                {parameters.prediction7Days}
              </Text>
              {parameters.prediction7Days !== "Calculating..." && (
                <View style={[styles.riskBadge, { backgroundColor: getRiskStatus(parameters.prediction7Days).bg }]}>
                  <Text style={[styles.riskBadgeText, { color: getRiskStatus(parameters.prediction7Days).text }]}>
                    {getRiskStatus(parameters.prediction7Days).label}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.resultsButton, progress < 100 && styles.resultsButtonDisabled]}
          onPress={handleViewResults}
          disabled={progress < 100}
          activeOpacity={0.8}
        >
          <Text style={styles.resultsButtonText}>View Detailed Results</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 10 },
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, paddingTop: 50, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F3F4F6", elevation: 3 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  placeholder: { width: 32 },
  progressSection: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  circleContainer: { position: "relative", width: 240, height: 240, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  svg: { position: "absolute" },
  percentageContainer: { alignItems: "center", justifyContent: "center" },
  percentageText: { fontSize: 52, fontWeight: "700", color: "#10B981" },
  percentageLabel: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  stageContainer: { alignItems: "center" },
  loadingDots: { flexDirection: "row", gap: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },
  analyzingText: { fontSize: 15, fontWeight: "500", color: "#10B981" },
  predictionsSection: { backgroundColor: "#FFFFFF", marginHorizontal: 20, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#F3F4F6", elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 18 },
  predictionCard: { paddingVertical: 14 },
  predictionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  iconBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginRight: 12 },
  predictionLabel: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  predictionValueContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 6 },
  predictionValue: { fontSize: 32, fontWeight: "700", color: "#D1D5DB" },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  riskBadgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 4 },
  bottomSection: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: "#F3F4F6", elevation: 5 },
  resultsButton: { backgroundColor: "#10B981", paddingVertical: 16, borderRadius: 30, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  resultsButtonDisabled: { backgroundColor: "#D1D5DB" },
  resultsButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});

export default AnalysisScreen;