import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Dimensions,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";

import { auth } from "../config/vacant/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const { height, width } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigation.replace("Main");
        } catch (error) {
            console.error(error);
            let errorMessage = "An error occurred during login.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Please enter a valid email address.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed attempts. Please try again later.";
            }
            Alert.alert("Login Error", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.mainContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.mainContainer}>
                    <StatusBar style="light" />

                    {/* Header Background */}
                    <View style={styles.headerBackground}>
                        <LinearGradient
                            colors={[colors.primaryDark || '#2E7D32', colors.primary || '#4CAF50']}
                            style={styles.gradient}
                        >
                            <View style={styles.circle1} />
                            <View style={styles.circle2} />
                        </LinearGradient>

                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.white} />
                        </TouchableOpacity>

                        <View style={styles.headerLogoContainer}>
                            <Image
                                source={require("../assets/logo.png")}
                                style={styles.headerLogo}
                            />
                        </View>
                    </View>

                    {/* Form Container */}
                    <View style={styles.formContainer}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            bounces={false}
                        >
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Welcome Back!</Text>
                                <Text style={styles.subtitle}>Log in to continue</Text>
                            </View>

                            <View style={styles.inputContainer}>
                                {/* Email Input */}
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email Address"
                                        placeholderTextColor={colors.textSecondary}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                {/* Password Input */}
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor={colors.textSecondary}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={colors.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.optionsContainer}>
                                    <TouchableOpacity style={styles.forgotPasswordButton}>
                                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.loginButton, loading && { opacity: 0.7 }]}
                                    onPress={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <Text style={styles.loginButtonText}>LOGIN</Text>
                                    )}
                                </TouchableOpacity>

                                {/* Divider */}
                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>or continue with</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* Social Login Options */}
                                <View style={styles.socialContainer}>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <Ionicons name="logo-google" size={24} color="#DB4437" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <Ionicons name="logo-apple" size={24} color="#000000" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                                    <Text style={styles.signupText}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>

                        </ScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    headerBackground: {
        height: height * 0.35,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        position: 'relative',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle1: {
        position: 'absolute',
        width: height * 0.4,
        height: height * 0.4,
        borderRadius: height * 0.2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -height * 0.1,
        right: -width * 0.2,
    },
    circle2: {
        position: 'absolute',
        width: height * 0.3,
        height: height * 0.3,
        borderRadius: height * 0.15,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        bottom: -height * 0.1,
        left: -width * 0.2,
    },
    headerLogoContainer: {
        position: 'absolute',
        top: height * 0.12,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    headerLogo: {
        width: 60,
        height: 60,
        resizeMode: "contain",
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 40,
        left: 20,
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 20,
    },
    formContainer: {
        flex: 1,
        backgroundColor: colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
        paddingTop: 30,
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: colors.primaryDark || '#2E7D32',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background || '#F8F9FA',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: colors.border || '#E0E0E0',
        marginBottom: 16,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    eyeIcon: {
        padding: 5,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: -4,
    },
    forgotPasswordButton: {
        padding: 4,
    },
    forgotPasswordText: {
        color: colors.primary || '#4CAF50',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loginButton: {
        backgroundColor: colors.primary || '#4CAF50',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: "center",
        shadowColor: colors.primary || '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 24,
    },
    loginButtonText: {
        color: colors.white || '#fff',
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border || '#E0E0E0',
    },
    dividerText: {
        paddingHorizontal: 15,
        color: colors.textSecondary || '#757575',
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 10,
    },
    socialButton: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: colors.white || '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border || '#E0E0E0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 'auto',
        paddingTop: 10,
    },
    footerText: {
        color: colors.textSecondary || '#757575',
        fontSize: 15,
    },
    signupText: {
        color: colors.primaryDark || '#2E7D32',
        fontSize: 15,
        fontWeight: "bold",
    },
});
