import React from "react";
import { Drawer } from "expo-router/drawer";

import { Ionicons } from "@expo/vector-icons";

import CustomSidebar from "@/src/components/customDrawer/CustomSidebar";
import { CustomHeader } from "@/src/components/navigation/CustomHeader";

/**
 * **Main Drawer Navigation Layout (`(drawer)/_layout.tsx`)**
 *
 * This component acts as the Root Navigator for the authenticated application structure.
 * It wraps the Tab Navigator and other standalone screens (like Settings) within a
 * side-menu drawer interface.
 *
 * **Key Features:**
 * - **Custom Sidebar:** Renders a bespoke `CustomSidebar` component instead of the default list.
 * - **Navigation Hierarchy:**
 * - `(tabs)`: The main application flow (Home, Profile, etc.).
 * - `settings`: A standalone screen accessible via the drawer.
 * - **Styling:** Configures the drawer's width, fonts (Nunito-Bold), and active/inactive color states.
 *
 * @component
 * @example
 * // This layout is automatically mounted by Expo Router
 * // It is typically the parent of the (tabs) folder.
 *
 * @returns {JSX.Element} The configured Drawer Navigator.
 */
const DrawerLayout = () => {
  return (
    <Drawer
      // 1. Use our Custom Sidebar
      drawerContent={(props) => <CustomSidebar {...props} />}
      screenOptions={{
        headerShown: false, // We hide the default drawer header because Tabs have their own
        drawerStyle: {
          backgroundColor: "#ffffff",
          width: 280,
        },
        drawerActiveTintColor: "#01A39F", // Primary Color
        drawerInactiveTintColor: "#8E8E93",
        drawerLabelStyle: {
          fontFamily: "Nunito-Bold",
          fontSize: 16,
        },
      }}
    >
      {/* 2. MAIN APP (The Tabs) */}
      <Drawer.Screen
        name="(tabs)" // This points to the moved (tabs) folder
        options={{
          drawerLabel: "Home",
          title: "Home",
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      {/* 3. SETTINGS SCREEN */}
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: "Settings",
          headerShown: true, // Show header for Settings page
          header: () => <CustomHeader />, // Reuse our custom header
          drawerIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
