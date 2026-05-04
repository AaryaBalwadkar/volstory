import { useEffect } from "react";

import { useStoryStore } from "../stores/storyStore";

/**
 * Connects screens to the story feed store and loads the active feed.
 *
 * @param authorId - Optional author filter or "me".
 * @returns Story feed state and feed actions.
 */
export const useStoryFeed = (authorId?: string) => {
  const {
    stories,
    isLoading,
    isRefreshing,
    isFetchingMore,
    hasLoaded,
    hasMore,
    error,
    activeAuthorId,
    loadStories,
    loadNextPage,
    refreshStories,
    updateLikeCount,
    updateLikeState,
  } = useStoryStore();

  useEffect(() => {
    if (!isLoading && (!hasLoaded || activeAuthorId !== (authorId ?? null))) {
      loadStories(authorId);
    }
  }, [activeAuthorId, authorId, hasLoaded, isLoading, loadStories]);

  const { removeStoryFromFeed } = useStoryStore();

  return {
    stories,
    isLoading,
    isFetchingMore,
    isRefreshing,
    hasMore,
    error,
    loadStories,
    loadNextPage,
    refreshStories,
    updateLikeCount,
    updateLikeState,
    removeStoryFromFeed,
  };
};
