import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";

const PreventionGuideScreen = ({ navigation }) => {
  const [expandedSections, setExpandedSections] = useState({
    immediateActions: true,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNewScan = () => {
    navigation.navigate("Image");
  };

  const sections = [
    {
      id: "immediateActions",
      icon: "flash",
      iconColor: "#EF4444",
      title: "Immediate Actions (24 Hours)",
      priority: "Critical",
      items: [
        {
          title: "Isolate Infected Seedlings",
          description:
            "Immediately separate affected seedlings from healthy ones to prevent leaf-to-leaf transmission in nursery.",
        },
        {
          title: "Remove Infected Leaves",
          description:
            "Carefully prune and dispose of all infected leaves. Use sterilized tools and burn or bag removed material.",
        },
        {
          title: "Apply Fungicide Treatment",
          description:
            "Apply copper-based fungicide (Bordeaux mixture) or mancozeb within 24 hours. Spray early morning or late evening.",
        },
        {
          title: "Increase Air Circulation",
          description:
            "Space out seedlings to improve airflow. Remove any barriers blocking natural ventilation in nursery area.",
        },
      ],
    },
    {
      id: "shortTerm",
      icon: "calendar",
      iconColor: "#F59E0B",
      title: "Short-Term Management (1-7 Days)",
      priority: "High",
      items: [
        {
          title: "Daily Monitoring",
          description:
            "Inspect all seedlings daily for new infection spots. Check for yellowing, brown spots, or wilting leaves.",
        },
        {
          title: "Adjust Watering Schedule",
          description:
            "Water only at base in early morning. Avoid overhead watering. Allow soil surface to dry between waterings.",
        },
        {
          title: "Second Fungicide Application",
          description:
            "Apply second treatment 5-7 days after first application. Rotate fungicide types to prevent resistance.",
        },
        {
          title: "Tool Sanitization",
          description:
            "Disinfect all pruning tools with 70% alcohol or 10% bleach solution after each use on infected plants.",
        },
      ],
    },
    {
      id: "nurseryPractices",
      icon: "leaf",
      iconColor: "#7A9B5C",
      title: "Nursery Best Practices",
      priority: "Essential",
      items: [
        {
          title: "Optimal Seedling Spacing",
          description:
            "Maintain 15-20cm spacing between seedlings to ensure good air circulation and reduce humidity.",
        },
        {
          title: "Shade Management",
          description:
            "Provide 50-70% shade for young seedlings using shade nets. Gradually increase light exposure as they mature.",
        },
        {
          title: "Soil Sterilization",
          description:
            "Use sterilized potting mix. Solarize soil before planting or treat with appropriate fungicides.",
        },
        {
          title: "Drainage System",
          description:
            "Ensure proper drainage in pots and nursery beds. Elevate containers to prevent waterlogging.",
        },
      ],
    },
    {
      id: "prevention",
      icon: "shield-checkmark",
      iconColor: "#10B981",
      title: "Long-Term Prevention",
      priority: "Ongoing",
      items: [
        {
          title: "Resistant Varieties",
          description:
            "Select disease-resistant cinnamon varieties when available. Consult local agricultural extension services.",
        },
        {
          title: "Nutrient Management",
          description:
            "Apply balanced fertilizer (NPK 10:10:10) monthly. Avoid excessive nitrogen which promotes soft, susceptible growth.",
        },
        {
          title: "Sanitation Protocol",
          description:
            "Remove fallen leaves daily. Keep nursery area clean and weed-free to reduce disease reservoirs.",
        },
        {
          title: "Regular Inspections",
          description:
            "Conduct weekly systematic inspections. Use this app to scan suspicious leaves for early detection.",
        },
      ],
    },
    {
      id: "environmental",
      icon: "partly-sunny",
      iconColor: "#3B82F6",
      title: "Environmental Control",
      priority: "Important",
      items: [
        {
          title: "Humidity Management",
          description:
            "Maintain 60-70% humidity. Use fans or natural ventilation during high humidity periods to reduce fungal growth.",
        },
        {
          title: "Temperature Monitoring",
          description:
            "Optimal range: 25-30°C. Protect seedlings from temperature extremes which stress plants.",
        },
        {
          title: "Seasonal Adjustments",
          description:
            "Increase monitoring during rainy season. Apply preventive fungicide sprays before monsoon period.",
        },
        {
          title: "Mulching Practices",
          description:
            "Use organic mulch to maintain soil moisture, but keep away from stem base to prevent rot.",
        },
      ],
    },
    {
      id: "treatment",
      icon: "medical",
      iconColor: "#8B5CF6",
      title: "Treatment Options",
      priority: "Reference",
      items: [
        {
          title: "Copper-Based Fungicides",
          description:
            "Bordeaux mixture (1% solution). Apply as protective spray. Effective for early-stage infections.",
        },
        {
          title: "Mancozeb Treatment",
          description:
            "Contact fungicide, 2g per liter. Spray every 7-10 days during high disease pressure periods.",
        },
        {
          title: "Biological Controls",
          description:
            "Trichoderma viride or Bacillus subtilis can be applied as soil drench or foliar spray for organic management.",
        },
        {
          title: "Neem-Based Solutions",
          description:
            "Neem oil (5ml per liter) as organic alternative. Provides moderate protection with low environmental impact.",
        },
      ],
    },
  ];

  const filteredSections = sections.filter((section) =>
    searchQuery === ""
      ? true
      : section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.items.some(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "#EF4444";
      case "High":
        return "#F59E0B";
      case "Essential":
        return "#7A9B5C";
      case "Ongoing":
        return "#10B981";
      case "Important":
        return "#3B82F6";
      default:
        return "#666";
    }
  };

  return (
    <View style={styles.container}>
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
                <Text style={styles.greetingText}>Disease Prevention</Text>
                <Text style={styles.brandText}>Guide & Tips</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#7A9B5C"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search prevention methods..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Introduction Banner */}
        <View style={styles.introBanner}>
          <View style={styles.introBannerIcon}>
            <Ionicons name="shield-checkmark" size={32} color="#1B9568" />
          </View>
          <View style={styles.introBannerContent}>
            <Text style={styles.introBannerTitle}>
              Comprehensive Fungal Prevention
            </Text>
            <Text style={styles.introBannerText}>
              Follow these evidence-based practices to protect your cinnamon
              seedlings from fungal diseases during the critical nursery phase.
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Best Practices</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Prevention Focus</Text>
          </View>
        </View>

        {/* Sections */}
        {filteredSections.map((section) => (
          <View key={section.id} style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => toggleSection(section.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardTitleContainer}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${section.iconColor}15` },
                  ]}
                >
                  <Ionicons
                    name={section.icon}
                    size={20}
                    color={section.iconColor}
                  />
                </View>
                <View style={styles.titleGroup}>
                  <Text style={styles.cardTitle}>{section.title}</Text>
                  <View style={styles.priorityBadge}>
                    <View
                      style={[
                        styles.priorityDot,
                        {
                          backgroundColor: getPriorityColor(section.priority),
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(section.priority) },
                      ]}
                    >
                      {section.priority}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons
                name={
                  expandedSections[section.id] ? "chevron-up" : "chevron-down"
                }
                size={24}
                color="#666"
              />
            </TouchableOpacity>

            {expandedSections[section.id] && (
              <View style={styles.cardContent}>
                {section.items.map((item, index) => (
                  <View key={index} style={styles.guideItem}>
                    <View style={styles.guideItemHeader}>
                      <View style={styles.guideItemNumber}>
                        <Text style={styles.guideItemNumberText}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={styles.guideItemTitle}>{item.title}</Text>
                    </View>
                    <Text style={styles.guideItemDescription}>
                      {item.description}
                    </Text>
                    {index < section.items.length - 1 && (
                      <View style={styles.itemDivider} />
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* Emergency Contact Card */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="call" size={24} color="#EF4444" />
            <Text style={styles.emergencyTitle}>Need Expert Help?</Text>
          </View>
          <Text style={styles.emergencyText}>
            For severe infections or uncertain diagnoses, contact your local
            agricultural extension officer or plant pathologist.
          </Text>
          <TouchableOpacity style={styles.emergencyButton}>
            <Ionicons name="call-outline" size={18} color="#EF4444" />
            <Text style={styles.emergencyButtonText}>
              Contact Extension Service
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleNewScan}
          activeOpacity={0.8}
        >
          <Ionicons name="scan" size={22} color="#FFF" />
          <Text style={styles.scanButtonText}>Scan Another Leaf</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  introBanner: {
    flexDirection: "row",
    backgroundColor: "#D1FAE5",
    padding: 20,
    borderRadius: 14,
    marginBottom: 22,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  introBannerIcon: {
    marginRight: 16,
  },
  introBannerContent: {
    flex: 1,
  },
  introBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  introBannerText: {
    fontSize: 14,
    color: "#065F46",
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  statBox: {
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
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  titleGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  guideItem: {
    marginBottom: 16,
  },
  guideItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  guideItemNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  guideItemNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
  },
  guideItemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  guideItemDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    paddingLeft: 40,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginTop: 14,
  },
  emergencyCard: {
    backgroundColor: "#FEE2E2",
    padding: 20,
    borderRadius: 14,
    marginBottom: 22,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#991B1B",
  },
  emergencyText: {
    fontSize: 14,
    color: "#7F1D1D",
    lineHeight: 22,
    marginBottom: 16,
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  scanButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default PreventionGuideScreen;
