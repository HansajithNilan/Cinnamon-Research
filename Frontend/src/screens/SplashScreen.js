import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
    Animated,
    Easing,
    useWindowDimensions,
    ScrollView,
    Image,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { colors } from "../styles/colors";
import { Ionicons } from "@expo/vector-icons";

export default function SplashScreen({ navigation }) {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [isPortrait, setIsPortrait] = useState(height > width);

    // Animation refs for sophisticated entry
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;

    // Detect orientation changes
    useEffect(() => {
        const subscription = Dimensions.addEventListener("change", ({ window: { width: w, height: h } }) => {
            setIsPortrait(h > w);
        });

        return () => subscription?.remove();
    }, []);

    // Staggered premium animations
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.bezier(0.23, 1, 0.32, 1),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1200,
                easing: Easing.bezier(0.23, 1, 0.32, 1),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.delay(400),
                Animated.spring(logoAnim, {
                    toValue: 1,
                    friction: 7,
                    tension: 50,
                    useNativeDriver: true,
                })
            ])
        ]).start();
    }, []);

    // Responsive scaling factor
    const scale = Math.min(width, height) / 375;

    // Dynamic typography and spacing
    const dynamicStyles = StyleSheet.create({
        container: {
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, 40),
            paddingLeft: insets.left,
            paddingRight: insets.right,
        },
        titleText: {
            fontSize: 29 * scale,
            fontWeight: "900",
            color: colors.white,
            textAlign: "center",
            letterSpacing: -1,
            textShadowColor: "rgba(0, 0, 0, 0.3)",
            textShadowOffset: { width: 0, height: 4 },
            textShadowRadius: 10,
        },
        subtitleText: {
            fontSize: 16 * scale,
            fontWeight: "700",
            color: colors.cinnamonLight,
            textAlign: "center",
            marginTop: 4 * scale,
            letterSpacing: 3,
            textTransform: "uppercase",
        },
        descriptionText: {
            fontSize: 14 * scale,
            lineHeight: 22 * scale,
            color: "rgba(255, 255, 255, 0.8)",
            textAlign: "center",
            marginTop: 20 * scale,
            paddingHorizontal: 15 * scale,
        },
        buttonText: {
            fontSize: 18 * scale,
            fontWeight: "800",
            letterSpacing: 0.5,
        }
    });

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ImageBackground
                source={require("../../assets/cinnamonimage.jpg")}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['rgba(5, 20, 10, 0.45)', 'rgba(5, 30, 20, 0.75)', 'rgba(2, 10, 5, 1)']}
                    style={styles.gradient}
                >
                    <ScrollView
                        style={styles.scrollContainer}
                        contentContainerStyle={[
                            styles.contentContainer,
                            dynamicStyles.container
                        ]}
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View
                            style={[
                                styles.animWrapper,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        { translateY: slideAnim },
                                        { scale: scaleAnim }
                                    ],
                                }
                            ]}
                        >
                            {/* Logo with Glass Effect */}
                            <Animated.View style={[
                                styles.logoContainer,
                                {
                                    transform: [{ scale: logoAnim }],
                                    opacity: logoAnim,
                                }
                            ]}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.02)']}
                                    style={styles.logoGlass}
                                >
                                    <View style={styles.logoInnerCircle}>
                                        <Image
                                            source={require("../assets/logo.png")}
                                            style={[styles.logoImage, { width: 75 * scale, height: 75 * scale }]}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </LinearGradient>
                            </Animated.View>

                            {/* Main Branding */}
                            <View style={styles.brandingSection}>
                                <Text style={dynamicStyles.titleText}>Smart Cinnamon</Text>
                                <Text style={dynamicStyles.subtitleText}>Grow With Nature</Text>
                                <View style={styles.accentContainer}>
                                    <View style={styles.accentLine} />
                                    <Ionicons name="leaf" size={18 * scale} color={colors.cinnamonLight} style={styles.accentIcon} />
                                    <View style={styles.accentLine} />
                                </View>
                                <Text style={dynamicStyles.descriptionText}>
                                    Empowering your agricultural journey with intelligent soil analysis and smart cultivation insights.
                                </Text>
                            </View>

                            {/* Interactive Feature Cards */}
                            <View style={[styles.featuresWrapper, { gap: 10 * scale }]}>
                                <FeatureItem
                                    icon="leaf-outline"
                                    title="Eco-friendly Cultivation"
                                    description="Sustainable practices for better yields"
                                    scale={scale}
                                />
                                <FeatureItem
                                    icon="analytics-outline"
                                    title="Precision Analytics"
                                    description="Data-driven insights for optimal growth"
                                    scale={scale}
                                />
                            </View>

                            {/* Primary Action Buttons */}
                            <View style={[styles.actionGroup, { marginTop: 15 * scale }]}>
                                <TouchableOpacity
                                    style={styles.primaryAction}
                                    onPress={() => navigation.navigate("Login")}
                                    activeOpacity={0.85}
                                >
                                    <LinearGradient
                                        colors={["#00b09b", "#96c93d"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.actionGradient}
                                    >
                                        <Text style={[styles.primaryActionText, dynamicStyles.buttonText]}>Log In</Text>
                                        <Ionicons name="arrow-forward" size={22 * scale} color={colors.white} />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.secondaryAction}
                                    onPress={() => navigation.navigate("Signup")}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.secondaryActionInner}>
                                        <Text style={[styles.secondaryActionText, dynamicStyles.buttonText]}>Create New Account</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                        </Animated.View>
                    </ScrollView>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

