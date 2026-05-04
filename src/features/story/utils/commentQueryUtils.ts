import { StoryComment } from "../types/comment.types";

export interface CommentPages {
  pages: StoryComment[][];
  pageParams: unknown[];
}

const emptyCommentPages = (comment: StoryComment): CommentPages => ({
  pages: [[comment]],
  pageParams: [undefined],
});

const mapCommentPages = (
  oldData: CommentPages | undefined,
  updater: (comment: StoryComment) => StoryComment,
): CommentPages | undefined => {
  if (!oldData) return oldData;
  return {
    ...oldData,
    pages: oldData.pages.map((page) => page.map(updater)),
  };
};

/**
 * Adds a comment to the top of the first cached page.
 *
 * @param oldData - Existing paginated comments cache.
 * @param comment - New comment to prepend.
 * @returns Updated comments cache.
 */
export const prependCommentToPages = (
  oldData: CommentPages | undefined,
  comment: StoryComment,
): CommentPages => {
  if (!oldData) return emptyCommentPages(comment);
  const newPages = [...oldData.pages];
  if (newPages.length > 0) {
    newPages[0] = [comment, ...newPages[0]];
  } else {
    newPages.push([comment]);
  }
  return { ...oldData, pages: newPages };
};

/**
 * Increments the cached reply count for a parent comment.
 *
 * @param oldData - Existing paginated comments cache.
 * @param parentId - Parent comment id.
 * @returns Updated comments cache.
 */
export const incrementReplyCount = (
  oldData: CommentPages | undefined,
  parentId: string,
): CommentPages | undefined =>
  mapCommentPages(oldData, (comment) =>
    comment._id === parentId
      ? { ...comment, replyCount: comment.replyCount + 1 }
      : comment,
  );

/**
 * Optimistically toggles like state for a cached comment.
 *
 * @param oldData - Existing paginated comments cache.
 * @param commentId - Comment id to toggle.
 * @returns Updated comments cache.
 */
export const toggleCachedCommentLike = (
  oldData: CommentPages | undefined,
  commentId: string,
): CommentPages | undefined =>
  mapCommentPages(oldData, (comment) => {
    if (comment._id !== commentId) return comment;
    const isLiked = !comment.isLiked;
    return {
      ...comment,
      isLiked,
      likeCount: isLiked ? comment.likeCount + 1 : comment.likeCount - 1,
    };
  });
