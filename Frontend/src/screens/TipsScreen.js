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

export default function FertilizerRecommendationScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fertilizer Recommendation</Text>
        <View style={{ width: 24 }} />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    // padding: 5,
    paddingTop: 25,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
    marginRight: -10,
    paddingTop: 15,
    marginTop: 10,
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
