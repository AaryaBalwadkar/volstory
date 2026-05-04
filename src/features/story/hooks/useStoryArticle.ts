import { useCallback, useEffect, useRef, useState } from "react";

import { getApiErrorMessage } from "@/src/lib/axios";

import {
  getStoryBySlugApi,
  recordStoryReadApi,
  recordStoryViewApi,
} from "../api/stories.api";
import { StoryDetail } from "../types/story.types";

/**
 * Loads an article by slug and tracks article analytics.
 *
 * @param slug - Story slug from the route.
 * @returns Story detail state and article interaction helpers.
 */
export const useStoryArticle = (slug?: string) => {
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to ensure we don't double-fire analytics in React Strict Mode
  const hasRecordedView = useRef(false);
  const hasRecordedRead = useRef(false);

  useEffect(() => {
    if (!slug) {
      setStory(null);
      setError(null);
      hasRecordedView.current = false;
      hasRecordedRead.current = false;
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    hasRecordedView.current = false;
    hasRecordedRead.current = false;

    getStoryBySlugApi(slug)
      .then((response) => {
        if (isMounted) {
          setStory(response);

          if (!hasRecordedView.current) {
            hasRecordedView.current = true;
            recordStoryViewApi(response.id).catch((error: unknown) => {
              console.warn("[story] Failed to record view", error);
            });
          }
        }
      })
      .catch((error) => {
        if (isMounted)
          setError(
            getApiErrorMessage(
              error,
              "Unable to load the article. It may have been removed.",
            ),
          );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const trackArticleRead = useCallback(() => {
    if (story?.id && !hasRecordedRead.current) {
      hasRecordedRead.current = true;
      recordStoryReadApi(story.id).catch((error: unknown) => {
        console.warn("[story] Failed to record read", error);
      });
    }
  }, [story?.id]);

  const updateStoryLike = useCallback((likeCount: number, isLiked: boolean) => {
    setStory((prev) => (prev ? { ...prev, likeCount, isLiked } : prev));
  }, []);

  return { story, isLoading, error, updateStoryLike, trackArticleRead };
};
