
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

const LoadingScreen = ({ navigation }) => {
    const spinValue = new Animated.Value(0);
    const pulseValue = new Animated.Value(1);

    useEffect(() => {
        // Rotation Animation
        const spinAnimation = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

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

        spinAnimation.start();
        pulseAnimation.start();

        // Navigate to Splash screen after 3 seconds
        const timer = setTimeout(() => {
            navigation.replace('Splash');
        }, 3000);

        return () => {
            spinAnimation.stop();
            pulseAnimation.stop();
            clearTimeout(timer);
        };
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

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
                            styles.iconContainer,
                            {
                                transform: [{ scale: pulseValue }, { rotate: spin }],
                            },
                        ]}
                    >
                        <MaterialCommunityIcons name="loading" size={80} color={colors.white} />
                    </Animated.View>

                    <Animated.Text
                        style={[
                            styles.loadingText,
                            {
                                opacity: pulseValue, // Pulse the text opacity slightly
                            }
                        ]}
                    >
                        Loading
                    </Animated.Text>
                    <Text style={styles.subText}>Please wait a moment...</Text>
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
    iconContainer: {
        marginBottom: 30,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    loadingText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 10,
        letterSpacing: 1.5,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
});

export default LoadingScreen;
