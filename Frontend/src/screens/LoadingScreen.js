
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';

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

        // Navigate to Splash screen after 3 seconds
        const timer = setTimeout(() => {
            navigation.replace('Splash');
        }, 3000);

        return () => {
            pulseAnimation.stop();
            clearTimeout(timer);
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
