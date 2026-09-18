import { generateText, isAiConfigured } from "./ai"

export interface VideoCommentInput {
  videoTitle: string
  productName: string
  productDescription: string
  affiliateLink: string
}

export function buildTemplateComments(input: VideoCommentInput): string[] {
  return [
    `I was stuck in the same situation for months. Then I found a method that finally worked - ${input.productDescription}. Completely turned things around for me. Here if anyone wants to check it out: ${input.affiliateLink}`,
    `Struggled with this for way too long before I discovered a system that actually delivers results. ${input.productDescription}. Game changer honestly: ${input.affiliateLink}`,
    `My experience was similar until I came across something that changed everything. ${input.productDescription}. Made a huge difference: ${input.affiliateLink}`,
  ]
}

function buildPrompt(input: VideoCommentInput): string {
  return `You're writing a YouTube comment. Be natural and conversational like a real person.

CONTEXT (don't mention these directly):
- Video is about: ${input.videoTitle}
- You promote: ${input.productDescription}
- Your link: ${input.affiliateLink}

Write 3 different comments (40-60 words each) that:
1. Share a personal experience or reaction related to the video's topic
2. Naturally mention how you achieved results with your product/method
3. Include your link as a helpful resource

BE NATURAL:
- Write like you're texting a friend
- Share a short story or personal win
- Don't repeat the video title word-for-word
- Don't say "this video" or "great content"
- Sound authentic, not promotional

Now write 3 unique comments. Each should feel different. Mix up the storytelling. Just output the 3 comments, one per line, no numbers or formatting.`
}

function parseComments(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length >= 30 && !/^\d+[.):\-]/.test(line))
    .slice(0, 3)
}

/**
 * Generate viral comments for one video. Never throws and never persists:
 * callers decide whether to save. Falls back to templates so a card is never empty.
 */
export async function generateVideoComments(
  input: VideoCommentInput,
): Promise<{ comments: string[]; usedFallback: boolean }> {
  if (!isAiConfigured()) {
    return { comments: buildTemplateComments(input), usedFallback: true }
  }

  try {
    const comments = parseComments(await generateText(buildPrompt(input)))
    if (comments.length === 0) throw new Error("No valid comments parsed from response")
    return { comments, usedFallback: false }
  } catch (error) {
    console.error("[rh] AI comment generation failed, using template fallback:", error)
    return { comments: buildTemplateComments(input), usedFallback: true }
  }
}
