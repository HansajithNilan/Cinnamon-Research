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
    Animated,
    ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";

const { height, width } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const handleLogin = () => {
        // Implement login logic here
        navigation.replace("Main"); // Use replace to prevent going back to login
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <StatusBar style="light" />

                    {/* Enhanced Header Background with Gradient */}
                    <View style={styles.headerBackground}>
                        <LinearGradient
                            colors={['#2E7D32', '#4CAF50', '#81C784']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradient}
                        >
                            <View style={styles.decorativeCircle1} />
                            <View style={styles.decorativeCircle2} />
                            <View style={styles.decorativeCircle3} />
                        </LinearGradient>
                        
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.primaryDark} />
                        </TouchableOpacity>

                        {/* Logo/Icon Area */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Ionicons name="leaf" size={50} color={colors.white} />
                            </View>
                        </View>
                    </View>

                    {/* Enhanced Form Container */}
                    <View style={styles.formContainer}>
                        <View style={styles.formCard}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Welcome Back</Text>
                                <Text style={styles.subtitle}>Login to your account</Text>
                                <View style={styles.titleUnderline} />
                            </View>

                            <View style={styles.inputContainer}>
                                {/* Enhanced Email Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Email Address</Text>
                                    <View style={[
                                        styles.inputWrapper,
                                        emailFocused && styles.inputWrapperFocused
                                    ]}>
                                        <View style={styles.iconContainer}>
                                            <Ionicons 
                                                name="mail" 
                                                size={22} 
                                                color={emailFocused ? colors.primary : colors.textSecondary} 
                                            />
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your email"
                                            placeholderTextColor={colors.textSecondary}
                                            value={email}
                                            onChangeText={setEmail}
                                            onFocus={() => setEmailFocused(true)}
                                            onBlur={() => setEmailFocused(false)}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                {/* Enhanced Password Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Password</Text>
                                    <View style={[
                                        styles.inputWrapper,
                                        passwordFocused && styles.inputWrapperFocused
                                    ]}>
                                        <View style={styles.iconContainer}>
                                            <Ionicons 
                                                name="lock-closed" 
                                                size={22} 
                                                color={passwordFocused ? colors.primary : colors.textSecondary} 
                                            />
                                        </View>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your password"
                                            placeholderTextColor={colors.textSecondary}
                                            value={password}
                                            onChangeText={setPassword}
                                            onFocus={() => setPasswordFocused(true)}
                                            onBlur={() => setPasswordFocused(false)}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity 
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeButton}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons
                                                name={showPassword ? "eye-off" : "eye"}
                                                size={22}
                                                color={colors.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Remember Me and Forgot Password Row */}
                                <View style={styles.optionsRow}>
                                    <TouchableOpacity style={styles.rememberMeContainer}>
                                        <View style={styles.checkbox}>
                                            <View style={styles.checkboxInner} />
                                        </View>
                                        <Text style={styles.rememberMeText}>Remember me</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity style={styles.forgotPassword}>
                                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Enhanced Login Button */}
                                <TouchableOpacity 
                                    style={styles.loginButton} 
                                    onPress={handleLogin}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#4CAF50', '#2E7D32']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.loginButtonGradient}
                                    >
                                        <Text style={styles.loginButtonText}>Sign In</Text>
                                        <Ionicons name="arrow-forward" size={20} color={colors.white} />
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Divider */}
                                <View style={styles.dividerContainer}>
                                    <View style={styles.divider} />
                                    <Text style={styles.dividerText}>OR</Text>
                                    <View style={styles.divider} />
                                </View>

                                {/* Social Login Buttons */}
                                <View style={styles.socialContainer}>
                                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                                        <Ionicons name="logo-google" size={24} color="#DB4437" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                                        <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                                        <Ionicons name="logo-apple" size={24} color="#000000" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Enhanced Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                                <Text style={styles.signupText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    headerBackground: {
        height: height * 0.35,
        position: 'relative',
    },
    gradient: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -50,
        right: -50,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: 20,
        left: -30,
    },
    decorativeCircle3: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        top: '50%',
        right: '30%',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    logoContainer: {
        position: 'absolute',
        bottom: -40,
        alignSelf: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.white,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    formCard: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: colors.primaryDark,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        marginBottom: 12,
    },
    titleUnderline: {
        width: 60,
        height: 3,
        backgroundColor: colors.primary,
        borderRadius: 2,
        marginTop: 8,
    },
    inputContainer: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginLeft: 4,
        marginBottom: 4,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: '#F8F9FA',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: 'transparent',
        transition: 'all 0.3s',
    },
    inputWrapperFocused: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        marginRight: 12,
        width: 24,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        paddingVertical: 0,
    },
    eyeButton: {
        padding: 4,
        marginLeft: 8,
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxInner: {
        width: 10,
        height: 10,
        borderRadius: 3,
        backgroundColor: colors.primary,
        display: 'none', // Will be visible when checked
    },
    rememberMeText: {
        fontSize: 14,
        color: colors.text,
    },
    forgotPassword: {
        padding: 4,
    },
    forgotPasswordText: {
        color: colors.primary,
        fontWeight: "600",
        fontSize: 14,
    },
    loginButton: {
        borderRadius: 14,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        paddingVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    loginButtonText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        paddingHorizontal: 16,
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 28,
        marginBottom: 24,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 15,
    },
    signupText: {
        color: colors.primaryDark,
        fontSize: 15,
        fontWeight: "700",
    },
});

