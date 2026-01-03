import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [isEnglishEnabled, setIsEnglishEnabled] = useState(true);
  const [isSinhalaEnabled, setIsSinhalaEnabled] = useState(false);

  return (
    <View style={styles.container}>
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
                <Text style={styles.greetingText}>User Preferences</Text>
                <Text style={styles.brandText}>App Settings</Text>
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

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Field Profiles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Field Profiles</Text>
          <Text style={styles.sectionSubtitle}>
            ක්ෂේත්‍ර පැතිකඩ / Field Profiles
          </Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Manage Field Profiles</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* NPK Thresholds Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NPK Thresholds</Text>
          <Text style={styles.sectionSubtitle}>
            NPK සීමාවන් / NPK Thresholds
          </Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemText}>Customize NPK Thresholds</Text>
              <Text style={styles.menuItemDescription}>
                Set Nitrogen, Phosphorus, and Potassium levels
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Export Reports Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Reports</Text>
          <Text style={styles.sectionSubtitle}>
            වාර්තා අපනයනය / Export Reports
          </Text>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemWithBorder]}
          >
            <Text style={styles.menuItemText}>Export as PDF</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Export as CSV</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language / භාෂාව</Text>

          <View style={[styles.menuItem, styles.menuItemWithBorder]}>
            <Text style={styles.menuItemText}>English</Text>
            <Switch
              trackColor={{ false: "#d1d1d1", true: "#4a7c3a" }}
              thumbColor={isEnglishEnabled ? "#2e5d1e" : "#f4f3f4"}
              ios_backgroundColor="#d1d1d1"
              onValueChange={setIsEnglishEnabled}
              value={isEnglishEnabled}
            />
          </View>

          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>සිංහල (Sinhala)</Text>
            <Switch
              trackColor={{ false: "#d1d1d1", true: "#4a7c3a" }}
              thumbColor={isSinhalaEnabled ? "#2e5d1e" : "#f4f3f4"}
              ios_backgroundColor="#d1d1d1"
              onValueChange={setIsSinhalaEnabled}
              value={isSinhalaEnabled}
            />
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 20,
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 1,
  },
  menuItemWithBorder: {
    marginBottom: 8,
  },
  menuItemContent: {
    flex: 1,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
  },
  menuItemDescription: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
});
