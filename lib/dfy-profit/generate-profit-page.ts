import { generateText, isAiConfigured } from "@/lib/dfy-profit/ai"
import { getProfitPageFallback } from "@/lib/dfy-profit/profit-page-fallback"
import { sanitizeArticleHtml } from "@/lib/sanitize-html"

function buildProfitPagePrompt(input: {
  niche: string
  productName: string
  productContext: string
}): string {
  const productBlock = input.productContext.trim()
    ? `\nPRODUCT CONTEXT (use for accuracy, weave in naturally):\n${input.productContext.trim()}\nProduct name: ${input.productName}\n`
    : `\nPRODUCT NAME: ${input.productName}\n`

  return `Write a comprehensive, high-value affiliate marketing article of at least 2,000 words in the ${input.niche} niche.
${productBlock}
FORMAT THE ARTICLE AS HTML with proper structure:
- Use <h1> for the main headline
- Use <h2> for major section headings
- Use <h3> for subsection headings
- Use <p> for paragraphs
- Use <strong> for emphasis
- IMPORTANT: Include 10-12 inline hyperlinks distributed naturally throughout the article (every 2-3 paragraphs)
- Make relevant keywords and phrases into hyperlinks to [LINK]
- Use contextual anchor text like "this proven method", "the solution", "learn the exact strategy", "discover how", etc.
- Format inline links as: <a href="[LINK]" class="inline-link">keyword phrase</a>
- Also include explicit CTAs with phrases like "click here", "learn more", "get started"
- Format CTA links as: <a href="[LINK]" class="affiliate-link">click here</a>
- NEVER show raw URLs or long links in the text

<h2>The Problem You're Facing</h2>
<p>Opening hook that grabs attention (300+ words)</p>
<p>Start with a relatable problem or story. Many people struggle with this issue, but <a href="[LINK]" class="inline-link">there's a proven solution</a> that has helped thousands.</p>
<p>Build empathy and connection</p>
<p>Mention how <a href="[LINK]" class="inline-link">this specific approach</a> addresses the root cause.</p>

<h2>Why Traditional Solutions Don't Work</h2>
<p>Deep dive into the pain points (400+ words)</p>
<p>Make the reader feel understood</p>
<p>Amplify the cost of not solving the problem. That's why <a href="[LINK]" class="inline-link">the right system</a> makes all the difference.</p>

<div class="mid-article-cta">
  <h3>Ready to See Real Results?</h3>
  <p>Don't wait another day struggling with outdated methods. <a href="[LINK]" class="affiliate-link">Click here to get started now</a> and join thousands who are already succeeding.</p>
</div>

<h2>Introducing the Solution You've Been Looking For</h2>
<p>Explain what it is and how it works (500+ words). This is where <a href="[LINK]" class="inline-link">the breakthrough method</a> comes in.</p>
<p>Focus on the transformation it provides</p>
<p>Share specific features that deliver results. Users report that <a href="[LINK]" class="inline-link">this exact strategy</a> changed everything for them.</p>

<h3>How It Works</h3>
<p>Step-by-step explanation with <a href="[LINK]" class="inline-link">proven techniques</a></p>

<h3>What Makes It Different</h3>
<p>Unique selling points. Unlike anything else, <a href="[LINK]" class="inline-link">this system</a> is designed for real results.</p>

<h2>The Benefits You'll Experience</h2>
<p>List 5-7 key benefits with explanations (400+ words)</p>
<p>Include specific outcomes users can expect when they <a href="[LINK]" class="inline-link">implement this approach</a></p>
<p>Add benefits like faster results, easier implementation, and lasting transformation</p>

<h2>Real Results from Real People</h2>
<p>Social proof section (200+ words)</p>
<p>Mention success stories of people who used <a href="[LINK]" class="inline-link">this exact method</a></p>
<p>Include statistics if relevant</p>

<h2>Is This Right for You?</h2>
<p>Addressing objections (300+ words)</p>
<p>"Is this right for me?" - If you're serious about results, <a href="[LINK]" class="inline-link">this system</a> is perfect for you.</p>
<p>"How long does it take?"</p>
<p>"What if it doesn't work?" - That's why <a href="[LINK]" class="affiliate-link">the proven framework</a> includes guarantees.</p>

<h2>How to Get Started Today</h2>
<p>Strong call-to-action (200+ words)</p>
<p>Create urgency (limited time, bonuses, etc.)</p>
<p>Clear next steps: If you're ready to transform your results, <a href="[LINK]" class="affiliate-link">click here to get started</a> with instant access.</p>
<p>Use natural language: "You can <a href="[LINK]" class="affiliate-link">learn more here</a>" or "Ready to begin? <a href="[LINK]" class="affiliate-link">Get instant access</a>"</p>
<p>Reinforce the transformation with <a href="[LINK]" class="inline-link">this life-changing opportunity</a></p>

CRITICAL REQUIREMENTS:
- Include 10-12 inline hyperlinks (use class="inline-link") distributed naturally every 2-3 paragraphs
- Use keyword phrases as anchor text: "this proven method", "the breakthrough system", "the exact strategy", "this powerful approach"
- Also include 3-4 explicit CTA links (use class="affiliate-link") with "click here", "learn more", "get started"
- Add the mid-article CTA section in the middle of the content
- Write naturally and conversationally
- Use short paragraphs (2-3 sentences max)
- Include subheadings every 200-300 words
- NEVER show raw URLs - always use contextual link text
- DO NOT mention "affiliate link" or "commission"
- Write complete HTML with proper tags
- Stay strictly inside the ${input.niche} niche

Write the complete HTML article now:`
}

function extractTitle(html: string, niche: string): string {
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1Match?.[1]) {
    return h1Match[1].replace(/<[^>]*>/g, "").trim().slice(0, 200) || `${niche} - Complete Guide`
  }
  return `${niche} - Complete Guide`
}

/**
 * Generate a hosted profit-page article for Done-For-You Profit.
 * Uses the same review-page style as /create, with niche + product context.
 */
export async function generateProfitPage(input: {
  niche: string
  productName: string
  productContext: string
  affiliateUrl: string
}): Promise<{ title: string; content: string }> {
  const affiliateUrl = input.affiliateUrl.trim()
  const niche = input.niche.trim()
  const productName = input.productName.trim() || niche

  if (!isAiConfigured()) {
    return getProfitPageFallback(niche, affiliateUrl)
  }

  try {
    const raw = await generateText(
      buildProfitPagePrompt({
        niche,
        productName,
        productContext: input.productContext,
      }),
      { timeoutMs: 45_000 },
    )

    let html = raw
      .trim()
      .replace(/^```(?:html)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .replace(/\[LINK\]/g, affiliateUrl)

    html = sanitizeArticleHtml(html)

    if (!html || html.length < 500) {
      return getProfitPageFallback(niche, affiliateUrl)
    }

    return {
      title: extractTitle(html, niche),
      content: html,
    }
  } catch (error) {
    console.warn("[dfy-profit] profit page AI failed — using template", error)
    return getProfitPageFallback(niche, affiliateUrl)
  }
}
