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
            paddingBottom: Math.max(insets.bottom, 10),
            paddingLeft: insets.left,
            paddingRight: insets.right,
        },
        titleText: {
            fontSize: 36 * scale,
            fontWeight: "900",
            color: colors.white,
            textAlign: "center",
            letterSpacing: -1,
            textShadowColor: "rgba(0, 0, 0, 0.3)",
            textShadowOffset: { width: 0, height: 4 },
            textShadowRadius: 10,
        },
        subtitleText: {
            fontSize: 14 * scale,
            fontWeight: "700",
            color: colors.cinnamonLight,
            textAlign: "center",
            marginTop: 2 * scale,
            letterSpacing: 2,
            textTransform: "uppercase",
        },
        descriptionText: {
            fontSize: 13 * scale,
            lineHeight: 20 * scale,
            color: "rgba(255, 255, 255, 0.8)",
            textAlign: "center",
            marginTop: 10 * scale,
            paddingHorizontal: 15 * scale,
        },
        buttonText: {
            fontSize: 16 * scale,
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
                    colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
                    style={styles.gradient}
                >
                    <ScrollView
                        style={styles.scrollContainer}
                        contentContainerStyle={[
                            styles.contentContainer,
                            dynamicStyles.container
                        ]}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={height < 700}
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
                                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                                    style={styles.logoGlass}
                                >
                                    <Image
                                        source={require("../assets/logo.png")}
                                        style={[styles.logoImage, { width: 70 * scale, height: 70 * scale }]}
                                        resizeMode="contain"
                                    />
                                </LinearGradient>
                            </Animated.View>

                            {/* Main Branding */}
                            <View style={styles.brandingSection}>
                                <Text style={dynamicStyles.titleText}>Smart Cinnamon</Text>
                                <Text style={dynamicStyles.subtitleText}>Elite Agricultural Intelligence</Text>
                                <View style={styles.accentLine} />
                                <Text style={dynamicStyles.descriptionText}>
                                    Pioneering the future of premium cinnamon cultivation through advanced real-time soil analytics.
                                </Text>
                            </View>

                            {/* Interactive Feature Cards */}
                            <View style={[styles.featuresWrapper, { gap: 10 * scale }]}>
                                <FeatureItem
                                    icon="analytics-outline"
                                    title="Precision Monitoring"
                                    description="Real-time soil health & matrix analysis"
                                    scale={scale}
                                />
                                <FeatureItem
                                    icon="bulb-outline"
                                    title="Smart Recommendations"
                                    description="AI-driven insights for optimal yields"
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
                                        colors={[colors.cinnamon, colors.cinnamonDark]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.actionGradient}
                                    >
                                        <Text style={[styles.primaryActionText, dynamicStyles.buttonText]}>Get Started</Text>
                                        <Ionicons name="arrow-forward" size={20 * scale} color={colors.white} />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.secondaryAction}
                                    onPress={() => navigation.navigate("Signup")}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.secondaryActionText, dynamicStyles.buttonText]}>Create Account</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Refined Footer */}
                            <View style={styles.premiumFooter}>
                                <View style={styles.footerDivider} />
                                <Text style={styles.footerTagline}>RELIABLE • SUSTAINABLE • INNOVATIVE</Text>
                                <View style={styles.footerDivider} />
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
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)']}
                style={[styles.cardInner, { padding: 12 * scale }]}
            >
                <View style={[styles.iconBox, { width: 44 * scale, height: 44 * scale, borderRadius: 22 * scale }]}>
                    <Ionicons name={icon} size={24 * scale} color={colors.cinnamonLight} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { fontSize: 14 * scale }]}>{title}</Text>
                    <Text style={[styles.cardDesc, { fontSize: 12 * scale }]}>{description}</Text>
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
        marginBottom: 15,
        ...Platform.select({
            ios: {
                shadowColor: colors.cinnamon,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.35,
                shadowRadius: 18,
            },
            android: {
                elevation: 12,
            }
        })
    },
    logoGlass: {
        padding: 15,
        borderRadius: 25,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.25)",
        backgroundColor: "rgba(255,255,255,0.05)",
    },
    logoImage: {
    },
    brandingSection: {
        alignItems: "center",
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    accentLine: {
        width: 45,
        height: 3,
        backgroundColor: colors.cinnamon,
        borderRadius: 2,
        marginTop: 10,
    },
    featuresWrapper: {
        width: "90%",
        marginBottom: 15,
    },
    glassCard: {
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    cardInner: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconBox: {
        backgroundColor: "rgba(210,105,30,0.18)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        color: colors.white,
        fontWeight: "800",
        marginBottom: 4,
    },
    cardDesc: {
        color: "rgba(255,255,255,0.6)",
        fontWeight: "400",
    },
    actionGroup: {
        width: "90%",
        gap: 12,
    },
    primaryAction: {
        width: "100%",
        borderRadius: 15,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: colors.cinnamon,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.45,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            }
        })
    },
    actionGradient: {
        height: 52,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    primaryActionText: {
        color: colors.white,
    },
    secondaryAction: {
        height: 52,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.35)",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    secondaryActionText: {
        color: colors.white,
    },
    premiumFooter: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        paddingHorizontal: 35,
        opacity: 0.4,
    },
    footerDivider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.white,
    },
    footerTagline: {
        fontSize: 9,
        color: colors.white,
        fontWeight: "700",
        paddingHorizontal: 15,
        letterSpacing: 2,
    },
});