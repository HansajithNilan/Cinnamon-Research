import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Image,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../styles/colors";

const GeneralSettingsScreen = () => {
    const navigation = useNavigation();
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

    const SettingItem = ({ icon, title, subtitle, onPress, showChevron = true, renderRight }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={styles.settingIconContainer}>
                <Ionicons name={icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {renderRight ? (
                renderRight()
            ) : showChevron ? (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            ) : null}
        </TouchableOpacity>
    );

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: () => navigation.navigate("Login")
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerWrapper}>
                <LinearGradient
                    colors={[colors.primary, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.topBar}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            {/* Optional Back Button if needed, usually hidden on main tabs 
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 15 }}>
                        <Ionicons name="arrow-back" size={24} color={colors.white} />
                    </TouchableOpacity>
                    */}
                            <View>
                                <Text style={styles.greetingText}>Settings</Text>
                                <Text style={styles.brandText}>My Preference</Text>
                            </View>
                        </View>
                        {/* Profile Icon in Header can be removed if we have a profile card below, or kept for consistency */}
                    </View>
                </LinearGradient>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <TouchableOpacity
                        style={styles.profileCard}
                        onPress={() => navigation.navigate("Profile")}
                        activeOpacity={0.9}
                    >
                        <View style={styles.profileHeader}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="person" size={40} color={colors.white} />
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>Cinnamon  User</Text>
                                <Text style={styles.profileEmail}>user@cinnamon.lk</Text>
                            </View>
                            <View style={styles.editButton}>
                                <Ionicons name="chevron-forward" size={20} color={colors.white} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* General Settings */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>General</Text>
                    <View style={styles.sectionContent}>
                        <SettingItem
                            icon="person-outline"
                            title="Personal Information"
                            subtitle="Edit your profile details"
                            onPress={() => { }}
                        />
                        <View style={styles.separator} />
                        <SettingItem
                            icon="notifications-outline"
                            title="Notifications"
                            renderRight={() => (
                                <Switch
                                    trackColor={{ false: "#d1d1d1", true: colors.primary }}
                                    thumbColor={colors.white}
                                    ios_backgroundColor="#d1d1d1"
                                    onValueChange={setNotificationsEnabled}
                                    value={notificationsEnabled}
                                />
                            )}
                        />
                        <View style={styles.separator} />
                        <SettingItem
                            icon="language-outline"
                            title="Language"
                            subtitle="English"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Preferences & Security */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeader}>Security & Support</Text>
                    <View style={styles.sectionContent}>
                        <SettingItem
                            icon="lock-closed-outline"
                            title="Change Password"
                            onPress={() => { }}
                        />
                        <View style={styles.separator} />
                        <SettingItem
                            icon="help-circle-outline"
                            title="Help & Support"
                            onPress={() => navigation.navigate("Guide")} // Example link
                        />
                        <View style={styles.separator} />
                        <SettingItem
                            icon="shield-checkmark-outline"
                            title="Privacy Policy"
                            onPress={() => { }}
                        />
                        <View style={styles.separator} />
                        <SettingItem
                            icon="information-circle-outline"
                            title="About App"
                            subtitle="Version 1.0.0"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background || "#F5F5F5",
    },
    headerWrapper: {
        marginBottom: 0,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 10,
    },
    headerGradient: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    greetingText: {
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
        fontWeight: "500",
    },
    brandText: {
        fontSize: 24,
        color: colors.white,
        fontWeight: "bold",
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        padding: 20,
        marginBottom: 0,
    },
    profileCard: {
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.cinnamonLight, // Or a color valid in your theme
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    editButton: {
        padding: 8,
        backgroundColor: colors.primary,
        borderRadius: 20,
    },
    sectionContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: 10,
        marginLeft: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionContent: {
        backgroundColor: colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: colors.white,
    },
    settingIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light primary
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text,
    },
    settingSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    separator: {
        height: 0.5,
        backgroundColor: colors.border,
        marginLeft: 67, // align with text
    },
    logoutButton: {
        marginHorizontal: 20,
        padding: 16,
        backgroundColor: '#FFE5E5',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutText: {
        color: '#FF3B30',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default GeneralSettingsScreen;
