import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Head from "expo-router/head";

import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { colors } from "@/constants/theme";
import { IconWithBadge } from "@/src/components/icons/IconWithBadge";
import { TabIcon } from "@/src/components/icons/TabIcon";
import { ActionModal } from "@/src/components/ui/ActionModal";
import { useAuthStore } from "@/src/features/auth/stores/auth.store";
import { ArticleAuthorBlock } from "@/src/features/story/components/ArticleAuthorBlock";
import { ArticleBannerImage } from "@/src/features/story/components/ArticleBannerImage";
import { StoryCommentsSheet } from "@/src/features/story/components/StoryCommentsSheet";
import { useStoryActions } from "@/src/features/story/hooks/useStoryActions";
import { useStoryArticle } from "@/src/features/story/hooks/useStoryArticle";
import { useStoryStore } from "@/src/features/story/stores/storyStore";
import { formatAuthorSlug } from "@/src/features/story/utils/storyUrlUtils";

/**
 * Renders the public story article detail screen.
 *
 * @returns The story article screen.
 */
export default function StoryArticleScreen() {
  const { author, slug } = useLocalSearchParams<{
    author: string;
    slug: string;
  }>();
  const { story, isLoading, error, updateStoryLike, trackArticleRead } =
    useStoryArticle(slug);
  const { user } = useAuthStore();
  const { toggleLike } = useStoryActions();
  const { updateLikeState } = useStoryStore();
  const insets = useSafeAreaInsets();
  const [showAuthWall, setShowAuthWall] = useState(false);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (story) {
      const canonicalAuthorSegment = `@${formatAuthorSlug(story.author.name)}`;
      if (author !== canonicalAuthorSegment) {
        router.replace(`/${canonicalAuthorSegment}/${slug}`);
      }
    }
  }, [story, author, slug]);

  const isAuthor = story && user ? story.author.id === user.userId : false;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    // Calculate if scrolled 80% down the article
    const scrolledPercentage =
      (layoutMeasurement.height + contentOffset.y) / contentSize.height;
    if (scrolledPercentage > 0.8) {
      trackArticleRead();
    }
  };

  const handleLike = useCallback(async () => {
    if (!user) {
      setShowAuthWall(true);
      return;
    }
    if (!story) return;

    const currentIsLiked = story.isLiked;
    const currentLikeCount = story.likeCount;
    const optimisticIsLiked = !currentIsLiked;
    const optimisticCount = optimisticIsLiked
      ? currentLikeCount + 1
      : currentLikeCount - 1;

    updateStoryLike(optimisticCount, optimisticIsLiked);
    updateLikeState(story.id, optimisticCount, optimisticIsLiked);

    const result = await toggleLike(story.id);
    if (result) {
      const finalIsLiked = result.isLiked ?? optimisticIsLiked;
      updateStoryLike(result.likeCount, finalIsLiked);
      updateLikeState(story.id, result.likeCount, finalIsLiked);
    } else {
      updateStoryLike(currentLikeCount, currentIsLiked);
      updateLikeState(story.id, currentLikeCount, currentIsLiked);
    }
  }, [story, updateStoryLike, updateLikeState, toggleLike, user]);

  const openComments = useCallback(() => {
    if (!user) {
      setShowAuthWall(true);
      return;
    }
    bottomSheetRef.current?.present();
  }, [user]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (error || !story) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-center text-body text-neutral-gray">
          {error || "Unable to load the story. It may have been removed."}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="mt-6 rounded-2xl bg-surface-gray px-6 py-3"
        >
          <Text className="font-nunito-semibold text-neutral">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <ActionModal
        visible={showAuthWall}
        title="Login Required"
        message="Please log in or create an account to interact with stories."
        actionLabel="Go to Login"
        onAction={() => {
          setShowAuthWall(false);
          router.push("/(auth)/login");
        }}
        secondaryLabel="Cancel"
        onSecondary={() => setShowAuthWall(false)}
      />
      <Head>
        <title>{story.title} - Volstory</title>
        <meta name="description" content={story.excerpt} />
      </Head>
      {isAuthor && (
        <View className="flex-row items-center justify-end gap-2 px-4 py-3">
          <Pressable
            accessibilityRole="button"
            className="rounded-full bg-surface-gray p-2"
          >
            <TabIcon name="edit" size={18} color={colors.primary.DEFAULT} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="rounded-full bg-surface-gray p-2"
          >
            <TabIcon name="trash" size={18} color={colors.error} />
          </Pressable>
        </View>
      )}

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 20, 80),
        }}
        scrollEventThrottle={400}
        onScroll={handleScroll}
      >
        <ArticleAuthorBlock
          name={story.author.name}
          createdAt={story.createdAt}
          eventTimeframe={story.eventTimeframe}
        />
        <Text className="mb-4 font-nunito-bold text-heading text-neutral">
          {story.title}
        </Text>

        {story.bannerImageUrl ? (
          <ArticleBannerImage uri={story.bannerImageUrl} />
        ) : null}

        <Text className="mb-8 text-body text-neutral-dark">
          {story.bodyMarkdown}
        </Text>
        <View className="mb-8 flex-row items-center justify-end gap-2 rounded-2xl bg-surface-gray px-4 py-3">
          <Pressable accessibilityRole="button" onPress={openComments}>
            <IconWithBadge
              iconName="message"
              count={story.commentCount}
              color={colors.neutral.light}
            />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={handleLike}>
            <IconWithBadge
              iconName="pray"
              count={story.likeCount}
              color={
                story.isLiked ? colors.primary.DEFAULT : colors.neutral.light
              }
            />
          </Pressable>
        </View>
      </ScrollView>

      <StoryCommentsSheet
        ref={bottomSheetRef}
        storyId={story.id}
        commentCount={story.commentCount}
      />
    </View>
  );
}
