import { SUPPORT_EMAIL, support } from "@/lib/support-config"

export type FaqItem = { q: string; a: string }
export type FaqSection = { title: string; items: FaqItem[] }

const productName = support.productName

export const faqSections: FaqSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        q: `What is ${productName}?`,
        a: `${productName} helps you create compliant affiliate marketing pages with AI, then share them to drive traffic and earn commissions. Pick a niche, generate a page, publish, and promote.`,
      },
      {
        q: "What should I do first?",
        a: "Open Training and complete the videos in any order. Then go to Build Page, create your first affiliate page, publish it from Your Pages, and use Share & Promote to drive traffic.",
      },
      {
        q: "Do I need tech or writing skills?",
        a: "No. Choose a niche and offer, add your affiliate link, and generate a page. Review the content, publish, and share the link.",
      },
      {
        q: "Do I need my own affiliate link?",
        a: "Yes — use your real affiliate link when creating a page so commissions track correctly when someone buys through your CTA.",
      },
    ],
  },
  {
    title: "Pages & Publishing",
    items: [
      {
        q: "How do I create my first page?",
        a: "Go to Build Page, select a niche, enter your affiliate link, and generate. When ready, open Your Pages to view, share, or manage status.",
      },
      {
        q: "Where do I find my live page link?",
        a: "Open Your Pages, then open or copy the public article link for that page. Share that URL when promoting.",
      },
      {
        q: "Can I edit a page after it is created?",
        a: "Generated pages are stored in Your Pages. You can track views and status there. For major rewrites, generate a new page with an updated niche or offer angle.",
      },
      {
        q: "Why does my page show zero views?",
        a: "Views update after real visitors open your published link. Share it on social, groups, or other channels, then check Your Pages again.",
      },
    ],
  },
  {
    title: "Traffic & Training",
    items: [
      {
        q: "How do I get traffic to my pages?",
        a: "Use Share & Promote for ready-to-post ideas, follow Training videos for free traffic methods, and optionally explore Instant Cash Injection or premium upgrades for faster scale.",
      },
      {
        q: "What is in the Training Center?",
        a: "Core walkthrough videos that show how the system works, how to build pages, and how to drive clicks. Mark videos complete so your progress is saved to your account.",
      },
      {
        q: "What is Bonus Training?",
        a: "A member bonus that shows how to scale toward higher daily income. Open Bonus Training from the sidebar when you are ready to watch it.",
      },
    ],
  },
  {
    title: "Premium Features",
    items: [
      {
        q: "What is Done-For-You Profit?",
        a: "Done-For-You Profit builds a complete promo kit from one link and one niche in a single run: videos to comment on, a hosted authority article, and Facebook posts.",
      },
      {
        q: "What is Unlimited?",
        a: "A library of 200 done-for-you pages. Preview any page, then publish it with your affiliate link.",
      },
      {
        q: "What is Instant Income?",
        a: "Ready-to-use social post sets and posting guidance so you can promote your pages quickly across Facebook and similar channels.",
      },
      {
        q: "What is Automated Income?",
        a: "A curated traffic-source checklist and playbooks by niche — follow each source’s steps, plug in your page link, and track what you complete.",
      },
      {
        q: "What is Guaranteed High-Ticket Payouts?",
        a: "A library of 100 ready-to-publish authority articles. Paste your affiliate link, preview it woven into the CTA, then copy plain text or HTML for Medium, LinkedIn, Quora, or your blog.",
      },
      {
        q: "What is Reseller & License Rights?",
        a: "A request form for the Full Turnkey Reseller & License Rights Edition. Submit a License Rights ticket and the team activates the reseller edition on your account. Assets stay locked until then.",
      },
      {
        q: "What is Cyber Protection?",
        a: "Cyber Protection is your account security overview — verification status, security checks, and recent activity — so you can keep your member account in good standing. It is not a third-party antivirus product.",
      },
    ],
  },
  {
    title: "Account & Security",
    items: [
      {
        q: "How do I manage my account?",
        a: "Open Settings from the sidebar. Update your name, change your password, view account stats and training progress, or sign out.",
      },
      {
        q: "How do I change my password?",
        a: "In Settings → Security, enter your current password and a new password (at least 8 characters). You can also use Forgot Password on the login screen if you are signed out.",
      },
      {
        q: "Is my data secure?",
        a: `${productName} uses secure authentication and encrypted connections. Never share your password, and contact support if you notice unusual account activity.`,
      },
    ],
  },
  {
    title: "Support & Billing",
    items: [
      {
        q: "How do I contact support?",
        a: `Use the contact form on the right side of your dashboard, the Need Help banner at the bottom of any page, or email ${SUPPORT_EMAIL}. We typically reply within about 2 hours — allow up to 24–48 hours on busy days.`,
      },
      {
        q: "How quickly does support respond?",
        a: "We typically reply within about 2 hours. Allow up to 24–48 hours on busy days. Check your spam folder if you do not see a reply.",
      },
      {
        q: "What is the refund policy?",
        a: `${productName} includes a 30-day satisfaction guarantee on upgrade purchases. Email ${SUPPORT_EMAIL} with your account email and purchase date. Refunds are typically processed within 5–7 business days.`,
      },
    ],
  },
]
