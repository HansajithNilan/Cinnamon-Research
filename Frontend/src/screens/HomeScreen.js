import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const BANNER_ASPECT_RATIO = 16 / 9;
const BANNER_HEIGHT = width / BANNER_ASPECT_RATIO;

const bannerImages = [
  require("../../assets/image1.png"),
  require("../../assets/image.png"),
  require("../../assets/image3.png"),
  require("../../assets/image4.png"),
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const flatListRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Initial animations
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
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, cardStagger).start();
  }, []);

  // Auto-swap banners
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeBannerIndex < bannerImages.length - 1) {
        flatListRef.current?.scrollToIndex({
          index: activeBannerIndex + 1,
          animated: true,
        });
        setActiveBannerIndex((prev) => prev + 1);
      } else {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
        setActiveBannerIndex(0);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeBannerIndex]);

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== activeBannerIndex) {
      setActiveBannerIndex(roundIndex);
    }
  };

  const features = [
    {
      title: "Vacant Area Detection",
      subtitle: "AI-Powered Analysis",
      icon: "map-outline",
      iconType: "ionicon",
      gradient: ["#43A047", "#66BB6A"],
      shadowColor: "#43A047",
      onPress: () => navigation.navigate("vacantAreaHome"),
    },
    {
      title: "Soil Fertilizing",
      subtitle: "Smart Recommendations",
      icon: "flask-outline",
      iconType: "ionicon",
      gradient: ["#FB8C00", "#FFA726"],
      shadowColor: "#FB8C00",
      onPress: () => navigation.navigate("SoilDashboard"),
    },
    {
      title: "Fungal Detection",
      subtitle: "Disease Identification",
      icon: "bug-outline",
      iconType: "ionicon",
      gradient: ["#E53935", "#EF5350"],
      shadowColor: "#E53935",
      onPress: () => navigation.navigate("Image"),
    },
    {
      title: "Quality Detection",
      subtitle: "Warehouse Analysis",
      icon: "cube-outline",
      iconType: "ionicon",
      gradient: ["#1E88E5", "#42A5F5"],
      shadowColor: "#1E88E5",
      onPress: () => navigation.navigate("Dashboard"),
    },
  ];

  // Enhanced Feature Card Component
  const FeatureCard = ({ feature, index }) => (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: cardAnimations[index],
          transform: [
            {
              scale: cardAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
            {
              translateY: cardAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.cardContainer, { shadowColor: feature.shadowColor }]}
        onPress={feature.onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={feature.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardIconContainer}>
            <Ionicons name={feature.icon} size={28} color={colors.white} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
          </View>
          <View style={styles.cardArrow}>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            
            <View style={styles.topBar}>
              <View style={styles.welcomeContainer}>
                <Text style={styles.greetingText}>Welcome Back,</Text>
                <Text style={styles.brandText}>Cinnamon AI</Text>
                <View style={styles.taglineContainer}>
                  <MaterialCommunityIcons name="leaf" size={14} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.taglineText}>Smart Agriculture Solutions</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate("Profile")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.15)"]}
                  style={styles.profileGradient}
                >
                  <Ionicons
                    name="person"
                    size={24}
                    color={colors.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: "rgba(76, 175, 80, 0.3)" }]}>
                  <Ionicons name="checkmark-circle" size={18} color="#A5D6A7" />
                </View>
                <View>
                  <Text style={styles.statValue}>4</Text>
                  <Text style={styles.statLabel}>Features</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: "rgba(255, 193, 7, 0.3)" }]}>
                  <Ionicons name="analytics" size={18} color="#FFE082" />
                </View>
                <View>
                  <Text style={styles.statValue}>AI</Text>
                  <Text style={styles.statLabel}>Powered</Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIconBg, { backgroundColor: "rgba(33, 150, 243, 0.3)" }]}>
                  <Ionicons name="shield-checkmark" size={18} color="#90CAF9" />
                </View>
                <View>
                  <Text style={styles.statValue}>100%</Text>
                  <Text style={styles.statLabel}>Secure</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Banner Section */}
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.bannerWrapper}>
            <FlatList
              ref={flatListRef}
              data={bannerImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.bannerImageWrapper}>
                  <Image source={item} style={styles.bannerImage} resizeMode="cover" />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.3)"]}
                    style={styles.bannerOverlay}
                  />
                </View>
              )}
              onMomentumScrollEnd={onScroll}
            />
            {/* Enhanced Pagination */}
            <View style={styles.pagination}>
              <View style={styles.paginationInner}>
                {bannerImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === activeBannerIndex ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Introduction Section */}
        <View style={styles.introSection}>
          <View style={styles.sectionHeaderContainer}>
            <View style={styles.sectionIconContainer}>
              <MaterialCommunityIcons name="information" size={20} color="#2E7D32" />
            </View>
            <Text style={styles.sectionHeader}>About Ceylon Cinnamon</Text>
          </View>
          <TouchableOpacity style={styles.introCard} activeOpacity={0.95}>
            <Image
              source={require("../../assets/image.png")}
              style={styles.introImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.introImageOverlay}
            >
              <View style={styles.introBadge}>
                <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                <Text style={styles.introBadgeText}>Premium Quality</Text>
              </View>
            </LinearGradient>
            <View style={styles.introContent}>
              <Text style={styles.introTitle}>True Gold of Nature</Text>
              <Text style={styles.introText}>
                Experience the premium quality of authentic Ceylon Cinnamon.
                Renowned for its exquisite aroma and health benefits, it is the
                finest spice in the world, cultivated with care in Sri Lanka.
              </Text>
              <View style={styles.learnMoreContainer}>
                <Text style={styles.learnMoreText}>Learn More</Text>
                <Ionicons name="arrow-forward" size={16} color="#2E7D32" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Enhanced Dashboard Grid Section */}
        <View style={styles.gridContainer}>
          <View style={styles.sectionHeaderContainer}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#E3F2FD" }]}>
              <MaterialCommunityIcons name="view-dashboard" size={20} color="#1E88E5" />
            </View>
            <Text style={styles.sectionHeader}>Smart Dashboard</Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.sectionHeaderContainer}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#FFF3E0" }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FB8C00" />
            </View>
            <Text style={styles.sectionHeader}>Quick Actions</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.9}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="scan" size={22} color="#2E7D32" />
                </View>
                <Text style={styles.quickActionText}>Quick Scan</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.9}>
              <LinearGradient
                colors={["#E3F2FD", "#BBDEFB"]}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="stats-chart" size={22} color="#1E88E5" />
                </View>
                <Text style={styles.quickActionText}>Reports</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.9}>
              <LinearGradient
                colors={["#FFF3E0", "#FFE0B2"]}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="help-circle" size={22} color="#FB8C00" />
                </View>
                <Text style={styles.quickActionText}>Help</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.9}>
              <LinearGradient
                colors={["#FCE4EC", "#F8BBD9"]}
                style={styles.quickActionGradient}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="chatbubbles" size={22} color="#E91E63" />
                </View>
                <Text style={styles.quickActionText}>Support</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: 20,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  decorativeCircle3: {
    position: "absolute",
    top: 60,
    right: width * 0.3,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  welcomeContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  brandText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  taglineText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginLeft: 6,
    fontWeight: "500",
  },
  profileButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  profileGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 14,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  // Banner Styles
  bannerContainer: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  bannerWrapper: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerImageWrapper: {
    position: "relative",
  },
  bannerImage: {
    width: width - 40,
    height: BANNER_HEIGHT * 0.85,
    borderRadius: 24,
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  pagination: {
    position: "absolute",
    bottom: 16,
    width: "100%",
    alignItems: "center",
  },
  paginationInner: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.white,
    width: 24,
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },

  // Section Header
  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: 0.3,
  },

  // Intro Section
  introSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  introCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  introImage: {
    width: "100%",
    height: 180,
  },
  introImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: 16,
  },
  introBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  introBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1A1A1A",
    marginLeft: 4,
  },
  introContent: {
    padding: 18,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  introText: {
    fontSize: 14,
    color: "#616161",
    lineHeight: 22,
    marginBottom: 14,
  },
  learnMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
    marginRight: 6,
  },

  // Grid Styles
  gridContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: {
    width: (width - 52) / 2,
    marginBottom: 14,
  },
  cardContainer: {
    borderRadius: 20,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  cardGradient: {
    padding: 18,
    minHeight: 140,
  },
  cardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  cardArrow: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Quick Actions
  quickActionsContainer: {
    paddingLeft: 20,
    marginBottom: 10,
  },
  quickActionsScroll: {
    paddingRight: 20,
  },
  quickActionCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  quickActionGradient: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#424242",
  },
});

export default HomeScreen;
