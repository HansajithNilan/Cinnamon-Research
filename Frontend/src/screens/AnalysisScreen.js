import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";

const { width } = Dimensions.get("window");

// Animated Progress Bar Component
const ProgressBar = ({
  label,
  labelSinhala,
  percentage,
  status,
  statusSinhala,
  color,
  gradientColors,
  icon,
  delay = 0,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1200,
      delay: delay + 300,
      useNativeDriver: false,
    }).start();
  }, [percentage, delay]);

  const getStatusIcon = () => {
    if (percentage >= 70) return "checkmark-circle";
    if (percentage >= 40) return "alert-circle";
    return "close-circle";
  };

  return (
    <Animated.View
      style={[
        styles.progressCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.progressCardInner}>
        {/* Icon and Label Section */}
        <View style={styles.progressTopRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
          </View>
          <View style={styles.labelContainer}>
            <Text style={styles.nutrientLabel}>{label}</Text>
            <Text style={styles.nutrientLabelSinhala}>{labelSinhala}</Text>
          </View>
          <View style={[styles.percentageBadge, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.percentageText, { color: color }]}>
              {percentage}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: animatedWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientFill}
              />
            </Animated.View>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}>
            <Ionicons
              name={getStatusIcon()}
              size={16}
              color={color}
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, { color: color }]}>{status}</Text>
          </View>
          <Text style={styles.statusTextSinhala}>{statusSinhala}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, subtitle, icon, color }) => (
  <View style={[styles.summaryCard, { borderLeftColor: color }]}>
    <View style={[styles.summaryIconContainer, { backgroundColor: `${color}15` }]}>
      <Feather name={icon} size={20} color={color} />
    </View>
    <View style={styles.summaryContent}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryTitle}>{title}</Text>
    </View>
  </View>
);

export default function AnalysisScreen() {
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={["#1B5E20", "#2E7D32", "#43A047"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Nutrient Analysis</Text>
            <Text style={styles.headerSubtitle}>පෝෂක විශ්ලේෂණය</Text>
          </View>
          <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
            <Feather name="more-vertical" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Summary Stats */}
        <Animated.View
          style={[
            styles.summaryRow,
            {
              opacity: headerAnim,
            },
          ]}
        >
          <SummaryCard
            title="Total Nutrients"
            value="3"
            subtitle="Analyzed"
            icon="layers"
            color="#4CAF50"
          />
          <SummaryCard
            title="Avg Level"
            value="50%"
            subtitle="Overall"
            icon="trending-up"
            color="#FF9800"
          />
          <SummaryCard
            title="Deficits"
            value="2"
            subtitle="Found"
            icon="alert-triangle"
            color="#F44336"
          />
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Current Deficits</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            වත්මන් පෝෂක හිඟයන් • Real-time soil analysis
          </Text>
        </View>

        {/* Nitrogen Progress */}
        <ProgressBar
          label="Nitrogen (N)"
          labelSinhala="නයිට්රජන්"
          percentage={20}
          status="High Deficit"
          statusSinhala="අධික හිඟය"
          color="#E53935"
          gradientColors={["#EF5350", "#E53935", "#C62828"]}
          icon="leaf"
          delay={100}
        />

        {/* Phosphorus Progress */}
        <ProgressBar
          label="Phosphorus (P)"
          labelSinhala="පොස්පරස්"
          percentage={50}
          status="Moderate Deficit"
          statusSinhala="මධ්‍යස්ථ හිඟය"
          color="#FB8C00"
          gradientColors={["#FFA726", "#FB8C00", "#EF6C00"]}
          icon="atom"
          delay={250}
        />

        {/* Potassium Progress */}
        <ProgressBar
          label="Potassium (K)"
          labelSinhala="පොටෑසියම්"
          percentage={80}
          status="Optimal Level"
          statusSinhala="ප්‍රශස්ත මට්ටම"
          color="#43A047"
          gradientColors={["#66BB6A", "#43A047", "#2E7D32"]}
          icon="flask"
          delay={400}
        />

        {/* Info Card */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={["#E8F5E9", "#C8E6C9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoCardGradient}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="information-circle" size={28} color="#2E7D32" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Understanding Your Results</Text>
              <Text style={styles.infoText}>
                These percentages indicate the current nutrient levels in your soil.
                Aim for higher percentages to ensure optimal plant growth.
              </Text>
              <View style={styles.infoDivider} />
              <Text style={styles.infoTextSinhala}>
                මෙම ප්‍රතිශත මඟින් ඔබේ පසෙහි පවතින පෝෂක මට්ටම් පෙන්නුම් කරයි.
                ප්‍රශස්ත ශාක වර්ධනයක් සහතික කිරීම සඳහා ඉහළ ප්‍රතිශත ඉලක්ක කරන්න.
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.85}>
          <LinearGradient
            colors={["#43A047", "#2E7D32"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <Feather name="zap" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Get Recommendations</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
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
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: "#1B5E20",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  summaryContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  summaryTitle: {
    fontSize: 11,
    color: "#666",
    marginTop: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionIndicator: {
    width: 4,
    height: 24,
    backgroundColor: "#43A047",
    borderRadius: 2,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#757575",
    marginLeft: 16,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  progressCardInner: {
    padding: 20,
  },
  progressTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  labelContainer: {
    flex: 1,
    marginLeft: 14,
  },
  nutrientLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: 0.2,
  },
  nutrientLabelSinhala: {
    fontSize: 13,
    color: "#757575",
    marginTop: 2,
  },
  percentageBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: "700",
  },
  progressBarWrapper: {
    marginBottom: 14,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
    overflow: "hidden",
  },
  gradientFill: {
    flex: 1,
    borderRadius: 5,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusTextSinhala: {
    fontSize: 13,
    color: "#9E9E9E",
  },
  infoCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#2E7D32",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoCardGradient: {
    flexDirection: "row",
    padding: 20,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(46, 125, 50, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#2E7D32",
    lineHeight: 20,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "rgba(46, 125, 50, 0.2)",
    marginVertical: 12,
  },
  infoTextSinhala: {
    fontSize: 13,
    color: "#388E3C",
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#2E7D32",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 30,
  },
});
