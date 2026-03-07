import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getSensorReadings, formatTimestamp } from "../services/firebaseService";

export default function DetailedHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { parameter } = route.params || {};

  const [isLoading, setIsLoading] = useState(true);
  const [readings, setReadings] = useState([]);
  const [allReadings, setAllReadings] = useState([]);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  // Parameter configurations
  const parameterConfig = {
    nitrogen: {
      name: "Nitrogen (N)",
      nameSinhala: "නයිට්‍රජන්",
      unit: "mg/kg",
      color: "#2E7D32",
      icon: "leaf",
      iconType: "fontawesome",
    },
    phosphorus: {
      name: "Phosphorus (P)",
      nameSinhala: "පොස්පරස්",
      unit: "mg/kg",
      color: "#1976D2",
      icon: "atom",
      iconType: "material",
    },
    potassium: {
      name: "Potassium (K)",
      nameSinhala: "පොටෑසියම්",
      unit: "mg/kg",
      color: "#F57C00",
      icon: "flask",
      iconType: "fontawesome",
    },
    moisture: {
      name: "Moisture",
      nameSinhala: "තෙතමනය",
      unit: "%",
      color: "#00838F",
      icon: "water",
      iconType: "material",
    },
    ph: {
      name: "pH Level",
      nameSinhala: "pH මට්ටම",
      unit: "",
      color: "#7B1FA2",
      icon: "test-tube",
      iconType: "material",
    },
    ec: {
      name: "EC Level",
      nameSinhala: "විද්‍යුත් සන්නායකතාව",
      unit: "mS/cm",
      color: "#C62828",
      icon: "flash",
      iconType: "ionicons",
    },
  };

  useEffect(() => {
    fetchDetailedHistory();
  }, []);

  const fetchDetailedHistory = async () => {
    try {
      // Fetch last 100 readings to cover approximately 30 days
      const result = await getSensorReadings(100);

      if (result.success && result.data.length > 0) {
        setAllReadings(result.data);

        // If specific parameter is selected, filter for that parameter
        if (parameter) {
          const filteredReadings = result.data
            .filter(reading => reading[parameter] !== undefined && reading[parameter] !== null)
            .map(reading => ({
              value: reading[parameter],
              timestamp: reading.timestamp,
              id: reading.id,
            }));
          setReadings(filteredReadings);
        } else {
          // Show all parameters
          setReadings(result.data);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching detailed history:', error);
      setIsLoading(false);
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
    setSortOrder(newOrder);

    // Sort readings based on new order
    if (parameter) {
      const sorted = [...readings].sort((a, b) => {
        return newOrder === 'newest'
          ? (b.timestamp || 0) - (a.timestamp || 0)
          : (a.timestamp || 0) - (b.timestamp || 0);
      });
      setReadings(sorted);
    } else {
      const sorted = [...allReadings].sort((a, b) => {
        return newOrder === 'newest'
          ? (b.timestamp || 0) - (a.timestamp || 0)
          : (a.timestamp || 0) - (b.timestamp || 0);
      });
      setAllReadings(sorted);
    }
  };

  const renderAllParametersView = () => {
    return allReadings.map((reading, index) => {
      const timestamp = reading.timestamp;

      return (
        <View key={reading.id || index} style={styles.readingCard}>
          <View style={styles.readingHeader}>
            <View style={styles.timestampContainer}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.timestampText}>{formatTimestamp(timestamp)}</Text>
            </View>
            <Text style={styles.readingNumber}>#{allReadings.length - index}</Text>
          </View>

          <View style={styles.parametersGrid}>
            {Object.keys(parameterConfig).map((key) => {
              const config = parameterConfig[key];
              const value = reading[key];

              if (value === undefined || value === null) return null;

              return (
                <View key={key} style={styles.parameterItem}>
                  <View style={[styles.parameterIcon, { backgroundColor: `${config.color}20` }]}>
                    {config.iconType === "fontawesome" ? (
                      <FontAwesome5 name={config.icon} size={16} color={config.color} />
                    ) : config.iconType === "material" ? (
                      <MaterialCommunityIcons name={config.icon} size={18} color={config.color} />
                    ) : (
                      <Ionicons name={config.icon} size={18} color={config.color} />
                    )}
                  </View>
                  <View style={styles.parameterInfo}>
                    <Text style={styles.parameterName}>{key.charAt(0).toUpperCase()}</Text>
                    <Text style={[styles.parameterValue, { color: config.color }]}>
                      {value.toFixed(key === 'ph' ? 1 : 0)}{config.unit}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      );
    });
  };

  const renderSingleParameterView = () => {
    const config = parameterConfig[parameter];

    return readings.map((reading, index) => {
      const prevValue = index < readings.length - 1 ? readings[index + 1].value : null;
      const change = prevValue !== null ? reading.value - prevValue : 0;
      const changePercent = prevValue !== null && prevValue !== 0
        ? ((change / prevValue) * 100).toFixed(1)
        : 0;

      return (
        <View key={reading.id || index} style={styles.singleReadingCard}>
          <View style={styles.singleReadingHeader}>
            <View style={styles.valueContainer}>
              <Text style={[styles.mainValue, { color: config.color }]}>
                {reading.value.toFixed(parameter === 'ph' ? 1 : 0)}
              </Text>
              <Text style={styles.unitText}>{config.unit}</Text>
            </View>

            {change !== 0 && (
              <View style={[
                styles.changeBadge,
                { backgroundColor: change > 0 ? '#E8F5E9' : '#FFEBEE' }
              ]}>
                <Ionicons
                  name={change > 0 ? "trending-up" : "trending-down"}
                  size={14}
                  color={change > 0 ? "#2E7D32" : "#D32F2F"}
                />
                <Text style={[
                  styles.changeText,
                  { color: change > 0 ? "#2E7D32" : "#D32F2F" }
                ]}>
                  {change > 0 ? '+' : ''}{changePercent}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.singleReadingFooter}>
            <Ionicons name="time-outline" size={14} color="#999" />
            <Text style={styles.singleTimestamp}>
              {formatTimestamp(reading.timestamp)}
            </Text>
            <Text style={styles.readingNumberSmall}>
              Reading #{readings.length - index}
            </Text>
          </View>
        </View>
      );
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 16, color: "#666", fontSize: 14 }}>
          Loading detailed history...
        </Text>
      </View>
    );
  }

  const config = parameter ? parameterConfig[parameter] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={config?.color || "#2E7D32"} />

      {/* Header */}
      <LinearGradient
        colors={config ? [config.color, `${config.color}CC`] : ["#1B5E20", "#2E7D32"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative circles */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />

        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              {parameter ? config.name : "All Parameters"}
            </Text>
            {parameter && (
              <Text style={styles.headerSubtitle}>{config.nameSinhala}</Text>
            )}
            <Text style={styles.headerCount}>
              {readings.length} readings from last 30 days
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Sort Toggle */}
      <View style={styles.sortContainer}>
        <View style={styles.sortLabel}>
          <Ionicons name="funnel-outline" size={16} color="#666" />
          <Text style={styles.sortLabelText}>Sort by:</Text>
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={toggleSortOrder}
        >
          <Text style={styles.sortButtonText}>
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </Text>
          <Ionicons
            name={sortOrder === 'newest' ? "arrow-down" : "arrow-up"}
            size={16}
            color="#2E7D32"
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {readings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No readings available</Text>
          </View>
        ) : (
          parameter ? renderSingleParameterView() : renderAllParametersView()
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorativeCircle2: {
    position: "absolute",
    top: 20,
    right: 80,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  decorativeCircle3: {
    position: "absolute",
    top: -20,
    right: 180,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  headerCount: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
  },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sortLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sortLabelText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  sortButtonText: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  readingCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(46, 125, 50, 0.08)",
  },
  readingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#F5F5F5",
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timestampText: {
    fontSize: 13,
    color: "#2E7D32",
    marginLeft: 6,
    fontWeight: "600",
  },
  readingNumber: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "700",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  parametersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  parameterItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
  },
  parameterIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  parameterInfo: {
    flex: 1,
  },
  parameterName: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  parameterValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 3,
    letterSpacing: 0.3,
  },
  singleReadingCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(46, 125, 50, 0.08)",
  },
  singleReadingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  mainValue: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 18,
    color: "#666",
    marginLeft: 8,
    fontWeight: "600",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5,
    letterSpacing: 0.3,
  },
  singleReadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 18,
    borderTopWidth: 2,
    borderTopColor: "#F5F5F5",
  },
  singleTimestamp: {
    fontSize: 13,
    color: "#2E7D32",
    marginLeft: 6,
    flex: 1,
    fontWeight: "600",
    backgroundColor: "#F8FAF8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  readingNumberSmall: {
    fontSize: 11,
    color: "#2E7D32",
    fontWeight: "700",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
});
