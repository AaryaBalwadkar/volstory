import { apiClient } from "@/src/lib/axios";

import { CreateCommentPayload, StoryComment } from "../types/comment.types";

/**
 * Fetches the first-level comments for a story.
 *
 * @param storyId - Story id to fetch comments for.
 * @param cursor - Optional pagination cursor.
 * @param signal - Optional request abort signal.
 * @returns A list of story comments.
 */
export const getCommentsApi = async (
  storyId: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<StoryComment[]> => {
  const params = cursor ? { cursor } : {};
  const response = await apiClient.get<StoryComment[]>(
    `/stories/${storyId}/comments`,
    { params, signal },
  );
  return response.data;
};

/**
 * Fetches replies for a parent comment.
 *
 * @param commentId - Parent comment id.
 * @param cursor - Optional pagination cursor.
 * @param signal - Optional request abort signal.
 * @returns A list of reply comments.
 */
export const getRepliesApi = async (
  commentId: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<StoryComment[]> => {
  const params = cursor ? { cursor } : {};
  const response = await apiClient.get<StoryComment[]>(
    `/comments/${commentId}/replies`,
    { params, signal },
  );
  return response.data;
};

/**
 * Creates a comment or reply for a story.
 *
 * @param storyId - Story id to comment on.
 * @param payload - Comment creation payload.
 * @returns The created comment.
 */
export const createCommentApi = async (
  storyId: string,
  payload: CreateCommentPayload,
): Promise<StoryComment> => {
  const response = await apiClient.post<StoryComment>(
    `/stories/${storyId}/comments`,
    payload,
  );
  return response.data;
};

/**
 * Toggles a like on a comment.
 *
 * @param commentId - Comment id to like or unlike.
 * @returns Updated like state for the comment.
 */
export const likeCommentApi = async (
  commentId: string,
): Promise<{ likeCount: number; isLiked: boolean }> => {
  const response = await apiClient.post<{
    likeCount: number;
    isLiked: boolean;
  }>(`/comments/${commentId}/like`);
  return response.data;
};
