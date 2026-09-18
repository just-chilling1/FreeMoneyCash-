export interface VideoOpportunity {
  videoId: string
  title: string
  channelTitle: string
  thumbnailUrl: string
  viewCount: number
  likeCount?: number
  commentCount?: number
  publishedAt: string
  estimatedClicks: number
  viralScore: number
  relevanceScore?: number
}
