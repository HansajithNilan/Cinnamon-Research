import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";

const { width } = Dimensions.get("window");

const SuggestionsScreen = ({ navigation }) => {
  const issues = [
    {
      id: 1,
      icon: "water",
      iconColor: "#FF6B6B",
      title: "High Humidity | අධික ආර්ද්‍රතාවය",
      badge: "Critical | බරපතල",
      priority: "high",
      current: "75%",
      ideal: "60-70%",
      deviation: "+5%",
      reasons: [
        { text: "Mold growth risk", icon: "water" },
        { text: "Cinnamon spoilage potential", icon: "warning" }
      ],
      recommendations: [
        "Activate dehumidifiers in zone B immediately | වහාම B කලාපයේ dehumidifiers සක්‍රිය කරන්න",
        "Increase warehouse ventilation by opening vents | වාතාශ්‍රය විවෘත කරන්න",
        "Check for any water leakage sources | ජල කාන්දු මූලාශ්‍ර පරීක්ෂා කරන්න",
      ],
    },
    {
      id: 2,
      icon: "thermometer",
      iconColor: "#FDCB6E",
      title: "Low Temperature | අඩු උෂ්ණත්වය",
      badge: "Warning | අවවාදය",
      priority: "medium",
      current: "12°C",
      ideal: "15-18°C",
      deviation: "-3°C",
      reasons: [
        { text: "Reduced aroma quality", icon: "rose" },
        { text: "Moisture condensation", icon: "water-outline" }
      ],
      recommendations: [
        "Adjust thermostat to target range | තාපාංකය ඉලක්ක පරාසයට සකසන්න",
        "Ensure all insulation is intact and seal any drafts | පරිවාරණය නිසියාකාරව ඇති බව සහතික කරන්න",
      ],
    },
    {
      id: 3,
      icon: "sunny",
      iconColor: "#FDCB6E",
      title: "Excessive Light | අධික ආලෝකය",
      badge: "Warning | අවවාදය",
      priority: "medium",
      current: "250 lux",
      ideal: "< 200 lux",
      deviation: "+50 lux",
      reasons: [
        { text: "Colour degradation", icon: "color-palette" },
        { text: "Essential oil breakdown", icon: "flask" }
      ],
      recommendations: [
        "Reduce artificial lighting intensity in affected areas | බලපෑමට ලක් වූ ප්‍රදේශවල ආලෝකය අඩු කරන්න",
        "Cover windows or use blinds to block direct sunlight | කවුළු ආවරණය කරන්න",
      ],
    },
  ];

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "high":
        return {
          bg: "rgba(255, 107, 107, 0.12)",
          color: "#FF6B6B",
          gradient: ["#FF6B6B", "#EE5A5A"],
        };
      case "medium":
        return {
          bg: "rgba(253, 203, 110, 0.15)",
          color: "#F39C12",
          gradient: ["#FDCB6E", "#F39C12"],
        };
      default:
        return {
          bg: "rgba(0, 184, 148, 0.12)",
          color: "#00B894",
          gradient: ["#00B894", "#00A085"],
        };
    }
  };

  const criticalCount = issues.filter(i => i.priority === "high").length;
  const warningCount = issues.filter(i => i.priority === "medium").length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={["#2E7D32", "#4CAF50", "#66BB6A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Decorative Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
          
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <View style={styles.greetingRow}>
                  <Text style={styles.greetingText}>Smart Insights | බුද්ධිමත් අවබෝධය</Text>
                  <View style={styles.aiBadge}>
                    <Ionicons name="sparkles" size={10} color="#FFF" />
                    <Text style={styles.aiBadgeText}></Text>
                  </View>
                </View>
                <Text style={styles.brandText}>Suggestions | යෝජනා</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <LinearGradient
                colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0.15)"]}
                style={styles.profileGradient}
              >
                <Ionicons name="bulb" size={22} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={["#FF6B6B", "#EE5A5A"]}
                style={styles.summaryIconBg}
              >
                <Ionicons name="alert-circle" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{criticalCount}</Text>
              <Text style={styles.summaryLabel}>Critical | බරපතල</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: "#FF6B6B" }]} />
            </View>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={["#FDCB6E", "#F39C12"]}
                style={styles.summaryIconBg}
              >
                <Ionicons name="warning" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{warningCount}</Text>
              <Text style={styles.summaryLabel}>Warning | අවවාදය</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: "#F39C12" }]} />
            </View>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={["#00B894", "#00A085"]}
                style={styles.summaryIconBg}
              >
                <Ionicons name="checkmark-done" size={18} color="#FFF" />
              </LinearGradient>
              <Text style={styles.summaryValue}>{issues.length}</Text>
              <Text style={styles.summaryLabel}>Total | මුළු</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: "#00B894" }]} />
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Issues Detected Card */}
        <TouchableOpacity activeOpacity={0.9} style={styles.issuesCardWrapper}>
          <LinearGradient
            colors={["#FF6B6B", "#E74C3C", "#C0392B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.issuesCard}
          >
            {/* Decorative Elements */}
            <View style={styles.issuesDecor1} />
            <View style={styles.issuesDecor2} />
            
            <View style={styles.issuesContent}>
              <View style={styles.issuesIconContainer}>
                <View style={styles.issuesPulse} />
                <Ionicons name="warning" size={28} color="#FFF" />
              </View>
              <View style={styles.issuesTextContainer}>
                <View style={styles.issuesTitleRow}>
                  <Text style={styles.issuesTitle}>{issues.length} Issues Detected</Text>
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>URGENT</Text>
                  </View>
                </View>
                <Text style={styles.issuesSubtitle}>ගැටළු හඳුනාගත් • Warehouse A • Zone B</Text>
              </View>
              <View style={styles.issuesArrow}>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Action Required | පියවර අවශ්‍යයි</Text>
          <TouchableOpacity style={styles.filterButton}>
            {/* <Text style={styles.filterText}>Priority | ප්‍රමුඛතාව</Text> */}
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Issue Cards */}
        {issues.map((issue, index) => {
          const priorityStyles = getPriorityStyles(issue.priority);
          return (
            <View key={issue.id} style={styles.card}>
              {/* Priority Indicator */}
              <LinearGradient
                colors={priorityStyles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.priorityIndicator}
              />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <LinearGradient
                      colors={priorityStyles.gradient}
                      style={styles.iconContainer}
                    >
                      <Ionicons name={issue.icon} size={24} color="#FFF" />
                    </LinearGradient>
                    <View style={styles.cardTitleTextContainer}>
                      <Text style={styles.cardTitle}>{issue.title}</Text>
                      <View style={styles.cardNumberRow}>
                        <View style={styles.cardNumberDot} />
                        <Text style={styles.cardNumber}>Issue #{issue.id}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.badge, { backgroundColor: priorityStyles.bg }]}>
                    <View style={[styles.badgeDot, { backgroundColor: priorityStyles.color }]} />
                    <Text style={[styles.badgeText, { color: priorityStyles.color }]}>
                      {issue.badge}
                    </Text>
                  </View>
                </View>

                <LinearGradient
                  colors={[priorityStyles.bg, `${priorityStyles.bg}50`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.metricsContainer}
                >
                  <View style={styles.metricCard}>
                    <View style={styles.metricIconWrapper}>
                      <Ionicons name="speedometer-outline" size={14} color={priorityStyles.color} />
                    </View>
                    <Text style={styles.metricLabel}>Current | වර්තමාන</Text>
                    <Text style={[styles.metricValue, { color: priorityStyles.color }]}>{issue.current}</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricCard}>
                    <View style={styles.metricIconWrapper}>
                      <Ionicons name="checkmark-circle-outline" size={14} color="#00B894" />
                    </View>
                    <Text style={styles.metricLabel}>Ideal | ප්‍රශස්ත</Text>
                    <Text style={[styles.metricValue, { color: "#00B894" }]}>{issue.ideal}</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricCard}>
                    <View style={styles.metricIconWrapper}>
                      <Ionicons name="trending-up" size={14} color={priorityStyles.color} />
                    </View>
                    <Text style={styles.metricLabel}>Deviation | විචලනය</Text>
                    <Text style={[styles.metricValue, { color: priorityStyles.color }]}>{issue.deviation}</Text>
                  </View>
                </LinearGradient>

                {/* Reasons for risk */}
                {issue.reasons && issue.reasons.length > 0 && (
                  <View style={styles.reasonsContainer}>
                    <View style={styles.reasonsHeader}>
                      <Ionicons name="alert-circle" size={16} color="#E17055" />
                      <Text style={styles.reasonsTitle}>Risk Impact</Text>
                    </View>
                    <View style={styles.reasonsList}>
                      {issue.reasons.map((reason, idx) => (
                        <View key={idx} style={styles.reasonItem}>
                          <View style={styles.reasonIconContainer}>
                            <Ionicons name={reason.icon} size={16} color="#E17055" />
                          </View>
                          <Text style={styles.reasonText}>{reason.text}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.recommendationsContainer}>
                  <View style={styles.recommendationsHeader}>
                    <LinearGradient
                      colors={["#FFD700", "#FFA500"]}
                      style={styles.recommendationsIconBg}
                    >
                      <Ionicons name="bulb" size={14} color="#FFF" />
                    </LinearGradient>
                    <Text style={styles.recommendationsTitle}>Recommendations | නිර්දේශ</Text>
                    <View style={styles.recommendationsCount}>
                      <Text style={styles.recommendationsCountText}>{issue.recommendations.length}</Text>
                    </View>
                  </View>
                  <View style={styles.recommendationsList}>
                    {issue.recommendations.map((rec, recIndex) => (
                      <View key={recIndex} style={styles.recommendationItem}>
                        <LinearGradient
                          colors={priorityStyles.gradient}
                          style={styles.recommendationNumber}
                        >
                          <Text style={styles.recommendationNumberText}>
                            {recIndex + 1}
                          </Text>
                        </LinearGradient>
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.dismissButton} activeOpacity={0.7}>
                    <View style={styles.dismissButtonInner}>
                      <Ionicons name="time-outline" size={18} color="#888" />
                      <Text style={styles.dismissButtonText}>Snooze | පසුවට</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resolveButton} activeOpacity={0.85}>
                    <LinearGradient
                      colors={["#00B894", "#00A085", "#009975"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.resolveButtonGradient}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                      <Text style={styles.resolveButtonText}>Resolve | විසඳන්න</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* All Conditions Optimal Card */}
        <View style={styles.optimalCardWrapper}>
          <LinearGradient
            colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.optimalCard}
          >
            {/* Decorative Elements */}
            <View style={styles.optimalDecor1} />
            <View style={styles.optimalDecor2} />
            
            <View style={styles.optimalIconContainer}>
              <View style={styles.optimalIconRing}>
                <LinearGradient
                  colors={["#00B894", "#00A085", "#009975"]}
                  style={styles.optimalIconGradient}
                >
                  <Ionicons name="shield-checkmark" size={36} color="#FFF" />
                </LinearGradient>
              </View>
            </View>
            
            <View style={styles.optimalBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#00B894" />
              <Text style={styles.optimalBadgeText}>PROTECTED</Text>
            </View>
            
            <Text style={styles.optimalTitle}>Quality Protection Active</Text>
            <Text style={styles.optimalTitleSinhala}>ගුණාත්මක ආරක්ෂාව සක්‍රීයයි</Text>
            <Text style={styles.optimalSubtitle}>
              Once all issues are resolved, your cinnamon storage will be in optimal condition.
            </Text>
            
            <View style={styles.optimalStats}>
              <View style={styles.optimalStatItem}>
                <LinearGradient
                  colors={["#00B894", "#00A085"]}
                  style={styles.optimalStatIcon}
                >
                  <Ionicons name="analytics" size={16} color="#FFF" />
                </LinearGradient>
                <Text style={styles.optimalStatValue}>98%</Text>
                <Text style={styles.optimalStatLabel}>Quality Score</Text>
              </View>
              <View style={styles.optimalStatDivider} />
              <View style={styles.optimalStatItem}>
                <LinearGradient
                  colors={["#4CAF50", "#2E7D32"]}
                  style={styles.optimalStatIcon}
                >
                  <Ionicons name="eye" size={16} color="#FFF" />
                </LinearGradient>
                <Text style={styles.optimalStatValue}>24/7</Text>
                <Text style={styles.optimalStatLabel}>Monitoring</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  decorativeCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    top: 100,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decorativeCircle3: {
    position: "absolute",
    bottom: 30,
    right: 60,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
    marginLeft: 3,
  },
  brandText: {
    fontSize: 22,
    color: colors.white,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  profileButton: {
    overflow: "hidden",
    borderRadius: 16,
  },
  profileGradient: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  summaryIconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.white,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    textAlign: "center",
  },
  summaryIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
  },
  issuesCardWrapper: {
    marginBottom: 20,
    borderRadius: 22,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  issuesCard: {
    borderRadius: 22,
    padding: 20,
    overflow: "hidden",
  },
  issuesDecor1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  issuesDecor2: {
    position: "absolute",
    bottom: -20,
    left: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  issuesContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  issuesIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  issuesPulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  issuesTextContainer: {
    flex: 1,
  },
  issuesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  issuesTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.3,
  },
  urgentBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 10,
  },
  urgentBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  issuesSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
  },
  issuesArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginRight: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    flexDirection: "row",
    overflow: "hidden",
  },
  priorityIndicator: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardTitleTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  cardNumberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardNumberDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CCC",
    marginRight: 6,
  },
  cardNumber: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricsContainer: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    alignItems: "center",
  },
  metricIconWrapper: {
    marginBottom: 6,
  },
  metricDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginHorizontal: 10,
  },
  metricLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  recommendationsContainer: {
    marginBottom: 18,
  },
  recommendationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  recommendationsIconBg: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
    marginLeft: 10,
    flex: 1,
  },
  recommendationsCount: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  recommendationsCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  recommendationsList: {},
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 12,
  },
  recommendationNumber: {
    width: 26,
    height: 26,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recommendationNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
    marginTop: 4,
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  dismissButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dismissButtonText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginLeft: 6,
  },
  resolveButton: {
    overflow: "hidden",
    borderRadius: 14,
    shadowColor: "#00B894",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resolveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resolveButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  optimalCardWrapper: {
    marginTop: 8,
    borderRadius: 26,
    shadowColor: "#00B894",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  optimalCard: {
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    overflow: "hidden",
  },
  optimalDecor1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 184, 148, 0.1)",
  },
  optimalDecor2: {
    position: "absolute",
    bottom: -30,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 184, 148, 0.08)",
  },
  optimalIconContainer: {
    marginBottom: 16,
  },
  optimalIconRing: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: "rgba(0, 184, 148, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  optimalIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  optimalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 184, 148, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  optimalBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00B894",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  optimalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 4,
    textAlign: "center",
  },
  optimalTitleSinhala: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 12,
    textAlign: "center",
  },
  optimalSubtitle: {
    fontSize: 13,
    color: "#4CAF50",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  optimalStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  optimalStatItem: {
    flex: 1,
    alignItems: "center",
  },
  reasonsContainer: {
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: "rgba(225, 112, 85, 0.05)",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#E17055",
  },
  reasonsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reasonsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E17055",
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  reasonsList: {
    gap: 10,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reasonIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(225, 112, 85, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
    lineHeight: 18,
  },
  optimalStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  optimalStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    marginHorizontal: 20,
  },
  optimalStatValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B5E20",
    marginBottom: 4,
  },
  optimalStatLabel: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SuggestionsScreen;
