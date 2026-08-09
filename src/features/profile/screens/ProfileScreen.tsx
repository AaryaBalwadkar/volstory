import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";

import { colors } from "@/constants/theme";

import { FollowListBottomSheet } from "../components/FollowListBottomSheet";
import { ProfileActionButton } from "../components/ProfileActionButton";
import { ProfileDetails } from "../components/ProfileDetails";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileStats } from "../components/ProfileStats";
import { SkillChip } from "../components/SkillChip";
import { useMyProfile } from "../hooks/useProfile";

/**
 * **Profile Screen**
 * Shows the authenticated user's own private profile.
 * All sensitive data (phone, email) is always visible here.
 */
export default function ProfileScreen() {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMyProfile();

  const followersSheetRef = useRef<BottomSheet>(null);
  const followingSheetRef = useRef<BottomSheet>(null);
  const [activeSheet, setActiveSheet] = useState<"followers" | "following">(
    "followers",
  );

  const openSheet = (mode: "followers" | "following") => {
    setActiveSheet(mode);
    if (mode === "followers") {
      followersSheetRef.current?.expand();
    } else {
      followingSheetRef.current?.expand();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-center text-neutral-light">
          Unable to load profile. Pull down to retry.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-surface"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary.DEFAULT}
          />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Avatar, Name, Gender */}
        <ProfileHeader
          name={profile.name}
          gender={profile.gender}
          profileImageUrl={profile.profileImageUrl}
          isEditable={false} // Photo editing happens in EditProfileScreen
        />

        {/* Followers / Following stats */}
        <ProfileStats
          followersCount={profile.followersCount}
          followingCount={profile.followingCount}
          onFollowersPress={() => openSheet("followers")}
          onFollowingPress={() => openSheet("following")}
        />

        {/* Edit Profile button (always owner here) */}
        <ProfileActionButton
          targetUserId={profile.id}
          isOwner={true}
          isFollowing={false}
        />

        <View className="mx-4 mt-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Find people to follow"
            onPress={() => router.push("/(drawer)/(tabs)/profile/search")}
            className="flex-row items-center justify-center rounded-xl py-3"
            style={{ backgroundColor: colors.surface.gray }}
          >
            <Ionicons name="search" size={18} color={colors.primary.DEFAULT} />
            <Text
              className="ml-2 font-nunito-bold text-sm"
              style={{ color: colors.primary.DEFAULT }}
            >
              Find People
            </Text>
          </Pressable>
        </View>

        {/* Bio, City, Phone, Email, Website */}
        <ProfileDetails
          bio={profile.bio}
          phoneNumber={profile.phoneNumber}
          email={profile.email}
          website={profile.website}
          city={profile.city}
        />

        {/* Skills */}
        {profile.skillsets.length > 0 && (
          <View
            className="mx-4 mt-4 rounded-2xl bg-surface p-4"
            style={{ borderWidth: 1, borderColor: colors.neutral.lightest }}
          >
            <Text className="mb-2 font-nunito-bold text-base text-neutral">
              Skills
            </Text>
            <View className="flex-row flex-wrap">
              {profile.skillsets.map((skill) => (
                <SkillChip key={skill} label={skill} />
              ))}
            </View>
          </View>
        )}

        {/* Interests */}
        {profile.interests.length > 0 && (
          <View
            className="mx-4 mt-4 rounded-2xl bg-surface p-4"
            style={{ borderWidth: 1, borderColor: colors.neutral.lightest }}
          >
            <Text className="mb-2 font-nunito-bold text-base text-neutral">
              Interests
            </Text>
            <View className="flex-row flex-wrap">
              {profile.interests.map((interest) => (
                <SkillChip key={interest} label={interest} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Followers Bottom Sheet */}
      <FollowListBottomSheet
        userId={profile.id}
        mode="followers"
        sheetRef={followersSheetRef}
      />

      {/* Following Bottom Sheet */}
      <FollowListBottomSheet
        userId={profile.id}
        mode="following"
        sheetRef={followingSheetRef}
      />
    </>
  );
}
