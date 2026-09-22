export interface DfyProfitPageResult {
  pageId: string
  slug: string | null
  url: string
  title: string
  productName: string
  productContext: string
  niche: string
}

export interface DfyArticleResult {
  title: string
  excerpt: string
  html: string
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
