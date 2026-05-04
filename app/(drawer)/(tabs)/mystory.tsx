import React from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";

import { colors } from "@/constants/theme";
import { TabIcon } from "@/src/components/icons/TabIcon";
import { useAuthStore } from "@/src/features/auth/stores/auth.store";
import StoriesScreen from "@/src/features/story/screens/StoriesScreen";

/**
 * Renders the signed-in user's story feed.
 *
 * @returns The my story tab screen.
 */
export default function MyStoryScreen() {
  const { user } = useAuthStore();

  return (
    <View className="flex-1">
      <StoriesScreen authorId={user ? "me" : undefined} />
      {user?.userId ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add new story"
          accessibilityHint="Opens the create story screen"
          onPress={() => router.push("/(drawer)/(tabs)/create")}
          className="absolute bottom-4 right-6 h-16 w-16 items-center justify-center rounded-full bg-surface-yellow shadow-lg"
        >
          <TabIcon name="plus" size={48} color={colors.neutral.white} />
        </Pressable>
      ) : null}
    </View>
  );
}
