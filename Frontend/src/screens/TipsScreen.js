import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors } from "../styles/colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function FertilizerRecommendationScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Header */}
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
                <Ionicons name="arrow-back" size={24} color={colors.white} />
              </TouchableOpacity>
              <View>
                <Text style={styles.greetingText}>Tips & Guide</Text>
                <Text style={styles.brandText}>Fertilizer Plans</Text>
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

      {/* Scrollable Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recommendation Card */}
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationLabel}>Recommendation</Text>
          <Text style={styles.recommendationText}>
            Apply 25 kg Urea + 10 kg ERP per acre
          </Text>
          <Text style={styles.recommendationSubtext}>
            This recommendation is based on your soil analysis and crop
            requirements.
          </Text>
        </View>

        {/* Cost Breakdown Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>

          <View style={styles.costCard}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Urea (25 kg)</Text>
              <Text style={styles.costValue}>Rs. 1,250</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.costRow}>
              <Text style={styles.costLabel}>ERP (10 kg)</Text>
              <Text style={styles.costValue}>Rs. 800</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.costRow}>
              <Text style={styles.totalLabel}>Total Cost</Text>
              <Text style={styles.totalValue}>Rs. 2,050</Text>
            </View>
          </View>
        </View>

        {/* Hint Box */}
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>
            <Text style={styles.hintBold}>Hint:</Text> Apply fertilizer evenly
            across the field.
          </Text>
          <Text style={styles.hintTextSinhala}>
            (ඉඟිය: පොහොර කෙත පුරා ඒකාකාරව යොදන්න.)
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm Recommendation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recommendationCard: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  recommendationLabel: {
    fontSize: 14,
    color: "#2e7d32",
    marginBottom: 8,
    fontWeight: "600",
  },
  recommendationText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  recommendationSubtext: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  costCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  costLabel: {
    fontSize: 15,
    color: "#000",
  },
  costValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  hintBox: {
    backgroundColor: "#d9ebe0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
  },
  hintText: {
    fontSize: 13,
    color: "#000",
    marginBottom: 4,
  },
  hintBold: {
    fontWeight: "bold",
  },
  hintTextSinhala: {
    fontSize: 12,
    color: "#666",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  confirmButton: {
    backgroundColor: "#2e5d1e",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
