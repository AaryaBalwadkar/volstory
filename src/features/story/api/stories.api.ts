import { apiClient } from "@/src/lib/axios";

import { StoryDetail, StorySummary } from "../types/story.types";
import {
  ApiStory,
  normalizeStoryDetail,
  normalizeStorySummary,
} from "../utils/storyUtils";

const STORIES_PATH = "/stories";

/**
 * Fetches paginated story summaries.
 *
 * @param cursor - Optional pagination cursor.
 * @param limit - Number of stories to request.
 * @param authorId - Optional author filter or "me".
 * @returns Normalized story summaries.
 */
export const getStoriesApi = async (
  cursor?: string,
  limit = 10,
  authorId?: string,
): Promise<StorySummary[]> => {
  const params: Record<string, string | number> = { limit };
  if (cursor && cursor !== "undefined" && cursor !== "null") {
    params.cursor = cursor;
  }
  if (authorId) {
    params.authorId = authorId === "me" ? "me" : authorId;
  }
  const response = await apiClient.get<unknown>(STORIES_PATH, {
    params,
  });

  const payload = response.data as ApiStory[];
  return payload.map((story) => normalizeStorySummary(story));
};

/**
 * Fetches a story by id.
 *
 * @param storyId - Story id to fetch.
 * @returns Normalized story detail.
 */
export const getStoryByIdApi = async (
  storyId: string,
): Promise<StoryDetail> => {
  const response = await apiClient.get<unknown>(`${STORIES_PATH}/${storyId}`);
  return normalizeStoryDetail(response.data as ApiStory);
};

export interface CreateStoryPayload {
  title: string;
  bodyMarkdown: string;
  bannerImageUrl?: string;
  bannerImageData?: string;
  bannerImageMimeType?: string;
  eventTimeframe?: string;
}

export interface UpdateStoryPayload {
  title?: string;
  bodyMarkdown?: string;
  bannerImageUrl?: string;
  bannerImageData?: string;
  bannerImageMimeType?: string;
  eventTimeframe?: string;
  status?: "draft" | "pending_approval" | "published" | "archived";
}

/**
 * Creates a story.
 *
 * @param payload - Story creation payload.
 * @returns The created story detail.
 */
export const createStoryApi = async (
  payload: CreateStoryPayload,
): Promise<StoryDetail> => {
  const response = await apiClient.post<unknown>(STORIES_PATH, payload);
  return normalizeStoryDetail(response.data as ApiStory);
};

/**
 * Updates a story.
 *
 * @param storyId - Story id to update.
 * @param payload - Story update payload.
 * @returns The updated story detail.
 */
export const updateStoryApi = async (
  storyId: string,
  payload: UpdateStoryPayload,
): Promise<StoryDetail> => {
  const response = await apiClient.put<unknown>(
    `${STORIES_PATH}/${storyId}`,
    payload,
  );
  return normalizeStoryDetail(response.data as ApiStory);
};

/**
 * Deletes a story.
 *
 * @param storyId - Story id to delete.
 * @returns A promise that resolves after deletion.
 */
export const deleteStoryApi = async (storyId: string): Promise<void> => {
  await apiClient.delete(`${STORIES_PATH}/${storyId}`);
};

/**
 * Toggles a like on a story.
 *
 * @param storyId - Story id to like or unlike.
 * @returns Updated story detail.
 */
export const likeStoryApi = async (storyId: string): Promise<StoryDetail> => {
  const response = await apiClient.post<unknown>(
    `${STORIES_PATH}/${storyId}/like`,
  );
  return normalizeStoryDetail(response.data as ApiStory);
};

/**
 * Fetches a story by slug.
 *
 * @param slug - Story slug to fetch.
 * @returns Normalized story detail.
 */
export const getStoryBySlugApi = async (slug: string): Promise<StoryDetail> => {
  const response = await apiClient.get<unknown>(
    `${STORIES_PATH}/article/${slug}`,
  );
  return normalizeStoryDetail(response.data as ApiStory);
};

/**
 * Records a unique story view.
 *
 * @param storyId - Story id to track.
 * @returns A promise that resolves when the view is recorded.
 */
export const recordStoryViewApi = async (storyId: string): Promise<void> => {
  await apiClient.post(`${STORIES_PATH}/${storyId}/record-view`);
};

/**
 * Records that a reader reached the read threshold.
 *
 * @param storyId - Story id to track.
 * @returns A promise that resolves when the read is recorded.
 */
export const recordStoryReadApi = async (storyId: string): Promise<void> => {
  await apiClient.post(`${STORIES_PATH}/${storyId}/record-read`);
};
