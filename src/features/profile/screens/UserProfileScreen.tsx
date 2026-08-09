import React, { useRef } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomSheet from "@gorhom/bottom-sheet";

import { colors } from "@/constants/theme";
import { useSessionStore } from "@/src/stores/session.store";

import { FollowListBottomSheet } from "../components/FollowListBottomSheet";
import { ProfileActionButton } from "../components/ProfileActionButton";
import { ProfileDetails } from "../components/ProfileDetails";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileStats } from "../components/ProfileStats";
import { SkillChip } from "../components/SkillChip";
import { useUserProfile } from "../hooks/useProfile";

interface Props {
  userId: string;
}

/**
 * **User Profile Screen**
 * Shows a public profile for any user.
 * Respects privacy toggles (backend already filters data).
 * Viewer context (isFollowing, isOwner) is computed by the backend.
 * @param root0
 * @param root0.userId
 */
export default function UserProfileScreen({ userId }: Props) {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useUserProfile(userId);
  const { user: sessionUser } = useSessionStore();

  const followersSheetRef = useRef<BottomSheet>(null);
  const followingSheetRef = useRef<BottomSheet>(null);

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
          User not found or profile is unavailable.
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
        <ProfileHeader
          name={profile.name}
          gender={profile.gender}
          profileImageUrl={profile.profileImageUrl}
          isEditable={false}
        />

        <ProfileStats
          followersCount={profile.followersCount}
          followingCount={profile.followingCount}
          onFollowersPress={() => followersSheetRef.current?.expand()}
          onFollowingPress={() => followingSheetRef.current?.expand()}
        />

        {/* Show Follow/Unfollow button only to logged-in users */}
        {sessionUser ? (
          <ProfileActionButton
            targetUserId={profile.id}
            isOwner={profile.isOwner}
            isFollowing={profile.isFollowing}
          />
        ) : null}

        <ProfileDetails
          bio={profile.bio}
          phoneNumber={profile.phoneNumber}
          email={profile.email}
          website={profile.website}
          city={profile.city}
        />

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

      <FollowListBottomSheet
        userId={profile.id}
        mode="followers"
        sheetRef={followersSheetRef}
      />
      <FollowListBottomSheet
        userId={profile.id}
        mode="following"
        sheetRef={followingSheetRef}
      />
    </>
  );
}
