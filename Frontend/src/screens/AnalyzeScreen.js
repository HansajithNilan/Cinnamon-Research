import React, { useState, useEffect } from "react";
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
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Rect, Text as SvgText, G, Line } from "react-native-svg";
import { ENDPOINTS } from "../config/vacant/api";
import { db, auth } from "../config/vacant/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";


const { width } = Dimensions.get("window");

const GrowthChart = ({ initialYield }) => {
  const yieldValue = parseFloat(initialYield) || 0;
  const data = [
    { year: "Year 1", value: yieldValue * 0.2 },
    { year: "Year 2", value: yieldValue * 0.5 },
    { year: "Year 3", value: yieldValue * 0.8 },
    { year: "Year 4", value: yieldValue },
  ];

  const chartHeight = 150;
  const chartWidth = width - 80;
  const barWidth = 40;
  const gap = (chartWidth - (barWidth * 4)) / 5;
  const maxVal = yieldValue > 0 ? yieldValue : 10;

  return (
    <View style={{ alignItems: "center", marginTop: 10 }}>
      <Svg height={chartHeight + 40} width={chartWidth}>
        <G translate="0, 10">
          {data.map((item, index) => {
            const barHeight = (item.value / maxVal) * chartHeight;
            const x = index * (barWidth + gap) + gap;
            const y = chartHeight - barHeight;

            return (
              <G key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={colors.primary}
                  rx="6"
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize="10"
                  fill={colors.text}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {item.value.toFixed(1)}kg
                </SvgText>
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight + 20}
                  fontSize="10"
                  fill={colors.textSecondary}
                  textAnchor="middle"
                >
                  {item.year}
                </SvgText>
              </G>
            );
          })}
          <Line
            x1="0"
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke={colors.border}
            strokeWidth="1"
          />
        </G>
      </Svg>
    </View>
  );
};

const AnalyzeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showVacantFilling, setShowVacantFilling] = useState(false);
  const [showHistory, setShowHistory] = useState(route.params?.showHistory ?? false);
  const [showReport, setShowReport] = useState(false);

  const [detectionResults, setDetectionResults] = useState({
    vacantPixels: "0",
    vacantAreaSqm: "0.00",
    spacing: "1.2m x 0.9m",
    treeAreaSqm: "1.08",
  });
  const [vacantFillingData, setVacantFillingData] = useState({
    vacantAreaMeasurement: "0.00",
    vacantFillingPlantsCost: "0.00",
    fillingPlantCount: "0",
    yieldForecasting: "0.00 kg",
  });

  const [historyData, setHistoryData] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsLoadingHistory(true);
    try {
      const q = query(
        collection(db, "analyses"),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(q);
      const analyses = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        analyses.push({
          id: doc.id,
          date: data.analysisDate || "N/A",
          image: data.image,
          vacantArea: data.vacantArea ? data.vacantArea.replace(" sqm", "") : "0",
          plantCount: data.requiredPlants || "0",
          estimatedCost: data.totalCost ? `Rs ${data.totalCost}` : "Rs 0",
        });
      });
      setHistoryData(analyses);
    } catch (error) {
      console.error("Error fetching history: ", error);
      // Fallback if index isn't created yet or other error
      try {
        const qBasic = query(collection(db, "analyses"));
        const querySnapshot = await getDocs(qBasic);
        const analyses = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          analyses.push({
            id: doc.id,
            date: data.analysisDate || "N/A",
            image: data.image,
            vacantArea: data.vacantArea ? data.vacantArea.replace(" sqm", "") : "0",
            plantCount: data.requiredPlants || "0",
            estimatedCost: data.totalCost ? `Rs ${data.totalCost}` : "Rs 0",
          });
        });
        // Sort manually if orderBy failed
        analyses.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistoryData(analyses);
      } catch (innerError) {
        console.error("Fallback fetch failed: ", innerError);
        Alert.alert("Error", "Failed to load history.");
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const handleDeleteAnalysis = (id) => {
    Alert.alert(
      "Delete Analysis",
      "Are you sure you want to delete this analysis record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "analyses", id));
              setHistoryData(prev => prev.filter(item => item.id !== id));
            } catch (error) {
              console.error("Error deleting analysis: ", error);
              Alert.alert("Error", "Failed to delete analysis record.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (route.params?.imageUri) {
      setSelectedImage(route.params.imageUri);
    }
  }, [route.params?.imageUri]);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access gallery is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],

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

  const handleDetect = async () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please select an image first");
      return;
    }
    setIsDetecting(true);
    try {
      const formData = new FormData();
      const filename = selectedImage.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const imageType = match ? `image/${match[1]}` : `image`;

      formData.append("file", {
        uri: selectedImage,
        name: filename,
        type: imageType,
      });

      const response = await fetch(ENDPOINTS.ANALYZE_VACANT, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const result = await response.json();

      setIsDetecting(false);

      if (response.ok) {
        if (result.status === "success" && result.data) {
          setDetectionResults({
            vacantPixels: result.data.vacant_pixels.toString(),
            vacantAreaSqm: result.data.vacant_area_sqm.toString(),
            spacing: result.data.spacing_m || "1.2m x 0.9m",
            treeAreaSqm: result.data.tree_area_sqm?.toString() || "1.08",
          });

          setVacantFillingData({
            vacantAreaMeasurement: result.data.vacant_area_sqm.toString(),
            vacantFillingPlantsCost: result.data.estimated_cost.toString(),
            fillingPlantCount: result.data.required_plants.toString(),
            yieldForecasting: `${result.data.yield_forecast} kg`,
          });

          setSelectedImage(result.data.processed_image_base64);
          setShowResults(true);
        } else if (result.status === "invalid") {
          Alert.alert("Invalid Image", result.message || "No vacant land detected in the uploaded image.");
          setSelectedImage(null);
        } else {
          Alert.alert("Analysis Error", result.message || "An error occurred during analysis.");
          setSelectedImage(null);
        }
      } else {
        Alert.alert("Analysis Failed", result.detail || "Could not analyze the image.");
        setSelectedImage(null);
      }
    } catch (error) {
      setIsDetecting(false);
      Alert.alert("Connection Error", "Could not connect to the backend server. Check your IP.");
      setSelectedImage(null);
    }
  };

  const handleVacantFilling = () => {
    setShowVacantFilling(true);
    setShowResults(false);
  };

  const handleBack = () => {
    if (showResults) { setShowResults(false); setSelectedImage(null); return; }
    if (showHistory) { setShowHistory(false); setSelectedImage(null); return; }
    navigation.goBack();
  };

  const handleBackToResults = () => {
    setShowVacantFilling(false);
    setShowResults(true);
  };

  const handleConfirm = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to save analysis.");
        return;
      }

      setIsDetecting(true); // Using isDetecting as a loading state for saving

      const agronomyRecs = `Your land has ${detectionResults.vacantAreaSqm} sqm of vacant area. We recommend planting ${vacantFillingData.fillingPlantCount} high-quality seedlings based on ${detectionResults.spacing} spacing. Projected long-term yield: ${vacantFillingData.yieldForecasting}.`;

      const analysisData = {
        userId: user.uid,
        image: selectedImage,
        vacantPixels: detectionResults.vacantPixels,
        vacantAreaSqm: detectionResults.vacantAreaSqm,
        analysisDate: new Date().toLocaleDateString(),
        landCoverage: `${vacantFillingData.vacantAreaMeasurement} sqm`,
        agronomyRecommendations: agronomyRecs,
        yieldForecast: vacantFillingData.yieldForecasting,
        requiredPlants: vacantFillingData.fillingPlantCount,
        totalCost: vacantFillingData.vacantFillingPlantsCost,
        vacantArea: `${vacantFillingData.vacantAreaMeasurement} sqm`,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "analyses"), analysisData);

      setIsDetecting(false);
      Alert.alert("Success", "Analysis saved successfully!");

      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        image: selectedImage,
        vacantArea: vacantFillingData.vacantAreaMeasurement,
        plantCount: vacantFillingData.fillingPlantCount,
        estimatedCost: `Rs ${vacantFillingData.vacantFillingPlantsCost}`,
      };
      setHistoryData([newEntry, ...historyData]);
      setShowVacantFilling(false);
      setShowResults(false);
      setShowHistory(true);
    } catch (error) {
      setIsDetecting(false);
      console.error("Error saving analysis: ", error);
      Alert.alert("Error", "Failed to save analysis. Please try again.");
    }
  };


  const Header = ({ title, showBack, onBack }) => (
    <View style={styles.headerWrapper}>
      <LinearGradient colors={[colors.primary, colors.primary]} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          {showBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, showBack && { marginLeft: 8 }]}>{title}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const DetailedReportModal = () => (
    <Modal visible={showReport} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detailed Land Report</Text>
            <TouchableOpacity onPress={() => setShowReport(false)}>
              <Ionicons name="close-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>Analysis Date</Text><Text style={styles.reportValue}>{new Date().toLocaleDateString()}</Text></View>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>Vacant Pixels</Text><Text style={styles.reportValue}>{detectionResults.vacantPixels}</Text></View>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>Vacant Area</Text><Text style={styles.reportValue}>{detectionResults.vacantAreaSqm} sqm</Text></View>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>Spacing</Text><Text style={styles.reportValue}>{detectionResults.spacing}</Text></View>
            <View style={styles.reportRow}><Text style={styles.reportLabel}>1 Tree Area</Text><Text style={styles.reportValue}>{detectionResults.treeAreaSqm} sqm</Text></View>
            <View style={styles.reportDivider} />
            <Text style={styles.reportSubTitle}>Agronomy Recommendations</Text>
            <Text style={styles.reportText}>
              Your land has {detectionResults.vacantAreaSqm} sqm of vacant area.
              We recommend planting {vacantFillingData.fillingPlantCount} high-quality seedlings.
              Projected long-term yield: {vacantFillingData.yieldForecasting}.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyCard}>
      <Image source={item.image ? { uri: item.image } : require("../assets/placeholder.jpg")} style={styles.historyImage} />
      <View style={styles.historyDetails}>
        <View style={styles.historyHeaderRow}>
          <View style={styles.historyDateRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
            <Text style={styles.historyDate}>{item.date}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteAnalysis(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={18} color="#FF5252" />
          </TouchableOpacity>
        </View>
        <View style={styles.historyStatsRow}>
          <View style={styles.historyStat}><Text style={styles.historyStatLabel}>Area</Text><Text style={styles.historyStatValue}>{item.vacantArea} Sqm</Text></View>
          <View style={styles.historyDivider} />
          <View style={styles.historyStat}><Text style={styles.historyStatLabel}>Plants</Text><Text style={styles.historyStatValue}>{item.plantCount}</Text></View>
          <View style={styles.historyDivider} />
          <View style={styles.historyStat}><Text style={styles.historyStatLabel}>Cost</Text><Text style={styles.historyStatValue}>{item.estimatedCost}</Text></View>
        </View>
      </View>
    </View>
  );

  if (showHistory) return (
    <View style={styles.container}>
      <Header title="Analysis History" showBack={true} onBack={handleBack} />
      {isLoadingHistory ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 10, color: colors.textSecondary }}>Loading your history...</Text>
        </View>
      ) : (
        <FlatList
          data={historyData}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.historyList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<Text style={styles.listHeader}>Recent Analyses</Text>}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={colors.border} />
              <Text style={styles.emptyText}>No analyses found yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );

  if (showVacantFilling) return (
    <View style={styles.container}>
      <Header title="Vacant Filling" showBack={true} onBack={handleBackToResults} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}><Ionicons name="stats-chart" size={20} color={colors.primary} /><Text style={styles.cardTitle}>Filling Metrics</Text></View>
          <View style={styles.metricRow}><Text style={styles.metricLabel}>Vacant Area</Text><Text style={styles.metricValue}>{vacantFillingData.vacantAreaMeasurement} sqm</Text></View>
          <View style={styles.metricRow}><Text style={styles.metricLabel}>Required Plants</Text><Text style={styles.metricValue}>{vacantFillingData.fillingPlantCount}</Text></View>
          <View style={styles.metricRow}><Text style={styles.metricLabel}>Yield Forecast</Text><Text style={styles.metricValue}>{vacantFillingData.yieldForecasting}</Text></View>
          <View style={[styles.metricRow, styles.lastMetricRow]}><Text style={styles.metricLabel}>Total Cost</Text><Text style={styles.metricValue}>{vacantFillingData.vacantFillingPlantsCost} Rs.</Text></View>
        </View>
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}><Ionicons name="trending-up" size={20} color={colors.primary} /><Text style={styles.cardTitle}>Growth Projection (kg)</Text></View>
          <GrowthChart initialYield={vacantFillingData.yieldForecasting} />
        </View>
        <TouchableOpacity
          style={[styles.mainButton, isDetecting && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={isDetecting}
        >
          <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.buttonGradient}>
            {isDetecting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.mainButtonText}>Save & Confirm Analysis</Text>
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.white} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );

  if (showResults && selectedImage) return (
    <View style={styles.container}>
      <Header title="Detection Results" showBack={true} onBack={handleBack} />
      <DetailedReportModal />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cardNoPadding}><Image source={{ uri: selectedImage }} style={styles.resultImage} /></View>
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}><Ionicons name="information-circle" size={20} color={colors.primary} /><Text style={styles.cardTitle}>Analysis Summary</Text></View>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}><Text style={styles.statValue}>{detectionResults.vacantPixels}</Text><Text style={styles.statLabel}>Vacant Pixels</Text></View>
            <View style={styles.statBox}><Text style={styles.statValue}>{detectionResults.vacantAreaSqm}</Text><Text style={styles.statLabel}>Area (sqm)</Text></View>
          </View>
          <TouchableOpacity style={styles.textButton} onPress={() => setShowReport(true)}><Text style={styles.textButtonLabel}>View Detailed Report</Text><Ionicons name="chevron-forward" size={16} color={colors.primary} /></TouchableOpacity>
        </View>
        <View style={styles.actionSection}><Text style={styles.instructionText}>Ready to optimize this area?</Text><TouchableOpacity style={styles.mainButton} onPress={handleVacantFilling}><LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.buttonGradient}><Text style={styles.mainButtonText}>Calculate Vacant Filling</Text><Ionicons name="calculator-outline" size={24} color={colors.white} /></LinearGradient></TouchableOpacity></View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="New Analysis" showBack={false} />
      <ScrollView contentContainerStyle={styles.centerContent} showsVerticalScrollIndicator={false}>
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage} activeOpacity={0.7}>
            {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.previewImage} /> : <View style={styles.uploadPlaceholder}><View style={styles.iconCircle}><Ionicons name="cloud-upload" size={40} color={colors.primary} /></View><Text style={styles.uploadTitle}>Upload Satellite Image</Text></View>}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.mainButton, !selectedImage && styles.disabledButton]} onPress={handleDetect} disabled={!selectedImage || isDetecting}>
          <LinearGradient colors={selectedImage ? [colors.primary, colors.primaryDark] : [colors.border, colors.border]} style={styles.buttonGradient}>{isDetecting ? <ActivityIndicator color={colors.white} /> : <><Text style={styles.mainButtonText}>Start Detection</Text><Ionicons name="scan" size={24} color={colors.white} /></>}</LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  centerContent: { flexGrow: 1, padding: 20, paddingBottom: 40, justifyContent: "center", alignItems: "center" },
  headerWrapper: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: "hidden", elevation: 4 },
  headerGradient: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerContent: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: colors.white, flex: 1 },
  backButton: { padding: 8, marginRight: 4, marginLeft: -8 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 20, elevation: 3 },
  cardNoPadding: { backgroundColor: colors.white, borderRadius: 20, marginBottom: 20, elevation: 3, overflow: 'hidden' },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  uploadContainer: { width: "100%", marginBottom: 30 },
  uploadBox: { width: "100%", backgroundColor: colors.white, borderRadius: 24, minHeight: 300, justifyContent: "center", alignItems: "center", borderWidth: 2, borderStyle: "dashed", borderColor: colors.primary, overflow: 'hidden' },
  uploadPlaceholder: { alignItems: 'center', padding: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(76, 175, 80, 0.1)", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  uploadTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 8 },
  previewImage: { width: "100%", height: 300, resizeMode: "cover" },
  mainButton: { width: "100%", borderRadius: 16, overflow: 'hidden', elevation: 4 },
  disabledButton: { opacity: 0.8 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
  mainButtonText: { color: colors.white, fontSize: 18, fontWeight: "bold" },
  textButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, padding: 8 },
  textButtonLabel: { color: colors.primary, fontWeight: '600', marginRight: 4 },
  resultImage: { width: "100%", height: 250 },
  statsGrid: { flexDirection: 'row', gap: 16 },
  statBox: { flex: 1, backgroundColor: '#F8F9FA', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EEEEEE' },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textSecondary, textTransform: 'uppercase', fontWeight: '600' },
  actionSection: { alignItems: 'center', marginTop: 10 },
  instructionText: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  lastMetricRow: { borderBottomWidth: 0 },
  metricLabel: { fontSize: 15, color: colors.textSecondary },
  metricValue: { fontSize: 16, fontWeight: "600", color: colors.text },
  historyList: { padding: 20, paddingBottom: 40 },
  historyCard: { backgroundColor: colors.white, borderRadius: 16, marginBottom: 16, flexDirection: "row", overflow: 'hidden', elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
  historyImage: { width: 100, height: "100%", backgroundColor: "#F0F0F0" },
  historyDetails: { flex: 1, padding: 12 },
  historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  historyDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyDate: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  deleteButton: { padding: 4, marginLeft: 8 },
  historyStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyStat: { alignItems: 'center' },
  historyDivider: { width: 1, height: 20, backgroundColor: '#EEEEEE' },
  historyStatLabel: { fontSize: 10, color: colors.textSecondary, marginBottom: 2 },
  historyStatValue: { fontSize: 12, fontWeight: '700', color: colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: colors.white, borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  reportLabel: { fontSize: 14, color: colors.textSecondary },
  reportValue: { fontSize: 14, fontWeight: 'bold', color: colors.text },
  reportDivider: { height: 2, backgroundColor: colors.primary, marginVertical: 20, opacity: 0.2 },
  reportSubTitle: { fontSize: 16, fontWeight: 'bold', color: colors.primary, marginBottom: 10 },
  reportText: { fontSize: 14, color: colors.text, lineHeight: 22, textAlign: 'justify' },
  listHeader: { fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 16 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: colors.textSecondary },
});

export default AnalyzeScreen;