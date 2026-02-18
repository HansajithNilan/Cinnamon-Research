import React, { useRef, useEffect, useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { colors } from "../styles/colors";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { getLatestReading } from "../services/firebaseService";
import {
  getFertilizerRecommendation,
  calculateSoilQuality,
  estimateOrganicMatter
} from "../services/fertilizerApi";

const { width } = Dimensions.get("window");

// Fertilizer prices in LKR per kg (update these with current market prices)
const FERTILIZER_PRICES = {
  Urea: 150,      // Rs. 150 per kg
  TSP: 200,       // Rs. 200 per kg
  MOP: 180,       // Rs. 180 per kg
  Compost: 50,    // Rs. 50 per kg
};

// Function to calculate total cost per perch
const calculatePerPerchCost = (perPerchData) => {
  if (!perPerchData) return 0;

  const ureaCost = (perPerchData.Urea_kg || 0) * FERTILIZER_PRICES.Urea;
  const tspCost = (perPerchData.TSP_kg || 0) * FERTILIZER_PRICES.TSP;
  const mopCost = (perPerchData.MOP_kg || 0) * FERTILIZER_PRICES.MOP;
  const compostCost = (perPerchData.Compost_kg || 0) * FERTILIZER_PRICES.Compost;

  return ureaCost + tspCost + mopCost + compostCost;
};

// Function to calculate cost per plant
const calculatePerPlantCost = (perPlantData) => {
  if (!perPlantData) return 0;

  const ureaCost = ((perPlantData.Urea_g || 0) / 1000) * FERTILIZER_PRICES.Urea;
  const tspCost = ((perPlantData.TSP_g || 0) / 1000) * FERTILIZER_PRICES.TSP;
  const mopCost = ((perPlantData.MOP_g || 0) / 1000) * FERTILIZER_PRICES.MOP;
  const compostCost = (perPlantData.Compost_kg || 0) * FERTILIZER_PRICES.Compost;

  return ureaCost + tspCost + mopCost + compostCost;
};

export default function FertilizerRecommendationScreen() {
  const navigation = useNavigation();

  // State management
  const [loading, setLoading] = useState(true);
  const [sensorData, setSensorData] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Fetch data and call API on mount
    fetchDataAndRecommendation();

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card animations
    const cardStagger = cardAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 150,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, cardStagger).start();
  }, []);

  const fetchDataAndRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch latest sensor data
      const result = await getLatestReading();

      if (!result.success) {
        setError('Failed to fetch sensor data');
        setLoading(false);
        return;
      }

      const data = result.data;
      setSensorData(data);

      // Prepare data for API
      const N = Number(data.nitrogen) || 50;
      const P = Number(data.phosphorus) || 20;
      const K = Number(data.potassium) || 70;
      const pH = Number(data.ph) || 6.5;
      const EC = Number(data.ec) || 0.5;
      const Moisture = Number(data.moisture) || 40;
      const Temperature = Number(data.temperature) || 25;

      // Estimate organic matter
      const organicMatter = estimateOrganicMatter(EC, Moisture);

      // Calculate soil quality
      const soilQuality = calculateSoilQuality(N, P, K, pH, organicMatter);

      // Prepare request data
      const requestData = {
        N: parseFloat(N.toFixed(1)),
        P: parseFloat(P.toFixed(1)),
        K: parseFloat(K.toFixed(1)),
        pH: parseFloat(pH.toFixed(2)),
        EC: parseFloat(EC.toFixed(2)),
        Moisture: parseFloat(Moisture.toFixed(1)),
        Temperature: parseFloat(Temperature.toFixed(1)),
        Organic_Matter: parseFloat(organicMatter.toFixed(2)),
        Soil_Quality: soilQuality,
        Stage: "Mature"
      };

      // Call fertilizer API
      const apiResult = await getFertilizerRecommendation(requestData);

      if (apiResult.success) {
        setRecommendation(apiResult.data);
      } else {
        setError(apiResult.error || 'Failed to get recommendations');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <LinearGradient
          colors={["#1B5E20", "#2E7D32", "#43A047"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

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
                <Text style={styles.greetingText}>Tips & Guide</Text>
                <Text style={styles.brandText}>Fertilizer Plans</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B5E20" />
          <Text style={styles.loadingText}>Analyzing recommendations...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <LinearGradient
          colors={["#1B5E20", "#2E7D32", "#43A047"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

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
                <Text style={styles.greetingText}>Tips & Guide</Text>
                <Text style={styles.brandText}>Fertilizer Plans</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchDataAndRecommendation} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

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
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

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
                <Text style={styles.greetingText}>Tips & Guide</Text>
                <Text style={styles.brandText}>Fertilizer Plans</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              activeOpacity={0.8}
              onPress={fetchDataAndRecommendation}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                style={styles.profileGradient}
              >
                <Ionicons name="refresh-outline" size={22} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Header Stats */}
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="sprout" size={24} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>Cinnamon</Text>
              <Text style={styles.statLabel}>Crop Type</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="flask-outline" size={24} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{recommendation?.meta?.soil_quality || 'N/A'}</Text>
              <Text style={styles.statLabel}>Soil Quality</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>{recommendation?.meta?.stage || 'Mature'}</Text>
              <Text style={styles.statLabel}>Growth Stage</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Recommendation Card - Per Plant */}
        <Animated.View
          style={[
            styles.recommendationCard,
            {
              opacity: cardAnimations[0],
              transform: [{
                translateY: cardAnimations[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              }],
            },
          ]}
        >
          <LinearGradient
            colors={["#E8F5E9", "#C8E6C9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.recommendationGradient}
          >
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationIconContainer}>
                <MaterialCommunityIcons name="check-decagram" size={26} color="#2E7D32" />
              </View>
              <View style={styles.recommendationBadge}>
                <Text style={styles.badgeText}>Per Plant</Text>
              </View>
            </View>

            <Text style={styles.recommendationLabel}>Recommended Fertilizer Amount</Text>

            {/* Vertical List with Icon Badges */}
            <View style={styles.perPlantVerticalList}>
              <View style={styles.perPlantVerticalItem}>
                <View style={styles.perPlantLeftSection}>
                  <View style={[styles.perPlantBadge, { backgroundColor: "#4CAF50" }]}>
                    <FontAwesome5 name="leaf" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.perPlantVerticalName}>Urea</Text>
                </View>
                <Text style={styles.perPlantVerticalValue}>{recommendation?.per_plant?.Urea_g?.toFixed(1) || 0}g</Text>
              </View>

              <View style={styles.perPlantVerticalItem}>
                <View style={styles.perPlantLeftSection}>
                  <View style={[styles.perPlantBadge, { backgroundColor: "#2196F3" }]}>
                    <FontAwesome5 name="seedling" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={styles.perPlantVerticalName}>TSP</Text>
                </View>
                <Text style={styles.perPlantVerticalValue}>{recommendation?.per_plant?.TSP_g?.toFixed(1) || 0}g</Text>
              </View>

              <View style={styles.perPlantVerticalItem}>
                <View style={styles.perPlantLeftSection}>
                  <View style={[styles.perPlantBadge, { backgroundColor: "#9C27B0" }]}>
                    <MaterialCommunityIcons name="flask" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.perPlantVerticalName}>MOP</Text>
                </View>
                <Text style={styles.perPlantVerticalValue}>{recommendation?.per_plant?.MOP_g?.toFixed(1) || 0}g</Text>
              </View>

              <View style={styles.perPlantVerticalItem}>
                <View style={styles.perPlantLeftSection}>
                  <View style={[styles.perPlantBadge, { backgroundColor: "#FF9800" }]}>
                    <MaterialCommunityIcons name="sprout" size={14} color="#FFFFFF" />
                  </View>
                  <Text style={styles.perPlantVerticalName}>Compost</Text>
                </View>
                <Text style={styles.perPlantVerticalValue}>{recommendation?.per_plant?.Compost_g?.toFixed(1) || 0}g</Text>
              </View>
            </View>

            <View style={styles.recommendationDivider} />

            <View style={styles.recommendationFooter}>
              <MaterialCommunityIcons name="information-outline" size={18} color="#558B2F" />
              <Text style={styles.recommendationSubtext}>
                Based on your soil analysis (N:{sensorData?.nitrogen || 0}, P:{sensorData?.phosphorus || 0}, K:{sensorData?.potassium || 0})
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Per Perch Recommendations Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: cardAnimations[1],
              transform: [{
                translateY: cardAnimations[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialCommunityIcons name="chart-pie" size={22} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Per Perch Recommendations</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{recommendation?.per_perch?.plants_per_perch || 0} Plants</Text>
            </View>
          </View>

          <View style={styles.costCard}>
            {/* Fertilizer Quantities */}
            <View style={styles.fertilizerRow}>
              <View style={styles.fertilizerItem}>
                <FontAwesome5 name="leaf" size={18} color="#4CAF50" />
                <Text style={styles.fertilizerLabel}>Urea</Text>
                <Text style={styles.fertilizerAmount}>{recommendation?.per_perch?.Urea_kg?.toFixed(1) || 0} kg</Text>
                <Text style={styles.fertilizerPrice}>Rs. {FERTILIZER_PRICES.Urea}/kg</Text>
              </View>

              <View style={styles.fertilizerItem}>
                <FontAwesome5 name="seedling" size={18} color="#2196F3" />
                <Text style={styles.fertilizerLabel}>TSP</Text>
                <Text style={styles.fertilizerAmount}>{recommendation?.per_perch?.TSP_kg?.toFixed(1) || 0} kg</Text>
                <Text style={styles.fertilizerPrice}>Rs. {FERTILIZER_PRICES.TSP}/kg</Text>
              </View>

              <View style={styles.fertilizerItem}>
                <MaterialCommunityIcons name="flask" size={20} color="#9C27B0" />
                <Text style={styles.fertilizerLabel}>MOP</Text>
                <Text style={styles.fertilizerAmount}>{recommendation?.per_perch?.MOP_kg?.toFixed(1) || 0} kg</Text>
                <Text style={styles.fertilizerPrice}>Rs. {FERTILIZER_PRICES.MOP}/kg</Text>
              </View>

              <View style={styles.fertilizerItem}>
                <MaterialCommunityIcons name="sprout" size={20} color="#FF9800" />
                <Text style={styles.fertilizerLabel}>Compost</Text>
                <Text style={styles.fertilizerAmount}>{recommendation?.per_perch?.Compost_kg?.toFixed(1) || 0} kg</Text>
                <Text style={styles.fertilizerPrice}>Rs. {FERTILIZER_PRICES.Compost}/kg</Text>
              </View>
            </View>

            {/* Total Cost */}
            <View style={styles.totalCostSection}>
              <View style={styles.totalCostRow}>
                <Text style={styles.totalCostText}>Estimated Total Cost</Text>
                <Text style={styles.totalCostAmount}>Rs. {calculatePerPerchCost(recommendation?.per_perch).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Pro Tips Section */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: cardAnimations[2],
              transform: [{
                translateY: cardAnimations[2].interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MaterialCommunityIcons name="lightbulb-on" size={22} color="#FF9800" />
              <Text style={styles.sectionTitle}>Pro Tips</Text>
            </View>
          </View>

          <View style={styles.tipsContainer}>
            <View style={styles.tipCard}>
              <LinearGradient
                colors={["#FFF8E1", "#FFECB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipGradient}
              >
                <View style={styles.tipIconContainer}>
                  <MaterialCommunityIcons name="gesture-spread" size={24} color="#F57C00" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Even Distribution</Text>
                  <Text style={styles.tipText}>
                    Apply fertilizer evenly across the field for best results
                  </Text>
                  <Text style={styles.tipTextSinhala}>
                    (පොහොර කෙත පුරා ඒකාකාරව යොදන්න)
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.tipCard}>
              <LinearGradient
                colors={["#E3F2FD", "#BBDEFB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipGradient}
              >
                <View style={[styles.tipIconContainer, { backgroundColor: "rgba(33, 150, 243, 0.15)" }]}>
                  <MaterialCommunityIcons name="water" size={24} color="#1976D2" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Moisture Matters</Text>
                  <Text style={styles.tipText}>
                    Apply when soil is moist for better absorption
                  </Text>
                  <Text style={styles.tipTextSinhala}>
                    (හොඳ අවශෝෂණය සඳහා පසෙහි තෙතමනය ඇති විට යොදන්න)
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.tipCard}>
              <LinearGradient
                colors={["#F3E5F5", "#E1BEE7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tipGradient}
              >
                <View style={[styles.tipIconContainer, { backgroundColor: "rgba(156, 39, 176, 0.15)" }]}>
                  <MaterialCommunityIcons name="clock-time-four" size={24} color="#7B1FA2" />
                </View>
                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>Best Timing</Text>
                  <Text style={styles.tipText}>
                    Early morning or late afternoon is ideal
                  </Text>
                  <Text style={styles.tipTextSinhala}>
                    (උදෑසන හෝ සවස් කාලය වඩාත් සුදුසුයි)
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Spacer */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },
  headerWrapper: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#2E7D32",
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
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
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
    width: 40,
    height: 40,
    borderRadius: 12,
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
  profileButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  profileGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  headerStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.white,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  recommendationCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  recommendationGradient: {
    padding: 20,
    borderRadius: 20,
  },
  recommendationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recommendationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(46, 125, 50, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  recommendationBadge: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recommendationLabel: {
    fontSize: 13,
    color: "#558B2F",
    marginBottom: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recommendationText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
    lineHeight: 28,
  },
  perPlantVerticalList: {
    marginTop: 16,
    gap: 8,
  },
  perPlantVerticalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
  },
  perPlantLeftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  perPlantBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  perPlantVerticalName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E7D32",
  },
  perPlantVerticalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  recommendationDivider: {
    height: 1,
    backgroundColor: "rgba(46, 125, 50, 0.15)",
    marginVertical: 16,
  },
  recommendationFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  recommendationSubtext: {
    fontSize: 13,
    color: "#558B2F",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginLeft: 10,
  },
  sectionBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
  },
  costCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  costItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  costIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  costItemDetails: {
    justifyContent: "center",
  },
  costItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  costItemQuantity: {
    fontSize: 13,
    color: "#757575",
    marginTop: 2,
  },
  costValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    marginTop: 4,
  },
  totalLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2E7D32",
    marginLeft: 10,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  fertilizerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    gap: 8,
  },
  fertilizerItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  fertilizerLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#757575",
    marginTop: 6,
    marginBottom: 2,
  },
  fertilizerAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  fertilizerPrice: {
    fontSize: 10,
    color: "#9E9E9E",
    marginTop: 4,
  },
  totalCostSection: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  totalCostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalCostText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#757575",
  },
  totalCostAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  tipGradient: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  tipIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(245, 124, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: "#424242",
    lineHeight: 19,
  },
  tipTextSinhala: {
    fontSize: 12,
    color: "#757575",
    marginTop: 6,
    fontStyle: "italic",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAF8",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAF8",
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
});
