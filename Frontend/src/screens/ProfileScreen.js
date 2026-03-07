import React, { useState, useEffect } from "react";
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
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../styles/colors";
import { auth, db } from "../config/vacant/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [userInfo, setUserInfo] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        bio: "",
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserInfo({
                        name: data.fullName || user.displayName || "",
                        email: data.email || user.email || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        bio: data.bio || "",
                    });
                } else {
                    // Fallback to Auth profile if Firestore doc doesn't exist
                    setUserInfo(prev => ({
                        ...prev,
                        name: user.displayName || "",
                        email: user.email || "",
                    }));
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                Alert.alert("Error", "Could not load profile data.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                fullName: userInfo.name,
                email: userInfo.email,
                phone: userInfo.phone,
                address: userInfo.address,
                bio: userInfo.bio,
            }, { merge: true });
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Error", "Failed to update profile.");
        }
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
                <Text style={styles.infoText}>{value || "N/A"}</Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await auth.signOut();
                            navigation.replace("Login");
                        } catch (error) {
                            Alert.alert("Error", "Failed to logout");
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >

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

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={24} color={colors.red || "#E53935"} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

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
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
        marginHorizontal: 20,
        marginTop: 20,
        padding: 15,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        gap: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.red || "#E53935",
    }
});

export default ProfileScreen;