function FeatureItem({ icon, title, description, scale }) {
    return (
        <View style={styles.glassCard}>
            <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.01)']}
                style={[styles.cardInner, { padding: 16 * scale }]}
            >
                <View style={[styles.iconBox, { width: 48 * scale, height: 48 * scale, borderRadius: 24 * scale }]}>
                    <Ionicons name={icon} size={24 * scale} color="#A7F3D0" />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { fontSize: 16 * scale }]}>{title}</Text>
                    <Text style={[styles.cardDesc, { fontSize: 13 * scale }]}>{description}</Text>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    backgroundImage: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    animWrapper: {
        width: "100%",
        alignItems: "center",
        maxWidth: 500,
    },
    logoContainer: {
        marginBottom: 25,
        ...Platform.select({
            ios: {
                shadowColor: "#A7F3D0",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            }
        })
    },
    logoGlass: {
        padding: 18,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    logoInnerCircle: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 30,
        padding: 10,
    },
    logoImage: {
    },
    brandingSection: {
        alignItems: "center",
        marginBottom: 35,
        paddingHorizontal: 25,
    },
    accentContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        marginBottom: 5,
    },
    accentLine: {
        width: 30,
        height: 1,
        backgroundColor: "rgba(167, 243, 208, 0.4)",
    },
    accentIcon: {
        paddingHorizontal: 10,
    },
    featuresWrapper: {
        width: "90%",
        marginBottom: 20,
    },
    glassCard: {
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    cardInner: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconBox: {
        backgroundColor: "rgba(167, 243, 208, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: colors.white,
        fontWeight: "700",
        marginBottom: 3,
    },
    cardDesc: {
        color: "rgba(255,255,255,0.55)",
        fontWeight: "400",
    },
    actionGroup: {
        width: "85%",
        gap: 16,
    },
    primaryAction: {
        width: "100%",
        borderRadius: 18,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: "#00b09b",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            }
        })
    },
    actionGradient: {
        height: 60,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    primaryActionText: {
        color: colors.white,
    },
    secondaryAction: {
        height: 60,
        borderRadius: 18,
        overflow: "hidden",
    },
    secondaryActionInner: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryActionText: {
        color: "rgba(255,255,255,0.9)",
    },
});
