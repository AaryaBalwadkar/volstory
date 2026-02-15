import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { configureGoogleSignIn } from "@/src/config/google";
import { useAuthStore } from "@/src/features/auth/stores/auth.store";

import "@/global.css";

// 1. Configure Native SDKs immediately (Outside component = Performance Win)
configureGoogleSignIn();
SplashScreen.preventAutoHideAsync();

// Initialize Query Client once
const queryClient = new QueryClient();

/**
 * **Root Layout (Entry Point)**
 *
 * This is the top-level component that wraps the entire application.
 * It handles global initializations including:
 * - Font Loading (Nunito).
 * - Authentication State Hydration (checking if user is logged in).
 * - Query Client Setup (TanStack Query).
 * - Splash Screen Management.
 *
 * @component
 * @returns {JSX.Element} The root provider tree and navigation stack.
 */
export default function RootLayout() {
  // --- 1. ALL HOOKS MUST BE AT THE TOP (Unconditional) ---

  // Hook A: Load Fonts
  const [fontsLoaded] = useFonts({
    "Nunito-Regular": Nunito_400Regular,
    "Nunito-SemiBold": Nunito_600SemiBold,
    "Nunito-Bold": Nunito_700Bold,
  });

  // Hook B: Auth Store
  const { hydrate, isAuthenticated } = useAuthStore();

  // Hook C: Local State
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Hook D: Hydrate Auth on Mount
  useEffect(() => {
    const initAuth = async () => {
      await hydrate();
      setIsAuthReady(true);
    };
    initAuth();
  }, [hydrate]);

  // Hook E: Hide Splash Screen when EVERYTHING is ready
  useEffect(() => {
    if (fontsLoaded && isAuthReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthReady]);

  // --- 2. CONDITIONAL RETURNS ---

  // If fonts or auth are not ready, show nothing (Splash screen handles this visually)
  if (!fontsLoaded || !isAuthReady) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#01A39F" />
      </View>
    );
  }

  // --- 3. RENDER APP ---
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(drawer)" />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
