import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Tabs } from "expo-router";

import { colors, fonts } from "@/constants/theme";
import { TabIcon } from "@/src/components/icons/TabIcon";
import { CustomHeader } from "@/src/components/navigation/CustomHeader";
import { ActionModal } from "@/src/components/ui/ActionModal";
import { useAuthStore } from "@/src/features/auth/stores/auth.store";

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
 * - **Brand Styling:** Applies the theme color scheme and typography.
 *
 * @component
 * @example
 * // This layout is automatically mounted by Expo Router when navigating to /(tabs)
 *
 * @returns {JSX.Element} The configured Bottom Tab Navigator.
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [showAuthWall, setShowAuthWall] = useState(false);

  const requireAuth = (event: { preventDefault: () => void }) => {
    if (!user) {
      event.preventDefault();
      setShowAuthWall(true);
    }
  };

  return (
    <>
      <ActionModal
        visible={showAuthWall}
        title="Login Required"
        message="Please log in or create an account to access this feature."
        actionLabel="Go to Login"
        onAction={() => {
          setShowAuthWall(false);
          router.push("/(auth)/login");
        }}
        secondaryLabel="Cancel"
        onSecondary={() => setShowAuthWall(false)}
      />

      <Tabs
        screenOptions={{
          header: () => <CustomHeader />,
          tabBarStyle: {
            backgroundColor: colors.surface.DEFAULT,
            borderTopColor: colors.neutral.lightest,
            borderTopWidth: 1,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 5 : 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: colors.primary.DEFAULT,
          tabBarInactiveTintColor: colors.neutral.light,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontFamily: fonts.bold,
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
          listeners={{ tabPress: requireAuth }}
          options={{
            title: "Create",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name="create"
                color={color}
                size={30}
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          listeners={{ tabPress: requireAuth }}
          options={{
            title: "Notifications",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="notifications" color={color} focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          listeners={{ tabPress: requireAuth }}
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="profile" color={color} focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="[author]/[slug]"
          options={{
            href: null,
            header: () => <CustomHeader showBackButton={true} />,
          }}
        />
      </Tabs>
    </>
  );
}
