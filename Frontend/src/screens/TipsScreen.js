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
import { colors } from "../styles/colors";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function FertilizerRecommendationScreen() {
  const navigation = useNavigation();
  
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

  const fertilizerItems = [
    { name: "Urea", quantity: "25 kg", price: "Rs. 1,250", icon: "leaf" },
    { name: "ERP", quantity: "10 kg", price: "Rs. 800", icon: "seedling" },
  ];

  const totalCost = "Rs. 2,050";

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
          colors={["#2E7D32", "#4CAF50", "#66BB6A"]}
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
            <TouchableOpacity style={styles.profileButton} activeOpacity={0.8}>
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                style={styles.profileGradient}
              >
                <Ionicons name="notifications-outline" size={22} color={colors.white} />
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
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>1 Acre</Text>
              <Text style={styles.statLabel}>Field Size</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statValue}>Season 1</Text>
              <Text style={styles.statLabel}>Application</Text>
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
        {/* Main Recommendation Card */}
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
                <MaterialCommunityIcons name="check-decagram" size={28} color="#2E7D32" />
              </View>
              <View style={styles.recommendationBadge}>
                <Text style={styles.badgeText}>AI Recommended</Text>
              </View>
            </View>
            
            <Text style={styles.recommendationLabel}>Optimal Fertilizer Mix</Text>
            <Text style={styles.recommendationText}>
              Apply 25 kg Urea + 10 kg ERP per acre
            </Text>
            
            <View style={styles.recommendationDivider} />
            
            <View style={styles.recommendationFooter}>
              <MaterialCommunityIcons name="information-outline" size={18} color="#558B2F" />
              <Text style={styles.recommendationSubtext}>
                Based on your soil analysis and crop requirements
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Cost Breakdown Section */}
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
              <Text style={styles.sectionTitle}>Cost Breakdown</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>2 Items</Text>
            </View>
          </View>

          <View style={styles.costCard}>
            {fertilizerItems.map((item, index) => (
              <View key={index}>
                <View style={styles.costRow}>
                  <View style={styles.costItemLeft}>
                    <View style={styles.costIconContainer}>
                      <FontAwesome5 name={item.icon} size={16} color="#4CAF50" />
                    </View>
                    <View style={styles.costItemDetails}>
                      <Text style={styles.costItemName}>{item.name}</Text>
                      <Text style={styles.costItemQuantity}>{item.quantity}</Text>
                    </View>
                  </View>
                  <Text style={styles.costValue}>{item.price}</Text>
                </View>
                {index < fertilizerItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}

            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.totalRow}
            >
              <View style={styles.totalLeft}>
                <MaterialCommunityIcons name="calculator-variant" size={20} color="#2E7D32" />
                <Text style={styles.totalLabel}>Total Investment</Text>
              </View>
              <Text style={styles.totalValue}>{totalCost}</Text>
            </LinearGradient>
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

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} activeOpacity={0.9}>
          <LinearGradient
            colors={["#2E7D32", "#388E3C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <MaterialCommunityIcons name="check-circle" size={22} color={colors.white} />
            <Text style={styles.confirmButtonText}>Confirm Recommendation</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    width: 48,
    height: 48,
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
});
