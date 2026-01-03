import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

const AnalysisScreen = ({ navigation, route }) => {
  const [progress, setProgress] = useState(0);
  const [animatedProgress] = useState(new Animated.Value(0));
  const [analysisStage, setAnalysisStage] = useState(
    "Scanning leaf structure..."
  );
  const [parameters, setParameters] = useState({
    currentInfection: "Calculating...",
    prediction1Day: "Calculating...",
    prediction3Days: "Calculating...",
    prediction7Days: "Calculating...",
  });

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

    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 120,
      useNativeDriver: false,
    }).start();

    // Update analysis stages
    if (progress >= 15 && progress < 40) {
      setAnalysisStage("Detecting fungal patterns...");
    } else if (progress >= 40 && progress < 65) {
      setAnalysisStage("Calculating spread rate...");
    } else if (progress >= 65 && progress < 90) {
      setAnalysisStage("Predicting infection growth...");
    } else if (progress >= 90) {
      setAnalysisStage("Finalizing predictions...");
    }

    if (progress >= 25 && parameters.currentInfection === "Calculating...") {
      setTimeout(() => {
        setParameters((prev) => ({
          ...prev,
          currentInfection: "12%",
        }));
      }, 400);
    }

    if (progress >= 50 && parameters.prediction1Day === "Calculating...") {
      setTimeout(() => {
        setParameters((prev) => ({
          ...prev,
          prediction1Day: "15%",
        }));
      }, 400);
    }

    if (progress >= 70 && parameters.prediction3Days === "Calculating...") {
      setTimeout(() => {
        setParameters((prev) => ({
          ...prev,
          prediction3Days: "28%",
        }));
      }, 400);
    }

    if (progress >= 90 && parameters.prediction7Days === "Calculating...") {
      setTimeout(() => {
        setParameters((prev) => ({
          ...prev,
          prediction7Days: "45%",
        }));
      }, 400);
    }

    return () => clearInterval(progressInterval);
  }, [progress]);

  const handleViewResults = () => {
    navigation.navigate("Details", {
      imageUri: route.params?.imageUri,
      predictions: parameters,
      progress: progress,
    });
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
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
        {/* Progress Circle */}
        <View style={styles.progressSection}>
          <View style={styles.circleContainer}>
            <Svg width="240" height="240" style={styles.svg}>
              {/* Background Circle */}
              <Circle
                cx="120"
                cy="120"
                r="90"
                stroke="#E8F5E9"
                strokeWidth="18"
                fill="none"
              />
              {/* Progress Circle */}
              <Circle
                cx="120"
                cy="120"
                r="90"
                stroke="#1B9568"
                strokeWidth="18"
                fill="none"
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

        {/* Prediction Parameters */}
        <View style={styles.predictionsSection}>
          <Text style={styles.sectionTitle}>Infection Spread Predictions</Text>

          {/* Current Infection */}
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View style={styles.iconBadge}>
                <Ionicons name="pulse" size={20} color="#1B9568" />
              </View>
              <Text style={styles.predictionLabel}>Current Infection Rate</Text>
            </View>
            <Text
              style={[
                styles.predictionValue,
                parameters.currentInfection !== "Calculating..." &&
                styles.predictionValueCalculated,
              ]}
            >
              {parameters.currentInfection}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* 1 Day Prediction */}
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View style={styles.iconBadge}>
                <Ionicons name="time-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.predictionLabel}>1 Day Prediction</Text>
            </View>
            <Text
              style={[
                styles.predictionValue,
                parameters.prediction1Day !== "Calculating..." &&
                styles.predictionValueCalculated,
              ]}
            >
              {parameters.prediction1Day}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* 3 Days Prediction */}
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View style={[styles.iconBadge, styles.iconBadgeWarning]}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#F59E0B"
                />
              </View>
              <Text style={styles.predictionLabel}>3 Days Prediction</Text>
            </View>
            <View style={styles.predictionValueContainer}>
              <Text
                style={[
                  styles.predictionValue,
                  parameters.prediction3Days !== "Calculating..." &&
                  styles.predictionValueWarning,
                ]}
              >
                {parameters.prediction3Days}
              </Text>
              {parameters.prediction3Days !== "Calculating..." && (
                <View style={styles.riskBadge}>
                  <Text style={styles.riskBadgeText}>High Risk</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* 7 Days Prediction */}
          <View style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View style={[styles.iconBadge, styles.iconBadgeDanger]}>
                <Ionicons name="warning-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.predictionLabel}>7 Days Prediction</Text>
            </View>
            <View style={styles.predictionValueContainer}>
              <Text
                style={[
                  styles.predictionValue,
                  parameters.prediction7Days !== "Calculating..." &&
                  styles.predictionValueDanger,
                ]}
              >
                {parameters.prediction7Days}
              </Text>
              {parameters.prediction7Days !== "Calculating..." && (
                <View style={[styles.riskBadge, styles.riskBadgeDanger]}>
                  <Text style={styles.riskBadgeText}>Critical</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      {/* View Results Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.resultsButton,
            progress < 100 && styles.resultsButtonDisabled,
          ]}
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
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 32,
  },
  progressSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingTop: 30,
  },
  circleContainer: {
    position: "relative",
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  svg: {
    position: "absolute",
  },
  percentageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    fontSize: 52,
    fontWeight: "700",
    color: "#10B981",
  },
  percentageLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  stageContainer: {
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  analyzingText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#10B981",
  },
  predictionsSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 18,
  },
  predictionCard: {
    paddingVertical: 14,
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBadgeWarning: {
    backgroundColor: "#FEF3C7",
  },
  iconBadgeDanger: {
    backgroundColor: "#FEE2E2",
  },
  predictionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  predictionValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 6,
  },
  predictionValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#D1D5DB",
  },
  predictionValueCalculated: {
    color: "#10B981",
  },
  predictionValueWarning: {
    color: "#F59E0B",
  },
  predictionValueDanger: {
    color: "#EF4444",
  },
  riskBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskBadgeDanger: {
    backgroundColor: "#FEE2E2",
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#92400E",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  resultsButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resultsButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowColor: "#000",
    shadowOpacity: 0.1,
  },
  resultsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AnalysisScreen;
