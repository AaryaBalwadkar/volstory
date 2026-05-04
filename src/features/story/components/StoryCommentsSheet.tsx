import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Keyboard, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";

import { colors } from "@/constants/theme";

import { useComments } from "../hooks/useComments";

import { CommentInputBar } from "./CommentInputBar";
import { CommentItem } from "./CommentItem";

interface StoryCommentsSheetProps {
  storyId: string;
  commentCount: number;
}

const handleIndicatorStyle = {
  backgroundColor: colors.neutral.lightest,
  width: 40,
};

const backgroundStyle = {
  borderRadius: 24,
  backgroundColor: colors.surface.DEFAULT,
};

export const StoryCommentsSheet = forwardRef<
  BottomSheetModal,
  StoryCommentsSheetProps
>(({ storyId, commentCount }, ref) => {
  const snapPoints = useMemo(() => ["90%"], []);
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    userName: string;
  } | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const lastFetchMoreRef = useRef(0);
  const contentContainerStyle = useMemo(
    () => ({
      padding: 16,
      paddingBottom: Math.max(120 + insets.bottom, keyboardHeight + 32),
    }),
    [insets.bottom, keyboardHeight],
  );

  const {
    comments,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    addComment,
    toggleLike,
  } = useComments(storyId);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
      />
    ),
    [],
  );

  const handleReply = useCallback((commentId: string, userName: string) => {
    setReplyingTo({ commentId, userName });
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleSubmit = useCallback(
    async (content: string) => {
      if (replyingTo) {
        await addComment({ content, parentId: replyingTo.commentId });
        setReplyingTo(null);
      } else {
        await addComment({ content });
      }
    },
    [addComment, replyingTo],
  );

  const handleEndReached = useCallback(() => {
    const now = Date.now();
    if (now - lastFetchMoreRef.current < 700) return;
    lastFetchMoreRef.current = now;
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <CommentInputBar
          onSubmit={handleSubmit}
          replyingToUser={replyingTo?.userName}
          onCancelReply={handleCancelReply}
        />
      </BottomSheetFooter>
    ),
    [handleCancelReply, handleSubmit, replyingTo?.userName],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      handleIndicatorStyle={handleIndicatorStyle}
      backgroundStyle={backgroundStyle}
      footerComponent={renderFooter}
    >
      <View className="flex-1">
        <View className="border-b border-surface-gray px-4 py-3">
          <Text className="font-nunito-bold text-lg text-neutral">
            {commentCount} comments
          </Text>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          </View>
        ) : (
          <BottomSheetFlatList
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                onReply={handleReply}
                onLike={toggleLike}
              />
            )}
            contentContainerStyle={contentContainerStyle}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary.DEFAULT}
                  className="my-4"
                />
              ) : null
            }
            ListEmptyComponent={
              <View className="mt-8 items-center justify-center">
                <Text className="font-nunito text-neutral-gray">
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            }
          />
        )}
      </View>
    </BottomSheetModal>
  );
});

StoryCommentsSheet.displayName = "StoryCommentsSheet";
