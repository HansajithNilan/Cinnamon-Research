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
import { colors } from "../styles/colors";

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
        <Text style={styles.historyDate}>Date: {item.date}</Text>
        <Text style={styles.historyText}>
          <Text style={styles.historyLabel}>Vacant Area:</Text>{" "}
          {item.vacantArea} Acres
        </Text>
        <Text style={styles.historyText}>
          <Text style={styles.historyLabel}>Plant Count:</Text>{" "}
          {item.plantCount}
        </Text>
        <Text style={styles.historyText}>
          <Text style={styles.historyLabel}>Estimated Cost:</Text>{" "}
          {item.estimatedCost}
        </Text>
      </View>
    </View>
  );

  // History Screen
  if (showHistory) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToUpload}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Uploaded Land Details</Text>
        </View>

        <FlatList
          data={historyData}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToResults}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vacant Filling Details</Text>
        </View>

        <ScrollView style={styles.vacantFillingContainer}>
          {/* Metrics Card */}
          <View style={styles.metricsCard}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Vacant Area Measurement</Text>
              <Text style={styles.metricValue}>
                {vacantFillingData.vacantAreaMeasurement} sq.m
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Filling Plant Count</Text>
              <Text style={styles.metricValue}>
                {vacantFillingData.fillingPlantCount}
              </Text>
            </View>

            <View style={[styles.metricRow, styles.lastMetricRow]}>
              <Text style={styles.metricLabel}>Yield Forecasting</Text>
              <Text style={styles.metricValue}>
                {vacantFillingData.yieldForecasting} kg
              </Text>
            </View>

            <View style={[styles.metricRow, styles.lastMetricRow]}>
              <Text style={styles.metricLabel}>
                After Filling Process yield forecasting count
              </Text>
              <Text style={styles.metricValue}>XX</Text>
            </View>
          </View>

          {/* Graph Card */}
          <View style={styles.graphCard}>
            <View style={styles.graphPlaceholder}>
              <Text style={styles.graphPlaceholderText}>graph</Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Results Screen
  if (showResults && selectedImage) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToUpload}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vacant Area Detection</Text>
        </View>

        <ScrollView style={styles.resultsContainer}>
          {/* Image Result Card */}
          <View style={styles.imageResultCard}>
            <Image source={{ uri: selectedImage }} style={styles.resultImage} />
            <Text style={styles.imageDescription}>Vacant Areas</Text>
          </View>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Vacant Area Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vacant Area Count</Text>
              <Text style={styles.detailValue}>
                {detectionResults.vacantAreaCount}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Land Vacant Area Size</Text>
              <Text style={styles.detailValue}>
                {detectionResults.landVacantAreaSize}
              </Text>
            </View>

            <TouchableOpacity style={styles.addDetailsButton}>
              <Text style={styles.addDetailsText}>See more...</Text>
            </TouchableOpacity>
          </View>

          {/* Instruction Text */}
          <Text style={styles.instructionText}>
            If you want to fill vacant area please click below button
          </Text>

          {/* Vacant Filling Button */}
          <TouchableOpacity
            style={styles.vacantFillingButton}
            onPress={handleVacantFilling}
          >
            <Text style={styles.vacantFillingText}>Vacant Filling</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Upload Screen (Default)
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Land Image Upload</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Upload Box */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={pickImage}
          activeOpacity={0.7}
        >
          <View style={styles.uploadIconContainer}>
            <Ionicons name="cloud-upload" size={60} color={colors.white} />
          </View>
          <Text style={styles.uploadTitle}>Fungal Image Upload</Text>
          <Text style={styles.uploadSubtitle}>
            Tap to select a satellite image
          </Text>

          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Detect Button */}
      <TouchableOpacity
        style={styles.detectButton}
        onPress={handleDetect}
        disabled={isDetecting}
      >
        {isDetecting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.detectButtonText}>Detect</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.white,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  uploadBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.borderDashed,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 20,
    resizeMode: "cover",
  },
  detectButton: {
    backgroundColor: colors.primary,
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  detectButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  // Results Screen Styles
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  imageResultCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
    marginBottom: 12,
  },
  imageDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  addDetailsButton: {
    marginTop: 16,
  },
  addDetailsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  vacantFillingButton: {
    backgroundColor: colors.primary,
    margin: 16,
    marginTop: 0,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  vacantFillingText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  // Vacant Filling Details Screen Styles
  vacantFillingContainer: {
    flex: 1,
    padding: 16,
  },
  metricsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  lastMetricRow: {
    borderBottomWidth: 0,
  },
  metricLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  graphCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  graphPlaceholder: {
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    height: 250,
    alignItems: "center",
    justifyContent: "center",
  },
  graphPlaceholderText: {
    fontSize: 20,
    color: "#999",
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    margin: 16,
    marginTop: 0,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  // History Screen Styles
  historyList: {
    padding: 16,
    paddingBottom: 32,
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#E0E0E0",
  },
  historyDetails: {
    flex: 1,
    justifyContent: "center",
  },
  historyDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  historyText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  historyLabel: {
    fontWeight: "bold",
    color: colors.text,
  },
  loadMoreButton: {
    backgroundColor: "#D3D3D3",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});

export default AnalyzeScreen;
