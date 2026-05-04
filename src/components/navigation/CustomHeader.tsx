import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { DrawerActions, useNavigation } from "@react-navigation/native";

import { colors } from "@/constants/theme";
import { TabIcon } from "@/src/components/icons/TabIcon";

interface CustomHeaderProps {
  showBackButton?: boolean;
}

/**
 * Renders the app header with drawer, back, and quick action controls.
 *
 * @param root0 - Header props.
 * @param root0.showBackButton - Whether to show a back button instead of the drawer menu.
 * @returns The configured custom header.
 */
export const CustomHeader = ({ showBackButton = false }: CustomHeaderProps) => {
  const navigation = useNavigation();
  return (
    <SafeAreaView className="bg-primary shadow-sm" edges={["top"]}>
      {/* Wrapper to fix StatusBar overlap on Android */}
      <View className="flex-row items-center justify-between px-4 pb-4 pt-4">
        {/* LEFT: Menu or Back Button */}
        {showBackButton ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
            onPress={() => router.back()}
          >
            <TabIcon name="back" size={28} color={colors.neutral.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            accessibilityHint="Opens the navigation drawer"
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          >
            <TabIcon name="menu" color={colors.neutral.white} size={28} />
          </TouchableOpacity>
        )}

        {/* RIGHT: Actions (Hidden on back button screens) */}
        {!showBackButton && (
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Search"
              accessibilityHint="Opens story search"
            >
              <TabIcon name="search" size={24} color={colors.neutral.white} />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Options"
              accessibilityHint="Opens header options"
            >
              <TabIcon name="options" size={24} color={colors.neutral.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
