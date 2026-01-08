import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, {
  Polyline,
  Defs,
  LinearGradient,
  Stop,
  Path,
  Circle,
} from "react-native-svg";

import { colors } from "../styles/colors";
const { width } = Dimensions.get("window");

const AnalysisDetailsScreen = ({ navigation, route }) => {
  const { imageUri } = route.params || {};

  const chartData = [13.61,  18.00,  31.47];
  const days = ["Day 1",  "Day 3",  "Day 7"];

  // Calculate chart points
  const chartWidth = width - 80;
  const chartHeight = 160;
  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData);
  const range = maxValue - minValue;

  const points = chartData
    .map((value, index) => {
      const x = (index / (chartData.length - 1)) * chartWidth;
      const y = chartHeight - ((value - minValue) / range) * (chartHeight - 20);
      return `${x},${y}`;
    })
    .join(" ");

  const handleViewActions = () => {
    navigation.navigate("Guide");
  };

  const handleRescan = () => {
    navigation.navigate("Image");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
                <Text style={styles.greetingText}>Detailed Report</Text>
                <Text style={styles.brandText}>Prediction Analysis</Text>
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
        contentContainerStyle={styles.scrollContent}
      >
        {/* Leaf Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : require("../assets/sample-leaf.png")
            }
            style={styles.leafImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.statusBadge}>
              <Ionicons name="alert-circle" size={16} color="#FFF" />
              <Text style={styles.statusBadgeText}>Infected</Text>
            </View>
          </View>
        </View>

        {/* Disease Identification */}
        <View style={styles.diseaseSection}>
          <Text style={styles.diseaseTitle}>Colletotrichum gloeosporioides</Text>
          <Text style={styles.diseaseSubtitle}>
            (Cinnamon Leaf Blight)
          </Text>
        </View>

        {/* Critical Alert Card */}
        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Ionicons name="checkmark-circle" size={28} color="#10B981" />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Risk Level:  Low Risk</Text>
            <Text style={styles.warningAlert}>WARNING: Risk will become Critical within 7 days!</Text>
          </View>
        </View>

        {/* Current Status Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="pulse" size={24} color="#EF4444" />
            <Text style={styles.statValue}>11.83%</Text>
            <Text style={styles.statLabel}>Current Severity</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>+31.47%</Text>
            <Text style={styles.statLabel}>7 Day Growth</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#7A9B5C" />
            <Text style={styles.statValue}>2 days</Text>
            <Text style={styles.statLabel}>Rescan In</Text>
          </View>
        </View>

                {/* Key Predictions */}
        <View style={styles.predictionsCard}>
          <Text style={styles.sectionTitle}>SPREAD FORECAST :</Text>
          <Text style={styles.sectionTitle.title2}>(Expected Coverage)</Text>

          <View style={styles.predictionItem}>
            <View style={styles.predictionTimeTag}>
              <Text style={styles.predictionTimeText}>1 Day</Text>
            </View>
            <View style={styles.predictionInfo} >
              <Text style={styles.predictionValue}>13.61%</Text>
              <Text style={styles.predictionChange}>+1.78% increase</Text>
            </View>
            <View style={[styles.riskTag, styles.riskTagLow]}>
              <Text style={styles.riskTagText}>Low Risk</Text>
            </View>
          </View>

          <View style={styles.predictionDivider} />

          <View style={styles.predictionItem}>
            <View
              style={[
                styles.predictionTimeTag,
                styles.predictionTimeTagWarning,
              ]}
            >
              <Text style={styles.predictionTimeText}>3 Days</Text>
            </View>
            <View style={styles.predictionInfo}>
              <Text
                style={[styles.predictionValue, styles.predictionValueWarning]}
              >
                18.00%
              </Text>
              <Text style={styles.predictionChange}>+6.17% increase</Text>
            </View>
            <View style={[styles.riskTag, styles.riskTagHigh]}>
              <Text style={styles.riskTagText}>High Risk</Text>
            </View>
          </View>

          <View style={styles.predictionDivider} />

          <View style={styles.predictionItem}>
            <View
              style={[styles.predictionTimeTag, styles.predictionTimeTagDanger]}
            >
              <Text style={styles.predictionTimeText}>7 Days</Text>
            </View>
            <View style={styles.predictionInfo}>
              <Text
                style={[styles.predictionValue, styles.predictionValueDanger]}
              >
               31.47%
              </Text>
              <Text style={styles.predictionChange}>+19.64% increase</Text>
            </View>
            <View style={[styles.riskTag, styles.riskTagCritical]}>
              <Text style={styles.riskTagText}>Critical</Text>
            </View>
          </View>
        </View>

        {/* Spread Projection Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>7 Day Spread Projection</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Infection Rate %</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight}>
              <Defs>
                <LinearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor="#10B981" stopOpacity="1" />
                  <Stop offset="0.5" stopColor="#F59E0B" stopOpacity="1" />
                  <Stop offset="1" stopColor="#EF4444" stopOpacity="1" />
                </LinearGradient>
              </Defs>

              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <Path
                  key={i}
                  d={`M 0 ${(chartHeight / 4) * i} L ${chartWidth} ${(chartHeight / 4) * i
                    }`}
                  stroke="#F0F0F0"
                  strokeWidth="1"
                />
              ))}

              {/* Line chart */}
              <Polyline
                points={points}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {chartData.map((value, index) => {
                const x = (index / (chartData.length - 1)) * chartWidth;
                const y =
                  chartHeight -
                  ((value - minValue) / range) * (chartHeight - 20);
                return (
                  <Circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="6"
                    fill={
                      index < 1 ? "#10B981" : index < 2 ? "#F59E0B" : "#EF4444"
                    }
                    stroke="#FFF"
                    strokeWidth="2"
                  />
                );
              })}
            </Svg>
          </View>

          <View style={styles.daysContainer}>
            {days.map((day, index) => (
              <Text key={index} style={styles.dayLabel}>
                {day}
              </Text>
            ))}
          </View>

          {/* Chart Values */}
          <View style={styles.chartValues}>
            {chartData.map((value, index) => (
              <Text
                key={index}
                style={[
                  styles.chartValueText,
                  index >= 4 && styles.chartValueDanger,
                ]}
              >
                {value}%
              </Text>
            ))}
          </View>
        </View>



        {/* Early Action Recommendations */}
        <View style={styles.actionsCard}>
          <View style={styles.actionsHeader}>
            <Ionicons name="clipboard-outline" size={24} color="#1B9568" />
            <Text style={styles.actionsTitle}>Early Action Suggested</Text>
          </View>
          {/* Advisory Line (NEW) */}
  <View style={styles.advisoryBox}>
    <Ionicons name="shield-checkmark-outline"  size={18} color="#10B981" />
    <Text style={styles.advisoryText}>
      ADVISORY: Blight detected. Apply fungicide immediately.
    </Text>
  </View>
          <View style={styles.actionItem}>
            <View style={styles.actionNumber}>
              <Text style={styles.actionNumberText}>1</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Prune & Isolate</Text>
              <Text style={styles.actionDescription}>
                Remove infected leaves immediately. Isolate affected seedlings
                to prevent leaf to leaf spread.
              </Text>
            </View>
          </View>

          <View style={styles.actionItem}>
            <View style={styles.actionNumber}>
              <Text style={styles.actionNumberText}>2</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Apply Fungicide</Text>
                <Text style={styles.actionDescription}>• Apply a 1% Bordeaux mixture or another copper-based fungicide.</Text>
                <Text style={styles.actionDescription}>• Spray a solution containing 20 milliliters of Hexaconazole fungicide (50 grams per liter), diluted in 10 liters of water.</Text>
                <Text style={styles.actionDescription}>• Spray a solution containing 5 milliliters of tebuconazole fungicide (250 grams per liter), diluted in 10 liters of water.</Text>
              
            </View>
          </View>

          <View style={styles.actionItem}>
            <View style={styles.actionNumber}>
              <Text style={styles.actionNumberText}>3</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Rescan Schedule</Text>
              <Text style={styles.actionDescription}>
                Scan again in 2 days to monitor treatment effectiveness and
                infection progression.
              </Text>
            </View>
          </View>
        </View>

        {/* Additional spacing at bottom */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleRescan}
          activeOpacity={0.8}
        >
          <Ionicons name="scan" size={20} color="#1B9568" />
          <Text style={styles.secondaryButtonText}>Rescan Leaf</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleViewActions}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}> Prevention Guide</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
  },
  leafImage: {
    width: "100%",
    height: 240,
  },
  imageOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  diseaseSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 18,
  },
  diseaseTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  diseaseSubtitle: {
    fontSize: 15,
    color: "#6B7280",
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: "#c0eddeff",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    borderWidth: 1,
    borderColor: "#0fc085ff",
  },
  alertIcon: {
    marginRight: 14,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 6,
  },
  warningAlert: {
    color: "#F59E0B",
    marginTop: 3,
    textAlign: "left",
  },
  alertText: {
    fontSize: 14,
    color: "#7F1D1D",
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  chartContainer: {
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    flex: 1,
    textAlign: "center",
  },
  chartValues: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  chartValueText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#10B981",
    flex: 1,
    textAlign: "center",
  },
  chartValueDanger: {
    color: "#EF4444",
  },
  predictionsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 1,
  },
  sectionTitle2: {
    fontSize: 14,
    fontWeight: "500",
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  predictionTimeTag: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
  },
  predictionTimeTagWarning: {
    backgroundColor: "#FEF3C7",
  },
  predictionTimeTagDanger: {
    backgroundColor: "#FEE2E2",
  },
  predictionTimeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  predictionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  predictionValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 2,
  },
  predictionValueWarning: {
    color: "#F59E0B",
  },
  predictionValueDanger: {
    color: "#EF4444",
  },
  predictionChange: {
    fontSize: 12,
    color: "#6B7280",
  },
  riskTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
    riskTagLow: {
    backgroundColor: "#D1FAE5",
  },
  riskTagHigh: {
    backgroundColor: "#FEF3C7",
  },
  riskTagCritical: {
    backgroundColor: "#FEE2E2",
  },
  
  riskTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
    textTransform: "uppercase",
  },
  predictionDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
  actionsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  actionItem: {
    flexDirection: "row",
    marginBottom: 20,
  },

  advisoryBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#D1FAE5",
  padding: 10,
  borderRadius: 8,
  marginTop: 8,
  marginBottom: 12,
},

advisoryText: {
  color: "#10B981",
  fontSize: 13,
  fontWeight: "600",
  marginLeft: 6,
},
  actionNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionNumberText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  actionDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 35,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AnalysisDetailsScreen;
