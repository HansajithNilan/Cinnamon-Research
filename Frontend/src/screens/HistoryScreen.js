import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function HistoryScreen() {
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card animations
    const cardStagger = cardAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 120,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, cardStagger).start();
  }, []);

  const nutrientData = [
    {
      name: "Nitrogen (N)",
      nameSinhala: "නයිට්‍රජන්",
      change: "+12%",
      lastDays: "Last 30 Days",
      color: "#2E7D32",
      bgColor: "#E8F5E9",
      isPositive: true,
      icon: "leaf",
      iconType: "fontawesome",
      description: "Healthy growth indicator",
      trend: [30, 45, 40, 55, 50, 65, 70],
    },
    {
      name: "Phosphorus (P)",
      nameSinhala: "පොස්පරස්",
      change: "-5%",
      lastDays: "Last 30 Days",
      color: "#D32F2F",
      bgColor: "#FFEBEE",
      isPositive: false,
      icon: "atom",
      iconType: "material",
      description: "Root development nutrient",
      trend: [60, 55, 58, 52, 50, 48, 55],
    },
    {
      name: "Potassium (K)",
      nameSinhala: "පොටෑසියම්",
      change: "+8%",
      lastDays: "Last 30 Days",
      color: "#388E3C",
      bgColor: "#E8F5E9",
      isPositive: true,
      icon: "flask",
      iconType: "fontawesome",
      description: "Disease resistance booster",
      trend: [35, 40, 38, 45, 50, 52, 58],
    },
    {
      name: "Moisture",
      nameSinhala: "තෙතමනය",
      change: "+3%",
      lastDays: "Last 30 Days",
      color: "#00838F",
      bgColor: "#E0F7FA",
      isPositive: true,
      icon: "water",
      iconType: "material",
      description: "Soil hydration level",
      trend: [50, 48, 52, 55, 53, 56, 58],
    },
  ];

  const renderMiniChart = (trend, color, isPositive) => {
    const maxVal = Math.max(...trend);
    const minVal = Math.min(...trend);
    const range = maxVal - minVal || 1;
    
    return (
      <View style={styles.miniChartContainer}>
        {trend.map((value, index) => {
          const height = ((value - minVal) / range) * 40 + 10;
          return (
            <View
              key={index}
              style={[
                styles.chartBar,
                {
                  height,
                  backgroundColor: color,
                  opacity: 0.3 + (index / trend.length) * 0.7,
                },
              ]}
            />
          );
        })}
        <View style={[styles.trendLine, { borderColor: color }]} />
      </View>
    );
  };

  const summaryStats = [
    { label: "Improved", value: "3", icon: "trending-up", color: "#2E7D32" },
    { label: "Declined", value: "1", icon: "trending-down", color: "#D32F2F" },
    { label: "Analyses", value: "12", icon: "analytics-outline", color: "#43A047" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      {/* Enhanced Header Section */}
      <Animated.View 
        style={[
          styles.headerWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#1B5E20", "#2E7D32", "#43A047"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Decorative elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
          
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greetingText}>Detection History</Text>
                <Text style={styles.brandText}>Past Analyses</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
              <LinearGradient
                colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]}
                style={styles.filterGradient}
              >
                <Ionicons name="filter" size={20} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            {summaryStats.map((stat, index) => (
              <View key={index} style={styles.summaryItem}>
                <View style={[styles.summaryIconContainer, { backgroundColor: `${stat.color}30` }]}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text style={styles.summaryValue}>{stat.value}</Text>
                <Text style={styles.summaryLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={24} color="#2E7D32" />
            <Text style={styles.sectionTitle}>30-Day Changes</Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Nutrient Cards */}
        {nutrientData.map((item, index) => (
          <Animated.View 
            key={index} 
            style={[
              styles.card,
              {
                opacity: cardAnimations[index],
                transform: [{
                  translateY: cardAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                }],
              },
            ]}
          >
            <TouchableOpacity activeOpacity={0.95}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <View style={[styles.cardIconContainer, { backgroundColor: item.bgColor }]}>
                    {item.iconType === "fontawesome" ? (
                      <FontAwesome5 name={item.icon} size={18} color={item.color} />
                    ) : (
                      <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                    )}
                  </View>
                  <View style={styles.cardTitleContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardTitleSinhala}>{item.nameSinhala}</Text>
                  </View>
                </View>
                <View style={[
                  styles.changeBadge, 
                  { backgroundColor: item.isPositive ? "#E8F5E9" : "#FFEBEE" }
                ]}>
                  <Ionicons 
                    name={item.isPositive ? "trending-up" : "trending-down"} 
                    size={14} 
                    color={item.color} 
                  />
                  <Text style={[styles.changeBadgeText, { color: item.color }]}>
                    {item.change}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardStats}>
                  <Text style={[styles.cardChange, { color: item.color }]}>
                    {item.change}
                  </Text>
                  <View style={styles.cardMeta}>
                    <Ionicons name="calendar-outline" size={14} color="#9E9E9E" />
                    <Text style={styles.lastDaysText}>{item.lastDays}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>

                {/* Mini Chart */}
                <View style={styles.chartWrapper}>
                  {renderMiniChart(item.trend, item.color, item.isPositive)}
                </View>
              </View>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <LinearGradient
                    colors={[item.color, `${item.color}80`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill,
                      { width: `${Math.abs(parseInt(item.change)) * 8}%` }
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Export Report Card */}
        <TouchableOpacity style={styles.exportCard} activeOpacity={0.9}>
          <LinearGradient
            colors={["#2E7D32", "#43A047"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.exportGradient}
          >
            <View style={styles.exportContent}>
              <View style={styles.exportIconContainer}>
                <MaterialCommunityIcons name="file-document-outline" size={28} color={colors.white} />
              </View>
              <View style={styles.exportTextContainer}>
                <Text style={styles.exportTitle}>Generate Report</Text>
                <Text style={styles.exportSubtitle}>Download detailed soil analysis</Text>
              </View>
            </View>
            <View style={styles.exportArrow}>
              <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Spacer */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  decorativeCircle3: {
    position: "absolute",
    top: 40,
    left: width * 0.4,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.04)",
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
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerTextContainer: {
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  brandText: {
    fontSize: 22,
    color: colors.white,
    fontWeight: "bold",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  filterButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  filterGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  summaryContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 16,
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
  },
  summaryLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginLeft: 10,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
    marginRight: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardTitleContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  cardTitleSinhala: {
    fontSize: 12,
    color: "#757575",
    marginTop: 2,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 4,
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardStats: {
    flex: 1,
  },
  cardChange: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  lastDaysText: {
    fontSize: 12,
    color: "#9E9E9E",
    marginLeft: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: "#757575",
    fontStyle: "italic",
  },
  chartWrapper: {
    width: 100,
    height: 60,
    justifyContent: "flex-end",
  },
  miniChartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 50,
    paddingHorizontal: 4,
  },
  chartBar: {
    width: 10,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  trendLine: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 2,
    borderStyle: "dashed",
    opacity: 0.3,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBackground: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  exportCard: {
    marginTop: 8,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  exportGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  exportContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  exportIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  exportTextContainer: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.white,
  },
  exportSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  exportArrow: {
    marginLeft: 12,
  },
});
