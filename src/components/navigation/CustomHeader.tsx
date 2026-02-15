import React from "react";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";

import { TabIcon } from "@/src/components/icons/TabIcon";

/**
 * **Custom Navigation Header**
 *
 * This component replaces the default navigation header to provide a unified, branded
 * top navigation bar across the application.
 *
 * **Key Features:**
 * - **Status Bar Management:** Wraps content in `SafeAreaView` (Top Edge only) to prevent overlap with system indicators.
 * - **Drawer Control:** The left "Menu" button dispatches the `toggleDrawer` action to the root navigator.
 * - **Action Area:** The right side hosts global tools like Search and Filters.
 *
 * @component
 * @example
 * // Used in layout files (e.g., (tabs)/_layout.tsx)
 * header: () => <CustomHeader />
 *
 * @returns {JSX.Element} The rendered header with safe area padding.
 */
export const CustomHeader = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView className="bg-primary shadow-sm" edges={["top"]}>
      {/* Wrapper to fix StatusBar overlap on Android */}
      <View className="flex-row items-center justify-between px-4 pb-4 pt-4">
        {/* LEFT: Menu Button Toggles Drawer */}
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <TabIcon name="menu" color="white" size={28} />
        </TouchableOpacity>

        {/* RIGHT: Actions */}
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity accessibilityRole="button">
            <Ionicons
              name="search"
              size={24}
              color="white"
              contentContainerClassName="mr-4"
            />
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button">
            <Ionicons name="options-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
