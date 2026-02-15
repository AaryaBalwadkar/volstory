import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Tabs } from "expo-router";

import { TabIcon } from "@/src/components/icons/TabIcon";
import { CustomHeader } from "@/src/components/navigation/CustomHeader";

/**
 * **Main Tab Navigation Layout (`(tabs)/_layout.tsx`)**
 *
 * This component acts as the root layout for the authenticated user session.
 * It provides the bottom tab navigation bar and wraps all child routes with
 * a consistent UI structure.
 *
 * **Key Features:**
 * - **Dynamic Safe Area Handling:** Automatically adjusts the tab bar height and padding
 * based on the device's safe area insets (handling notches and home indicators).
 * - **Custom Header:** Replaces the native navigation header with a global `<CustomHeader />`.
 * - **Brand Styling:** Applies the application's color scheme (Teal #01A39F) and typography (Nunito).
 *
 * @component
 * @example
 * // This layout is automatically mounted by Expo Router when navigating to /(tabs)
 *
 * @returns {JSX.Element} The configured Bottom Tab Navigator.
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        header: () => <CustomHeader />,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#E5E5EA",
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#01A39F",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: "Nunito-Bold",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="mystory"
        options={{
          title: "My Story",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="mystory" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="create" color={color} size={30} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="notifications" color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
