import React, { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { ScreenWrapper } from "@/src/components/layout/ScreenWrapper";
import { ActionModal } from "@/src/components/ui/ActionModal";
import { useAuthStore } from "@/src/features/auth/stores/auth.store";

/**
 * Interface defining the props for the reusable SettingRow component.
 */
interface SettingRowProps {
  /** The icon name from the Ionicons set to display on the left. */
  icon: keyof typeof Ionicons.glyphMap;
  /** The text label for the setting option. */
  label: string;
  /** If true, renders the text and icon in red to indicate a dangerous action (e.g., Logout). */
  isDestructive?: boolean;
  /** If true, renders a Switch toggle instead of a chevron. */
  isSwitch?: boolean;
  /** The current value of the Switch (only used if isSwitch is true). */
  value?: boolean;
  /** Callback function when the Switch is toggled (only used if isSwitch is true). */
  onToggle?: (value: boolean) => void;
  /** Callback function when the row is pressed (ignored if isSwitch is true). */
  onPress?: () => void;
}

/**
 * A reusable row component for displaying a single setting option.
 *
 * @param {SettingRowProps} props - The configuration props for the row.
 * @returns {JSX.Element} A touchable row with an icon, label, and either a chevron or switch.
 */
const SettingRow = ({
  icon,
  label,
  isDestructive = false,
  isSwitch = false,
  value,
  onToggle,
  onPress,
}: SettingRowProps) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityHint={
      isSwitch ? "Toggles this setting" : "Activates this option"
    }
    activeOpacity={isSwitch ? 1 : 0.7}
    onPress={isSwitch ? undefined : onPress}
    className="flex-row items-center justify-between border-b border-gray-100 py-4"
  >
    <View className="flex-row items-center">
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          isDestructive ? "bg-red-50" : "bg-gray-50"
        }`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isDestructive ? "#FF3B30" : "#01A39F"}
        />
      </View>
      <Text
        className={`ml-4 font-nunito-bold text-base ${
          isDestructive ? "text-red-500" : "text-neutral-black"
        }`}
      >
        {label}
      </Text>
    </View>

    {isSwitch ? (
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#E5E5EA", true: "#01A39F" }}
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    )}
  </TouchableOpacity>
);

/**
 * **Settings Screen**
 *
 * The main configuration interface for the user. It allows management of:
 * - Account details (Profile, Password, Privacy).
 * - App Preferences (Notifications, Language).
 * - Support & Legal (Help Center, Terms).
 * - Session Management (Logout).
 *
 * @component
 * @example
 * // Utilized via Expo Router
 * router.push('/(drawer)/settings');
 *
 * @returns {JSX.Element} The rendered Settings Screen wrapper.
 */
const SettingsScreen = () => {
  const router = useRouter();
  const { logout } = useAuthStore();

  // --- Local State ---
  const [notifications, setNotifications] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  /**
   * Handles the logout process.
   * Displays a confirmation alert before clearing the session and redirecting.
   */
  // 1. Open the modal
  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  // 2. Perform the actual action
  const confirmLogout = () => {
    setLogoutModalVisible(false);
    // Small delay to allow animation to finish
    setTimeout(() => {
      logout();
      router.replace("/(auth)/login");
    }, 200);
  };

  return (
    <ScreenWrapper bg="#FFFFFF">
      {/* Using StyleSheet for contentContainerStyle is required to:
        1. Satisfy 'react-native/no-inline-styles' linter rule.
        2. Provide correct typing for the ScrollView prop.
      */}
      <ActionModal
        visible={logoutModalVisible}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        actionLabel="Log Out"
        onAction={confirmLogout}
        secondaryLabel="Cancel"
        onSecondary={() => setLogoutModalVisible(false)}
      />

      <ScrollView className="flex-1">
        <View className="m-10 bg-black pt-5">
          {/* SECTION 1: ACCOUNT */}
          <Text className="mb-2 ml-10 mt-2 pl-10 font-nunito-bold text-xs uppercase text-gray-400">
            Account
          </Text>
          <SettingRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => {
              /* TODO: Navigate to Edit Profile */
            }}
          />
          <SettingRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => {
              /* TODO: Navigate to Change Password */
            }}
          />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Privacy & Security"
            onPress={() => {
              /* TODO: Navigate to Privacy */
            }}
          />

          {/* SECTION 2: PREFERENCES */}
          <Text className="mb-2 mt-8 font-nunito-bold text-xs uppercase text-gray-400">
            Preferences
          </Text>
          <SettingRow
            icon="notifications-outline"
            label="Push Notifications"
            isSwitch
            value={notifications}
            onToggle={() => setNotifications(!notifications)}
          />
          <SettingRow
            icon="language-outline"
            label="Language"
            onPress={() => {
              /* TODO: Open Language Picker */
            }}
          />

          {/* SECTION 3: SUPPORT */}
          <Text className="mb-2 mt-8 font-nunito-bold text-xs uppercase text-gray-400">
            Support
          </Text>
          <SettingRow
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => {
              /* TODO: Navigate to Help */
            }}
          />
          <SettingRow
            icon="document-text-outline"
            label="Terms & Conditions"
            onPress={() => {
              /* TODO: Navigate to Terms */
            }}
          />

          {/* LOGOUT */}
          <View className="mb-10 mt-8">
            <SettingRow
              icon="log-out-outline"
              label="Log Out"
              isDestructive
              onPress={handleLogout}
            />
          </View>

          <Text className="pb-10 text-center text-xs text-gray-400">
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default SettingsScreen;
