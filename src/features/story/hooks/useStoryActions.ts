import { useState } from "react";

import { useAuthStore } from "@/src/features/auth/stores/auth.store";
import { getApiErrorMessage } from "@/src/lib/axios";

import {
  createStoryApi,
  CreateStoryPayload,
  deleteStoryApi,
  likeStoryApi,
  updateStoryApi,
  UpdateStoryPayload,
} from "../api/stories.api";
import { StoryDetail } from "../types/story.types";

/**
 * Provides authenticated story mutation actions and action state.
 *
 * @returns Story action helpers plus loading and error state.
 */
export const useStoryActions = () => {
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStory = async (payload: CreateStoryPayload) => {
    if (!isAuthenticated) {
      setError("You must be logged in to create a story.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createStoryApi(payload);
      return result;
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to create story."));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStory = async (
    storyId: string,
    payload: UpdateStoryPayload,
  ): Promise<StoryDetail | null> => {
    if (!isAuthenticated) {
      setError("You must be logged in to update a story.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateStoryApi(storyId, payload);
      return result;
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to update story."));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStory = async (storyId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      setError("You must be logged in to delete a story.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteStoryApi(storyId);
      return true;
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to delete story."));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = async (storyId: string): Promise<StoryDetail | null> => {
    if (!isAuthenticated) {
      setError("You must be logged in to like a story.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await likeStoryApi(storyId);
      return result;
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to like story."));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isAuthenticated,
    isLoading,
    error,
    createStory,
    updateStory,
    deleteStory,
    toggleLike,
    clearError,
  };
};
