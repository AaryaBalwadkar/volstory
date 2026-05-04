export interface StoryAuthor {
  id: string;
  name: string;
}

export interface StorySummary {
  id: string;
  title: string;
  bannerImageUrl?: string;
  excerpt?: string;
  author: StoryAuthor;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  slug: string;
}

export type StoryDetail = StorySummary & {
  bodyMarkdown: string;
  eventTimeframe?: string;
  viewCount: number;
};
