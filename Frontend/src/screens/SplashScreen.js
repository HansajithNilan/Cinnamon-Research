import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { colors } from "../styles/colors";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ImageBackground
                source={require("../../assets/cinnamonimage.jpg")}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <LinearGradient
                    // Subtle dark overlay to ensure text readability without obscuring the image
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.contentContainer}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="leaf" size={80} color={colors.white} />
                        </View>

                        <Text style={styles.title}>Smart Cinnamon</Text>
                        <Text style={styles.subtitle}>
                            Experience the finest collection of quality cinnamon.
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate("Login")}
                            >
                                <Text style={styles.primaryButtonText}>Get Started</Text>
                                <Ionicons name="arrow-forward" size={20} color={colors.cinnamonDark} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => navigation.navigate("Signup")}
                            >
                                <Text style={styles.secondaryButtonText}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        width: "100%",
        paddingHorizontal: 30,
        alignItems: "center",
        justifyContent: "space-between",
        height: height * 0.7,
        marginTop: height * 0.1,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    title: {
        fontSize: 42,
        fontWeight: "bold",
        color: colors.white,
        textAlign: "center",
        marginBottom: 10,
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 18,
        color: "rgba(255,255,255,0.9)",
        textAlign: "center",
        marginBottom: 50,
        lineHeight: 24,
    },
    buttonContainer: {
        width: "100%",
        gap: 15,
    },
    primaryButton: {
        backgroundColor: colors.white,
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        gap: 10,
    },
    primaryButtonText: {
        color: colors.cinnamonDark,
        fontSize: 18,
        fontWeight: "bold",
    },
    secondaryButton: {
        paddingVertical: 16,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: "600",
    },
});
