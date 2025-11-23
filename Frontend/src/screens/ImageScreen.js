import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const ImageScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const showImageOptions = () => {
    setModalVisible(true);
  };

  const pickImageFromGallery = async () => {
    setModalVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to make this work!"
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
    }
  };

  const takePhoto = async () => {
    setModalVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAnalyze = () => {
    if (selectedImage) {
      navigation.navigate("Analysis", { imageUri: selectedImage });
    } else {
      Alert.alert("No Image", "Please select an image first");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cinnamon Guard</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Scan Seedling Leaf</Text>
          <Text style={styles.subtitle}>
            Upload a clear image of the cinnamon seedling leaf to predict fungal
            spread and get early action recommendations.
          </Text>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#7A9B5C" />
          <Text style={styles.infoBannerText}>
            For best results, capture the leaf in good lighting with visible
            spots or discoloration.
          </Text>
        </View>

        {/* Upload Box */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={showImageOptions}
          activeOpacity={0.7}
        >
          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
              />
              <TouchableOpacity
                style={styles.changeImageButton}
                onPress={showImageOptions}
              >
                <Ionicons name="camera" size={20} color="#FFF" />
                <Text style={styles.changeImageText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.cloudIcon}>
                <Ionicons name="camera-outline" size={60} color="#8B9D6B" />
              </View>
              <Text style={styles.uploadTitle}>
                Capture or Upload Leaf Photo
              </Text>
              <Text style={styles.uploadSubtitle}>
                Take a photo of the infected seedling leaf or choose from
                gallery
              </Text>
              <View style={styles.chooseButton}>
                <Text style={styles.chooseButtonText}>Select Image</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Photography Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color="#7A9B5C" />
            <Text style={styles.tipText}>Ensure leaf is clearly visible</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color="#7A9B5C" />
            <Text style={styles.tipText}>Use natural daylight if possible</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color="#7A9B5C" />
            <Text style={styles.tipText}>
              Focus on infected or discolored areas
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Analyze Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            !selectedImage && styles.analyzeButtonDisabled,
          ]}
          onPress={handleAnalyze}
          activeOpacity={0.8}
          disabled={!selectedImage}
        >
          <Text style={styles.analyzeButtonText}>
            Start Prediction Analysis
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Image Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose Image Source</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={takePhoto}
              activeOpacity={0.7}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons name="camera" size={24} color="#5A6B47" />
              </View>
              <Text style={styles.modalOptionText}>Take Photo</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={pickImageFromGallery}
              activeOpacity={0.7}
            >
              <View style={styles.modalOptionIcon}>
                <Ionicons name="images" size={24} color="#5A6B47" />
              </View>
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: "#F5F5F0",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0D8",
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: "#5A6B47",
    marginLeft: 10,
    lineHeight: 18,
  },
  uploadBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D0D0C8",
    borderStyle: "dashed",
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 250,
    marginBottom: 40,
  },
  imagePreviewContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    resizeMode: "cover",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 12,
    right: 9,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  changeImageText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cloudIcon: {
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  chooseButton: {
    backgroundColor: "#7A9B5C",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  chooseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  tipsSection: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 150,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 14,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F5F5F0",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#E0E0D8",
  },
  analyzeButton: {
    backgroundColor: "#1B9568",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 10,
  },
  analyzeButtonDisabled: {
    backgroundColor: "#D0D0C8",
  },
  analyzeButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D0D0D0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F0",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalOptionIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#D8E5C8",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  modalCancelButton: {
    backgroundColor: "#F5F5F0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
});

export default ImageScreen;
