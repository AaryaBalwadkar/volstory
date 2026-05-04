import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createCommentApi,
  getCommentsApi,
  getRepliesApi,
  likeCommentApi,
} from "../api/comments.api";
import {
  CommentPages,
  incrementReplyCount,
  prependCommentToPages,
  toggleCachedCommentLike,
} from "../utils/commentQueryUtils";

/**
 * Loads top-level comments and exposes comment mutations for a story.
 *
 * @param storyId - Story id to load comments for.
 * @returns Comment query state and mutation helpers.
 */
export const useComments = (storyId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["comments", storyId];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      getCommentsApi(storyId, pageParam as string | undefined, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 10) {
        return lastPage[lastPage.length - 1].createdAt;
      }
      return undefined;
    },
    enabled: !!storyId,
  });

  const comments = data?.pages.flat() || [];

  const addCommentMutation = useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: string;
    }) => createCommentApi(storyId, { content, parentId }),
    onSuccess: (newComment) => {
      // If it's a reply, invalidate the replies query for that parent instead of adding to main list
      if (newComment.parentId) {
        queryClient.invalidateQueries({
          queryKey: ["replies", newComment.parentId],
        });
        queryClient.setQueryData<CommentPages>(queryKey, (oldData) =>
          incrementReplyCount(oldData, newComment.parentId as string),
        );
        return;
      }

      queryClient.setQueryData<CommentPages>(queryKey, (oldData) =>
        prependCommentToPages(oldData, newComment),
      );
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (commentId: string) => likeCommentApi(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData<CommentPages>(queryKey, (oldData) =>
        toggleCachedCommentLike(oldData, commentId),
      );
      return { previousData };
    },
    onError: (err, commentId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    comments,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    addComment: addCommentMutation.mutateAsync,
    toggleLike: toggleLikeMutation.mutateAsync,
  };
};

/**
 * Loads replies and reply mutations for a comment.
 *
 * @param commentId - Parent comment id.
 * @param enabled - Whether replies should be fetched.
 * @returns Reply query state and mutation helpers.
 */
export const useCommentReplies = (commentId: string, enabled = false) => {
  const queryClient = useQueryClient();
  const queryKey = ["replies", commentId];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      getRepliesApi(commentId, pageParam as string | undefined, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 10) {
        return lastPage[lastPage.length - 1].createdAt;
      }
      return undefined;
    },
    enabled: !!commentId && enabled,
  });

  const replies = data?.pages.flat() || [];

  const addReplyMutation = useMutation({
    mutationFn: ({ storyId, content }: { storyId: string; content: string }) =>
      createCommentApi(storyId, { content, parentId: commentId }),
    onSuccess: (newReply) => {
      queryClient.setQueryData<CommentPages>(queryKey, (oldData) =>
        prependCommentToPages(oldData, newReply),
      );
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (replyId: string) => likeCommentApi(replyId),
    onMutate: async (replyId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData<CommentPages>(queryKey, (oldData) =>
        toggleCachedCommentLike(oldData, replyId),
      );
      return { previousData };
    },
    onError: (err, replyId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    replies,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    addReply: addReplyMutation.mutateAsync,
    toggleLike: toggleLikeMutation.mutateAsync,
  };
};
