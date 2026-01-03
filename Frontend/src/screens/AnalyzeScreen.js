import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";

const { width } = Dimensions.get("window");

const AnalyzeScreen = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showVacantFilling, setShowVacantFilling] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [detectionResults, setDetectionResults] = useState({
    vacantAreaCount: "04",
    landVacantAreaSize: "04",
  });
  const [vacantFillingData, setVacantFillingData] = useState({
    vacantAreaMeasurement: "150",
    fillingPlantCount: "75",
    yieldForecasting: "225",
  });

  // History data
  const [historyData, setHistoryData] = useState([
    {
      id: "1",
      date: "2023-10-27",
      image: null,
      vacantArea: "1.2",
      plantCount: "300",
      estimatedCost: "$1500",
    },
    {
      id: "2",
      date: "2023-10-25",
      image: null,
      vacantArea: "0.8",
      plantCount: "200",
      estimatedCost: "$1000",
    },
  ]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access gallery is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setShowResults(false);
      setShowVacantFilling(false);
      setShowHistory(false);
    }
  };

  const handleDetect = () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please select an image first");
      return;
    }

    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      setShowResults(true);
    }, 2000);
  };

  const handleVacantFilling = () => {
    setShowVacantFilling(true);
    setShowResults(false);
  };

  const handleBackToUpload = () => {
    setShowResults(false);
    setShowVacantFilling(false);
    setShowHistory(false);
    setSelectedImage(null);
  };

  const handleBackToResults = () => {
    setShowVacantFilling(false);
    setShowResults(true);
  };

  const handleConfirm = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      image: selectedImage,
      vacantArea: (
        parseFloat(vacantFillingData.vacantAreaMeasurement) / 4046.86
      ).toFixed(1),
      plantCount: vacantFillingData.fillingPlantCount,
      estimatedCost: `$${(
        parseFloat(vacantFillingData.fillingPlantCount) * 5
      ).toFixed(0)}`,
    };

    setHistoryData([newEntry, ...historyData]);

    // Show history screen
    setShowVacantFilling(false);
    setShowResults(false);
    setShowHistory(true);
  };

  const Header = ({ title, showBack, onBack }) => (
    <View style={styles.headerWrapper}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          {showBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, showBack && { marginLeft: 8 }]}>
            {title}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyCard}>
      <Image
        source={
          item.image
            ? { uri: item.image }
            : require("../assets/placeholder.jpg")
        }
        style={styles.historyImage}
      />
      <View style={styles.historyDetails}>
        <View style={styles.historyDateRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
          <Text style={styles.historyDate}>{item.date}</Text>
        </View>

        <View style={styles.historyStatsRow}>
          <View style={styles.historyStat}>
            <Text style={styles.historyStatLabel}>Area</Text>
            <Text style={styles.historyStatValue}>{item.vacantArea} Ac</Text>
          </View>
          <View style={styles.historyDivider} />
          <View style={styles.historyStat}>
            <Text style={styles.historyStatLabel}>Plants</Text>
            <Text style={styles.historyStatValue}>{item.plantCount}</Text>
          </View>
          <View style={styles.historyDivider} />
          <View style={styles.historyStat}>
            <Text style={styles.historyStatLabel}>Cost</Text>
            <Text style={styles.historyStatValue}>{item.estimatedCost}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // History Screen
  if (showHistory) {
    return (
      <View style={styles.container}>
        <Header
          title="Analysis History"
          showBack={true}
          onBack={handleBackToUpload}
        />
        <FlatList
          data={historyData}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.listHeader}>Recent Analyses</Text>
          }
          ListFooterComponent={
            <TouchableOpacity style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }

  // Vacant Filling Details Screen
  if (showVacantFilling) {
    return (
      <View style={styles.container}>
        <Header
          title="Vacant Filling"
          showBack={true}
          onBack={handleBackToResults}
        />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Metrics Card */}
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="stats-chart" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Filling Metrics</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Vacant Area</Text>
              <Text style={styles.metricValue}>
                {vacantFillingData.vacantAreaMeasurement} <Text style={styles.unit}>sq.m</Text>
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Required Plants</Text>
              <Text style={styles.metricValue}>
                {vacantFillingData.fillingPlantCount}
              </Text>
            </View>

            <View style={[styles.metricRow, styles.lastMetricRow]}>
              <Text style={styles.metricLabel}>Yield Forecast</Text>
              <Text style={styles.metricValue}>
                {vacantFillingData.yieldForecasting} <Text style={styles.unit}>kg</Text>
              </Text>
            </View>
          </View>

          {/* Graph Card */}
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="trending-up" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Growth Projection</Text>
            </View>
            <View style={styles.graphPlaceholder}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.borderDashed} />
              <Text style={styles.graphPlaceholderText}>Growth Chart Visualization</Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleConfirm}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Text style={styles.mainButtonText}>Save & Confirm Analysis</Text>
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Results Screen
  if (showResults && selectedImage) {
    return (
      <View style={styles.container}>
        <Header
          title="Detection Results"
          showBack={true}
          onBack={handleBackToUpload}
        />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Result Card */}
          <View style={styles.cardNoPadding}>
            <Image source={{ uri: selectedImage }} style={styles.resultImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>Analyzed Image</Text>
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.cardTitle}>Analysis Summary</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{detectionResults.vacantAreaCount}</Text>
                <Text style={styles.statLabel}>Vacant Spots</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{detectionResults.landVacantAreaSize}</Text>
                <Text style={styles.statLabel}>Total Size</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.textButton}>
              <Text style={styles.textButtonLabel}>View Detailed Report</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Action Section */}
          <View style={styles.actionSection}>
            <Text style={styles.instructionText}>
              Ready to optimize this area?
            </Text>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleVacantFilling}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.buttonGradient}
              >
                <Text style={styles.mainButtonText}>Calculate Vacant Filling</Text>
                <Ionicons name="calculator-outline" size={24} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Upload Screen (Default)
  return (
    <View style={styles.container}>
      <Header title="New Analysis" showBack={false} />

      <ScrollView
        contentContainerStyle={styles.centerContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.iconCircle}>
                  <Ionicons name="cloud-upload" size={40} color={colors.primary} />
                </View>
                <Text style={styles.uploadTitle}>Upload Satellite Image</Text>
                <Text style={styles.uploadSubtitle}>
                  Tap here to select an image from your gallery
                </Text>
              </View>
            )}

            {selectedImage && (
              <View style={styles.changeImageOverlay}>
                <Ionicons name="camera-reverse" size={24} color={colors.white} />
                <Text style={styles.changeImageText}>Change Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.mainButton, !selectedImage && styles.disabledButton]}
          onPress={handleDetect}
          disabled={!selectedImage || isDetecting}
        >
          <LinearGradient
            colors={selectedImage ? [colors.primary, colors.primaryDark] : [colors.border, colors.border]}
            style={styles.buttonGradient}
          >
            {isDetecting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.mainButtonText}>Start Detection</Text>
                <Ionicons name="scan" size={24} color={colors.white} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Ionicons name="bulb-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Ensure the image is clear and well-lit for best results.
          </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  centerContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  // Header Styles
  headerWrapper: {
    marginBottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: colors.primary, // Fallback
  },
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
    marginLeft: -8,
  },

  // Card Styles
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardNoPadding: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  // Upload Styles
  uploadContainer: {
    marginBottom: 30,
  },
  uploadBox: {
    backgroundColor: colors.white,
    borderRadius: 24,
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primary, // Changed to primary based on request
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(76, 175, 80, 0.1)", // Light primary
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  changeImageText: {
    color: colors.white,
    fontWeight: '600',
  },

  // Button Styles
  mainButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    shadowOpacity: 0,
    opacity: 0.8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  mainButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
  },
  textButtonLabel: {
    color: colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },

  // Info/Misc Styles
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  // Results Styles
  resultImage: {
    width: "100%",
    height: 250,
  },
  imageOverlay: {
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  imageOverlayText: {
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  actionSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },

  // Vacant Filling Styles
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lastMetricRow: {
    borderBottomWidth: 0,
  },
  metricLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  unit: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: 'normal',
  },
  graphPlaceholder: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderStyle: 'dashed',
  },
  graphPlaceholderText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },

  // History Styles
  listHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  historyList: {
    padding: 20,
    paddingBottom: 40,
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  historyImage: {
    width: 100,
    height: "100%",
    backgroundColor: "#F0F0F0",
  },
  historyDetails: {
    flex: 1,
    padding: 12,
  },
  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  historyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyStat: {
    alignItems: 'center',
  },
  historyDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#EEEEEE',
  },
  historyStatLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  historyStatValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  loadMoreButton: {
    padding: 15,
    alignItems: "center",
  },
  loadMoreText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});

export default AnalyzeScreen;
