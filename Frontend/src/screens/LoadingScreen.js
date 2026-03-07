
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';

import { auth } from "../config/vacant/firebase";
import { onAuthStateChanged } from "firebase/auth";

const { width } = Dimensions.get('window');

const LoadingScreen = ({ navigation }) => {
    const pulseValue = new Animated.Value(1);

    useEffect(() => {
        // Pulse Animation
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseValue, {
                    toValue: 1.2,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        );

        pulseAnimation.start();

        // Check Firebase Auth State
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // Keep the loading screen for at least 1.5 seconds for branding
            const timer = setTimeout(() => {
                if (user) {
                    navigation.replace('Main');
                } else {
                    navigation.replace('Splash');
                }
            }, 1500);

            return () => clearTimeout(timer);
        });

        return () => {
            pulseAnimation.stop();
            unsubscribe();
        };
    }, []);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.primaryDark, colors.primary, colors.primaryDark]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.contentContainer}>
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                transform: [{ scale: pulseValue }],
                            },
                        ]}
                    >
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    logo: {
        width: 120,
        height: 120,
    },
});

export default LoadingScreen;
