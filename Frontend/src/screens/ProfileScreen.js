import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../styles/colors";

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [isEditing, setIsEditing] = useState(false);

    // Dummy user state
    const [userInfo, setUserInfo] = useState({
        name: "Cinnamon AI User",
        email: "user@cinnamon.lk",
        phone: "+94 77 123 4567",
        address: "Colombo, Sri Lanka",
        bio: "Tea & Cinnamon Planter",
    });

    const handleSave = () => {
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
    };

    const renderInput = (label, value, key, keyboardType = "default") => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            {isEditing ? (
                <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={(text) => setUserInfo({ ...userInfo, [key]: text })}
                    keyboardType={keyboardType}
                    placeholder={`Enter your ${label.toLowerCase()}`}
                    placeholderTextColor="#999"
                />
            ) : (
                <Text style={styles.infoText}>{value}</Text>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.headerWrapper}>
                <LinearGradient
                    colors={[colors.primary, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Profile</Text>
                        <TouchableOpacity
                            style={styles.editHeaderButton}
                            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                        >
                            <Text style={styles.editHeaderText}>
                                {isEditing ? "Save" : "Edit"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarWrapper}>
                            <Ionicons name="person" size={60} color={colors.white} />
                        </View>
                        <TouchableOpacity style={styles.cameraButton}>
                            <Ionicons name="camera" size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>{userInfo.name}</Text>
                    <Text style={styles.userRole}>Premium Member</Text>
                </View>

                {/* Info Form */}
                <View style={styles.formSection}>
                    {renderInput("Full Name", userInfo.name, "name")}
                    {renderInput("Email Address", userInfo.email, "email", "email-address")}
                    {renderInput("Phone Number", userInfo.phone, "phone", "phone-pad")}
                    {renderInput("Address", userInfo.address, "address")}
                    {renderInput("Bio", userInfo.bio, "bio")}
                </View>

                {/* Stats or Extra Info (Optional) */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Plots</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>4.8</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>2y</Text>
                        <Text style={styles.statLabel}>Member</Text>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background || "#F5F5F5",
    },
    headerWrapper: {
        marginBottom: 0,
        backgroundColor: colors.primary,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    headerGradient: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.white,
    },
    editHeaderButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 15,
    },
    editHeaderText: {
        color: colors.white,
        fontWeight: "600",
        fontSize: 14,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: "center",
        marginTop: -40, // overlap with header slightly or just below
        marginBottom: 20,
        paddingTop: 57,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.cinnamonLight || "#E6A87C",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: colors.white,
    },
    cameraButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: colors.white,
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.text,
        marginBottom: 4,
    },
    userRole: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: "500",
    },
    formSection: {
        backgroundColor: colors.white,
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 18,
    },
    inputLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 8,
        fontWeight: "500",
    },
    textInput: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        fontSize: 16,
        color: colors.text,
        paddingVertical: 8,
    },
    infoText: {
        fontSize: 16,
        color: colors.text,
        fontWeight: "500",
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent', // maintain spacing
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.white,
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '80%',
        backgroundColor: colors.border,
    }
});

export default ProfileScreen;
