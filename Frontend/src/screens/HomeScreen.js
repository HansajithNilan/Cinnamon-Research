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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
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
    }, 4000); // Swap every 4 seconds

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

  // Reusable Feature Card Component
  const FeatureCard = ({ title, icon, onPress, color }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={32} color={colors.white} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.arrowContainer}>
        <Ionicons
          name="arrow-forward"
          size={20}
          color={colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={[colors.primary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.topBar}>
              <View>
                <Text style={styles.greetingText}>Welcome Back,</Text>
                <Text style={styles.brandText}>Cinnamon AI</Text>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate("Profile")}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={40}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={flatListRef}
            data={bannerImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={item} style={styles.bannerImage} resizeMode="cover" />
            )}
            onMomentumScrollEnd={onScroll}
          />
          {/* Pagination Dots */}
          <View style={styles.pagination}>
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

        {/* Introduction Section */}
        <View style={styles.introSection}>
          <Text style={styles.sectionHeader}>About Ceylon Cinnamon</Text>
          <View style={styles.introCard}>
            <Image
              source={require("../../assets/image.png")}
              style={styles.introImage}
              resizeMode="cover"
            />
            <View style={styles.introContent}>
              <Text style={styles.introTitle}>True Gold of Nature</Text>
              <Text style={styles.introText}>
                Experience the premium quality of authentic Ceylon Cinnamon.
                Renowned for its exquisite aroma and health benefits, it is the
                finest spice in the world, cultivated with care in Sri Lanka.
              </Text>
            </View>
          </View>
        </View>

        {/* Dashboard Grid Section */}
        <View style={styles.gridContainer}>
          <Text style={styles.sectionHeader}>Smart Dashboard</Text>

          <View style={styles.row}>
            {/* 1. Vacant Area */}
            <FeatureCard
              title="Vacant Area Detection"
              icon="map-outline"
              color="#4CAF50" // Green shade
              onPress={() => {
                navigation.navigate("vacantAreaHome");
              }}
            />

            {/* 2. Soil Fertilizing Recommend */}
            <FeatureCard
              title="Soil Fertilizing"
              icon="flask-outline"
              color="#FF9800" // Orange shade
              onPress={() => navigation.navigate("SoilDashboard")}
            />
          </View>

          <View style={styles.row}>
            {/* 3. Fungal Detect */}
            <FeatureCard
              title="Fungal Detect"
              icon="bug-outline" // or warning-outline
              color="#F44336" // Red shade
              onPress={() => navigation.navigate("Image")}
            />

            {/* 4. Warehouse Quality Detection */}
            <FeatureCard
              title="Quality Detection"
              icon="cube-outline"
              color="#2196F3" // Blue shade
              onPress={() => navigation.navigate("Dashboard")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerWrapper: {
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  brandText: {
    fontSize: 26,
    color: colors.white,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  profileButton: {
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 30,
  },

  // Banner Styles
  bannerContainer: {
    height: BANNER_HEIGHT,
    marginBottom: 25,
    position: "relative",
  },
  bannerImage: {
    width: width,
    height: BANNER_HEIGHT,
  },
  pagination: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.white,
    width: 20,
  },
  inactiveDot: {
    // default style
  },

  // Intro Section
  introSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  introCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  introImage: {
    width: "100%",
    height: 180,
  },
  introContent: {
    padding: 16,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: colors.textSecondary || "#666",
    lineHeight: 22,
  },

  // Grid Styles
  gridContainer: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 15,
    paddingLeft: 4,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cardContainer: {
    width: (width - 55) / 2,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 150,
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 20,
  },
  arrowContainer: {
    width: "100%",
    alignItems: "flex-end",
  },
});

export default HomeScreen;
