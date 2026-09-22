export function getProfitPageFallback(nicheName: string, affiliateLink: string): {
  title: string
  content: string
} {
  const title = `Discover Your Path to Success in ${nicheName}`
  const content = `<h1>${title}</h1>

<h2>The Problem You're Facing</h2>

<p>If you're here, you're likely searching for a real solution in the ${nicheName} space. The good news? You're in the right place.</p>

<p>Many people struggle to find <a href="${affiliateLink}" class="inline-link">the right approach</a> that actually delivers results.</p>

<p>The challenge is that most solutions out there promise everything but deliver nothing. They're complicated, expensive, or simply don't work for real people in real situations.</p>

<p>That's about to change. What you're about to discover is <a href="${affiliateLink}" class="inline-link">a proven system</a> that's helping thousands of people just like you achieve remarkable results.</p>

<h2>Why Most Solutions Fall Short</h2>

<p>Let's be honest - you've probably tried other methods before. Maybe you invested time and money into programs that didn't deliver. It's frustrating, and it's not your fault.</p>

<p>The problem is that most approaches are either too complicated, too expensive, or simply outdated. They were created by people who don't understand what you're actually going through.</p>

<p>But <a href="${affiliateLink}" class="inline-link">this innovative solution</a> is different. It's designed specifically for people who want real results without the usual hassles.</p>

<div class="mid-article-cta">
  <h3>Ready to Transform Your Results?</h3>
  <p>Don't spend another day struggling with methods that don't work. <a href="${affiliateLink}" class="affiliate-link">Click here to get started now</a> and join thousands who are already succeeding.</p>
</div>

<h2>The Solution That Changes Everything</h2>

<p>What makes this different? It's simple: <a href="${affiliateLink}" class="inline-link">this proven method</a> was created by real experts who understand your exact situation and challenges.</p>

<p>Instead of complicated theories or expensive equipment, you get a straightforward system that works. No gimmicks, no false promises - just real results that you can see and measure.</p>

<h3>How It Works</h3>

<p>The approach is refreshingly simple. You follow a step-by-step process that's been refined through thousands of success stories.</p>

<p>Each step builds on the last, creating momentum and real progress.</p>

<p>You don't need special skills or experience. <a href="${affiliateLink}" class="inline-link">The complete system</a> is designed to work for beginners and experienced people alike.</p>

<h3>What Makes It Different</h3>

<p>Unlike other solutions, this focuses on sustainable, long-term results.</p>

<p>You're not looking for quick fixes - you want <a href="${affiliateLink}" class="inline-link">lasting transformation</a>, and that's exactly what this delivers.</p>

<h2>The Benefits You'll Experience</h2>

<p>When you start using <a href="${affiliateLink}" class="inline-link">this breakthrough approach</a>, you'll notice changes quickly. Most people report seeing significant improvements within the first few weeks.</p>

<p>You'll save time because everything is streamlined and efficient. No more wasting hours on methods that don't work.</p>

<p>You'll save money by avoiding expensive mistakes and ineffective solutions. This is <a href="${affiliateLink}" class="inline-link">the last system</a> you'll need.</p>

<p>Most importantly, you'll gain confidence knowing you're using a proven method backed by thousands of success stories.</p>

<h2>Real Results from Real People</h2>

<p>The proof is in the results. Thousands of people have used <a href="${affiliateLink}" class="inline-link">this exact system</a> to achieve their goals and transform their results.</p>

<p>They started exactly where you are now - uncertain, frustrated, and looking for something that actually works.</p>

<p>What they found exceeded their expectations.</p>

<h2>Is This Right for You?</h2>

<p>You might be wondering if this is right for your situation. Here's the truth: if you're serious about getting real results, then yes, <a href="${affiliateLink}" class="inline-link">this proven approach</a> is perfect for you.</p>

<p>It doesn't matter if you're a complete beginner or if you've tried other methods before. The system is designed to work for anyone committed to success.</p>

<p>The question isn't whether it will work - the question is whether you're ready to take action and <a href="${affiliateLink}" class="affiliate-link">get started today</a>.</p>

<h2>How to Get Started Today</h2>

<p>Getting started is simple. In just a few minutes, you can have complete access to everything you need to begin your transformation.</p>

<p>Don't let another day go by wishing for change. Take action now and <a href="${affiliateLink}" class="affiliate-link">click here to get instant access</a> to the complete system.</p>

<p>You have nothing to lose and everything to gain. Join the thousands of people who have already discovered <a href="${affiliateLink}" class="inline-link">this life-changing opportunity</a> and are now enjoying the results they always wanted.</p>

<p>Your journey to success starts right now. <a href="${affiliateLink}" class="affiliate-link">Click here to begin</a> and see for yourself why so many people are raving about these incredible results.</p>`

  return { title, content }
}
