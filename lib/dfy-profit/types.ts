export interface DfyVideoResult {
  videoId: string
  title: string
  channelTitle: string
  thumbnailUrl: string
  viewCount: number
  videoUrl: string
  comments: string[]
  usedFallbackComments: boolean
}

export interface DfyArticleResult {
  id: string | null
  slug: string | null
  url: string | null
  title: string
  excerpt: string
  html: string
  saveWarning?: string
}

export interface DfyFacebookPost {
  id: string
  body: string
}

export interface GeneratedArticleContent {
  title: string
  excerpt: string
  html: string
}
