import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";

const SuggestionsScreen = ({ navigation }) => {
  const issues = [
    {
      id: 1,
      icon: "water",
      iconColor: "#FF3B30",
      title: "High Humidity",
      badge: "Too High",
      badgeColor: "#FFE5E5",
      badgeTextColor: "#FF3B30",
      current: "75%",
      ideal: "60-70%",
      recommendations: [
        "Activate dehumidifiers in zone B.",
        "Increase warehouse ventilation by opening vents.",
      ],
    },
    {
      id: 2,
      icon: "thermometer",
      iconColor: "#FFB800",
      title: "Low Temperature",
      badge: "Too Low",
      badgeColor: "#FFF4E5",
      badgeTextColor: "#FFB800",
      current: "12°C",
      ideal: "15-18°C",
      recommendations: [
        "Adjust thermostat to target range.",
        "Ensure all insulation is intact and seal any drafts.",
      ],
    },
    {
      id: 3,
      icon: "sunny",
      iconColor: "#FFB800",
      title: "Excessive Light",
      badge: "Too High",
      badgeColor: "#FFF4E5",
      badgeTextColor: "#FFB800",
      current: "250 lux",
      ideal: "< 200 lux",
      recommendations: [
        "Reduce artificial lighting intensity in affected areas.",
        "Cover windows or use blinds to block direct sunlight.",
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
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
                <Text style={styles.greetingText}>Actionable</Text>
                <Text style={styles.brandText}>Suggestions</Text>
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Issues Detected Card */}
        <View style={styles.issuesCard}>
          <View style={styles.issuesIconContainer}>
            <Ionicons name="alert-circle" size={24} color="#FF3B30" />
          </View>
          <View style={styles.issuesTextContainer}>
            <Text style={styles.issuesTitle}>3 Issues Detected</Text>
            <Text style={styles.issuesSubtitle}>in Warehouse A</Text>
          </View>
        </View>

        {/* Issue Cards */}
        {issues.map((issue) => (
          <View key={issue.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name={issue.icon} size={20} color={issue.iconColor} />
                <Text style={styles.cardTitle}>{issue.title}</Text>
              </View>
              <View
                style={[styles.badge, { backgroundColor: issue.badgeColor }]}
              >
                <Text
                  style={[styles.badgeText, { color: issue.badgeTextColor }]}
                >
                  {issue.badge}
                </Text>
              </View>
            </View>

            <View style={styles.metricsContainer}>
              <Text style={styles.metricLabel}>
                Current: <Text style={styles.metricValue}>{issue.current}</Text>
              </Text>
              <Text style={styles.metricLabel}>
                Ideal: <Text style={styles.metricValue}>{issue.ideal}</Text>
              </Text>
            </View>

            <Text style={styles.recommendationsTitle}>Recommendations:</Text>
            <View style={styles.recommendationsList}>
              {issue.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.resolveButton}>
              <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* All Conditions Optimal Card */}
        <View style={styles.optimalCard}>
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#34C759" />
          </View>
          <Text style={styles.optimalTitle}>All Conditions Optimal</Text>
          <Text style={styles.optimalSubtitle}>
            Cinnamon quality is protected.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  scrollContent: {
    padding: 16,
  },
  issuesCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  issuesIconContainer: {
    marginRight: 16,
  },
  issuesTextContainer: {
    flex: 1,
  },
  issuesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  issuesSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  metricsContainer: {
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 12,
  },
  recommendationsList: {
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: "#000",
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
  },
  resolveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  resolveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  optimalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
  },
  checkmarkContainer: {
    marginBottom: 16,
  },
  optimalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  optimalSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
});

export default SuggestionsScreen;
