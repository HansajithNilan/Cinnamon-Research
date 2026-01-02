import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();

  const StepCard = ({ number, title, description, icon }) => (
    <View style={styles.stepCard}>
      <View style={styles.stepIconContainer}>
        <LinearGradient
          colors={[colors.primary, colors.primary]}
          style={styles.stepIconGradient}
        >
          <Ionicons name={icon} size={24} color={colors.white} />
        </LinearGradient>
      </View>
      <View style={styles.stepTextContainer}>
        <Text style={styles.stepNumber}>Step {number}</Text>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{description}</Text>
      </View>
    </View>
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
            {/* Top Bar */}
            <View style={styles.topBar}>
              <View>
                <Text style={styles.greetingText}>Welcome Back,</Text>
                <Text style={styles.brandText}>Cinnamon AI</Text>
              </View>
              <TouchableOpacity style={styles.profileButton}>
                <Ionicons
                  name="person-circle-outline"
                  size={36}
                  color={colors.white}
                />
              </TouchableOpacity>
            </View>

            {/* Hero Card */}
            <View style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Vacant Area Detection</Text>
                <Text style={styles.heroSubtitle}>
                  Optimize your cultivation by analyzing satellite imagery with AI.
                </Text>
                <TouchableOpacity
                  style={styles.heroButton}
                  onPress={() => navigation.navigate("Analyze")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.heroButtonText}>Start Analysis</Text>
                  <Ionicons
                    name="arrow-forward-circle"
                    size={22}
                    color={colors.cinnamonDark}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Steps Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>How It Works</Text>
          <StepCard
            number="01"
            title="Upload Image"
            description="Select a clear satellite image of your land from the gallery."
            icon="cloud-upload-outline"
          />
          <StepCard
            number="02"
            title="AI Processing"
            description="Our advanced system scans the image to identify patterns."
            icon="scan-outline"
          />
          <StepCard
            number="03"
            title="Review Results"
            description="See highlighted vacant spots and potential areas."
            icon="map-outline"
          />
          <StepCard
            number="04"
            title="Take Action"
            description="Plan your planting strategy based on the insights."
            icon="leaf-outline"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
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
    marginBottom: 25,
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
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    alignItems: "center",
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroButtonText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  sectionContainer: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepIconContainer: {
    marginRight: 16,
  },
  stepIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  stepTextContainer: {
    flex: 1,
  },
  stepNumber: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default HomeScreen;
