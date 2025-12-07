import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { colors } from "../styles/colors";
import { commonStyles } from "../styles/commonStyles";

const HomeScreen = () => {
  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cinnamon Vacant Areas</Text>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome!</Text>
          <Text style={styles.cardText}>
            Upload satellite images to detect vacant areas in cinnamon lands.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Use</Text>
          <Text style={styles.cardText}>
            1. Go to Analyze tab{"\n"}
            2. Upload a satellite image{"\n"}
            3. Tap Detect to analyze{"\n"}
            4. View results
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,

    paddingBottom:10,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,

    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: colors.text,
paddingVertical:10,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default HomeScreen;
