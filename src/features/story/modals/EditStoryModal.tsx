import React from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/theme";
import { TabIcon } from "@/src/components/icons/TabIcon";

import BannerImageField from "../components/BannerImageField";
import { StoryTextField } from "../components/StoryTextField";
import { useEditStoryForm } from "../hooks/useEditStoryForm";
import { useStoryActions } from "../hooks/useStoryActions";
import { useStoryStore } from "../stores/storyStore";
import { StoryDetail } from "../types/story.types";

interface Props {
  visible: boolean;
  story: StoryDetail | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Renders a modal for editing an existing story.
 *
 * @param root0 - Edit story modal props.
 * @param root0.visible - Whether the modal is visible.
 * @param root0.story - Story detail being edited.
 * @param root0.onClose - Callback to close the modal.
 * @param root0.onSuccess - Optional callback after a successful update.
 * @returns The edit story modal.
 */
export default function EditStoryModal({
  visible,
  story,
  onClose,
  onSuccess,
}: Props) {
  const { updateStory, isLoading, error, clearError } = useStoryActions();
  const { updateStoryInFeed } = useStoryStore();
  const form = useEditStoryForm(story, clearError);

  const handleSubmit = async () => {
    if (!story || !form.isValidForm) return;
    const result = await updateStory(story.id, form.getPayload());

    if (result) {
      updateStoryInFeed(story.id, {
        title: result.title,
        excerpt: result.excerpt,
        bannerImageUrl: result.bannerImageUrl,
      });
      Alert.alert("Success", "Story updated successfully!");
      onSuccess?.();
      onClose();
    } else if (error) {
      Alert.alert("Error", error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ScrollView className="flex-1 bg-surface">
        <View className="space-y-4 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-nunito-bold text-heading text-neutral">
              Edit Story
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close edit story"
              accessibilityHint="Closes the edit story modal"
              onPress={onClose}
              disabled={isLoading}
            >
              <TabIcon name="close" size={24} color={colors.primary.DEFAULT} />
            </Pressable>
          </View>

          <StoryTextField
            label="Title *"
            value={form.title}
            onChangeText={form.setTitle}
            placeholder="Enter story title"
            accessibilityLabel="Story title"
            accessibilityHint="Update the story title"
            maxLength={200}
            disabled={isLoading}
          />

          <StoryTextField
            label="Body (Markdown) *"
            value={form.bodyMarkdown}
            onChangeText={form.setBodyMarkdown}
            placeholder="Write your story here..."
            accessibilityLabel="Story body"
            accessibilityHint="Update the main story content"
            maxLength={5000}
            disabled={isLoading}
            multiline
            numberOfLines={8}
          />

          <BannerImageField
            value={form.bannerRemoved ? undefined : form.bannerPreviewUrl}
            disabled={isLoading}
            onChange={(next) => {
              form.setBannerPreviewUrl(next.previewUrl);
              form.setBannerImageData(next.bannerImageData);
              form.setBannerImageMimeType(next.bannerImageMimeType);
              form.setBannerRemoved(!!next.removed);
            }}
          />

          <StoryTextField
            label="Event Timeframe"
            value={form.eventTimeframe}
            onChangeText={form.setEventTimeframe}
            placeholder="e.g., Summer 2024, Winter Break"
            accessibilityLabel="Event timeframe"
            accessibilityHint="Update when this story took place"
            maxLength={100}
            disabled={isLoading}
          />

          {error && (
            <View className="rounded-2xl bg-error/10 p-3">
              <Text className="text-small text-error">{error}</Text>
            </View>
          )}

          <View className="flex-row gap-3 pt-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel editing story"
              accessibilityHint="Closes the modal without saving changes"
              onPress={onClose}
              disabled={isLoading}
              className="flex-1 rounded-2xl border border-neutral-lightest bg-surface py-3"
            >
              <Text className="text-center font-nunito-semibold text-body text-neutral">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Update story"
              accessibilityHint="Saves changes to this story"
              onPress={handleSubmit}
              disabled={!form.isValidForm || isLoading}
              className={`flex-1 flex-row items-center justify-center rounded-2xl py-3 ${
                form.isValidForm && !isLoading
                  ? "bg-primary"
                  : "bg-neutral-lightest"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.neutral.white} size="small" />
              ) : (
                <Text className="text-center font-nunito-semibold text-body text-neutral-white">
                  Update
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}
