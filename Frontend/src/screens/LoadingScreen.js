
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Image, ActivityIndicator, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';

import { auth } from "../config/vacant/firebase";
import { onAuthStateChanged } from "firebase/auth";

const { width, height } = Dimensions.get('window');

const LoadingScreen = ({ navigation }) => {
    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Entrance Animations setup
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        ]).start(() => {
            // Pulse Animation after entrance
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseValue, {
                        toValue: 1.05,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseValue, {
                        toValue: 1,
                        duration: 1200,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        });

        // Check Firebase Auth State
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Keep the loading screen for at least 1.8 seconds for branding
            const timer = setTimeout(() => {
                // Fade out before navigation
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }).start(() => {
                    if (user) {
                        navigation.replace('Main');
                    } else {
                        navigation.replace('Splash');
                    }
                });
            }, 1800);

            return () => clearTimeout(timer);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.cinnamonLight, colors.cinnamon, colors.cinnamonDark, '#5C2E16']}
                locations={[0, 0.4, 0.75, 1]}
                style={styles.gradient}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            >
                {/* Decorative Background Elements */}
                <View style={[styles.circle, styles.circleTopRight]} />
                <View style={[styles.circle, styles.circleBottomLeft]} />

                <Animated.View
                    style={[
                        styles.contentContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { scale: scaleAnim },
                                { translateY: translateY }
                            ],
                        },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                transform: [{ scale: pulseValue }],
                            },
                        ]}
                    >
                        <View style={styles.logoBackground}>
                            <Image
                                source={require('../assets/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                    </Animated.View>

                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.white} />
                        <Text style={styles.loadingText}>Initializing</Text>
                    </View>
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.cinnamonDark,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: width,
    },
    circleTopRight: {
        width: width * 1.5,
        height: width * 1.5,
        top: -width * 0.5,
        right: -width * 0.5,
    },
    circleBottomLeft: {
        width: width * 1.2,
        height: width * 1.2,
        bottom: -width * 0.4,
        left: -width * 0.4,
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    logoContainer: {
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 15,
        marginBottom: 40,
    },
    logoBackground: {
        backgroundColor: 'rgba(224, 224, 224, 0.49)', // Light gray background
        padding: 10,
        borderRadius: 25,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    logo: {
        width: width * 0.35,
        height: width * 0.35,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    loadingText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        letterSpacing: 3,
        textTransform: 'uppercase',
        opacity: 0.9,
    },
});

export default LoadingScreen;
