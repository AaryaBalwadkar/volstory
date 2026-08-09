import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { colors, fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export interface FollowingUser {
  id: string;
  name: string;
  profileImageUrl?: string;
  bio?: string;
  followsYouBack?: boolean;
}

export interface FollowingBottomSheetProps {
  bottomSheetRef: React.Ref<BottomSheetModal>;
  users: FollowingUser[];
  currentUserId: string;
  isLoading: boolean;
  onLoadMore?: () => void;
  onUnfollow?: (userId: string) => void;
}

/**
 * FollowingBottomSheet - Displays paginated list of users being followed
 * Allows unfollow action directly from the sheet
 */
export function FollowingBottomSheet({
  bottomSheetRef,
  users,
  currentUserId,
  isLoading,
  onLoadMore,
  onUnfollow,
}: FollowingBottomSheetProps) {
  const snapPoints = useMemo(() => ["25%", "85%"], []);

  const handleEndReached = useCallback(() => {
    if (!isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [isLoading, onLoadMore]);

  const renderFollowingCard = useCallback(
    ({ item }: { item: FollowingUser }) => {
      return (
        <View style={styles.followingCard}>
          {/* Avatar & Info */}
          <View style={styles.followingInfo}>
            <Image
              source={{
                uri:
                  item.profileImageUrl ||
                  `https://ui-avatars.com/api/?name=${item.name}`,
              }}
              style={styles.avatar}
            />
            <View style={styles.textContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.followingName}>{item.name}</Text>
                {item.followsYouBack && (
                  <View style={styles.mutualBadge}>
                    <Text style={styles.mutualBadgeText}>Follows back</Text>
                  </View>
                )}
              </View>
              {item.bio && (
                <Text style={styles.bio} numberOfLines={1}>
                  {item.bio}
                </Text>
              )}
            </View>
          </View>

          {/* Unfollow Button */}
          <TouchableOpacity
            style={styles.unfollowButton}
            onPress={() => onUnfollow?.(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark"
              size={16}
              color={colors.neutral.gray}
            />
          </TouchableOpacity>
        </View>
      );
    },
    [onUnfollow],
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Following</Text>
          <Text style={styles.followingCount}>{users.length}</Text>
        </View>

        {/* Following List */}
        <FlatList
          data={users}
          renderItem={renderFollowingCard}
          keyExtractor={(item) => item.id}
          scrollEnabled
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color={colors.primary.DEFAULT}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="person-outline"
                  size={48}
                  color={colors.neutral.light}
                />
                <Text style={styles.emptyText}>Not following anyone yet</Text>
              </View>
            ) : null
          }
          contentContainerStyle={styles.listContent}
        />
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.DEFAULT,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightest,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.neutral.DEFAULT,
  },
  followingCount: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.neutral.gray,
  },
  bottomSheetBackground: {
    backgroundColor: colors.surface.DEFAULT,
  },
  handleIndicator: {
    backgroundColor: colors.neutral.lightest,
    width: 48,
    height: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  followingCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightest,
  },
  followingInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: colors.surface.gray,
  },
  textContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  followingName: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.neutral.DEFAULT,
    marginRight: 8,
    flex: 1,
  },
  mutualBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.primary.lightest,
    borderRadius: 4,
  },
  mutualBadgeText: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    color: colors.primary.DEFAULT,
  },
  bio: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.neutral.light,
  },
  unfollowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral.lightest,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.gray,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.neutral.light,
    marginTop: 8,
    textAlign: "center",
  },
});
