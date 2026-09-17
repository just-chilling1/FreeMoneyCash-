"use client"

import { useEffect, useRef } from "react"
import { Sparkles, TrendingUp, Award } from 'lucide-react'

interface ArticleContentProps {
  page: {
    id: string
    title: string
    content: string
    affiliate_link: string
    views: number
    created_at: string
    niches?: { name: string }
    offers?: { title: string }
  }
}

function generateHeroTitle(niche: string): string {
  const titles: Record<string, string> = {
    "Weight Loss": "The Ultimate Weight Loss Breakthrough",
    "Fitness & Sports": "The Ultimate Fitness & Performance Breakthrough",
    "Make Money Online": "How to Build Real Online Income",
    "Health & Fitness": "Transform Your Health Starting Today",
    "Tech & Gadgets": "The Latest Tech That Changes Everything",
    "Beauty & Skincare": "The Beauty Secrets That Actually Work",
    "Relationships": "Build the Relationship You Deserve",
    "Pets": "Everything Your Pet Needs to Thrive",
    "Home & Garden": "Transform Your Home Into Paradise",
  }
  return titles[niche] || "Life-Changing Insights You Need"
}

export default function ArticleContent({ page }: ArticleContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    const links = contentRef.current.querySelectorAll('a.affiliate-link, a[href*="' + page.affiliate_link + '"]')

    const handleClick = async () => {
      try {
        await fetch("/api/track-click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId: page.id }),
        })
      } catch (error) {
        console.error("Failed to track click:", error)
      }
    }

    links.forEach((link) => {
      link.addEventListener("click", handleClick)
    })

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleClick)
      })
    }
  }, [page.id, page.affiliate_link])

  const heroTitle = page.niches?.name ? generateHeroTitle(page.niches.name) : "Life-Changing Insights You Need"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section - New personalized hero instead of branded header */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 animate-pulse" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          {/* Hero Title */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-primary font-semibold tracking-wider uppercase text-sm">
                {page.niches?.name}
              </span>
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight bg-gradient-to-r from-white via-accent to-accent bg-clip-text text-transparent">
              {heroTitle}
            </h1>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>{page.views || 0}+ readers</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Expert Reviewed</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Updated {new Date(page.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content - New clean, magazine-style layout */}
      <main className="container mx-auto px-4 pb-20 max-w-4xl">
        <article className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Content */}
          <div className="p-8 md:p-16">
            <div 
              ref={contentRef} 
              className="article-content prose prose-invert prose-lg max-w-none" 
              dangerouslySetInnerHTML={{ __html: page.content }} 
            />
          </div>

          {/* Footer CTA - More compelling and clean design */}
          <div className="border-t border-white/10 bg-gradient-to-br from-primary/10 to-secondary/10 p-8 md:p-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Take Action?
              </h3>
              
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Join thousands who have already transformed their lives. Your journey starts here.
              </p>
              
              <a
                href={page.affiliate_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary via-blue-500 to-secondary text-white text-lg font-bold rounded-full hover:shadow-[0_0_40px_rgba(207,70,239,0.6)] hover:scale-105 transition-all duration-300 group"
              >
                Get Started Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              
              <p className="text-sm text-white/50 mt-6">
                100% Risk-Free • Instant Access • No Hidden Fees
              </p>
            </div>
          </div>
        </article>
      </main>

      <style jsx global>{`
        .article-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          line-height: 1.2;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, #ffffff 0%, #60efff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .article-content h2 {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          line-height: 1.3;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid rgba(6, 182, 212, 0.3);
        }

        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.4;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .article-content p {
          font-size: 1.125rem;
          line-height: 1.9;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1.5rem;
        }

        .article-content strong {
          font-weight: 600;
          color: white;
        }

        /* Inline keyword hyperlinks - subtle but clear */
        .article-content a.inline-link {
          color: #cfa13b;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(6, 182, 212, 0.4);
          padding-bottom: 1px;
        }

        .article-content a.inline-link:hover {
          color: #22d3ee;
          border-bottom-color: rgba(34, 211, 238, 0.6);
        }

        /* CTA links - more prominent */
        .article-content a.affiliate-link {
          color: #cfa13b;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.2s ease;
          border-bottom: 2px solid rgba(207, 161, 59, 0.5);
          padding-bottom: 2px;
        }

        .article-content a.affiliate-link:hover {
          color: #a78bfa;
          border-bottom-color: rgba(167, 139, 250, 0.7);
          transform: translateY(-1px);
        }

        /* Added mid-article CTA styling */
        .article-content .mid-article-cta {
          margin: 3rem 0;
          padding: 2.5rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(207, 161, 59, 0.15) 100%);
          border: 2px solid rgba(6, 182, 212, 0.3);
          border-radius: 1rem;
          text-align: center;
        }

        .article-content .mid-article-cta h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.75rem;
          background: linear-gradient(135deg, #cfa13b 0%, #cfa13b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .article-content .mid-article-cta p {
          font-size: 1.125rem;
          margin-bottom: 0;
        }

        /* Fallback for any other links */
        .article-content a {
          color: #cfa13b;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          border-bottom: 1px solid rgba(6, 182, 212, 0.3);
          padding-bottom: 1px;
        }

        .article-content a:hover {
          color: #cfa13b;
          border-bottom-color: rgba(207, 161, 59, 0.5);
        }

        .article-content ul,
        .article-content ol {
          margin-left: 2rem;
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .article-content li {
          font-size: 1.125rem;
          line-height: 1.9;
          margin-bottom: 0.75rem;
        }

        .article-content li::marker {
          color: #cfa13b;
        }

        @media (max-width: 768px) {
          .article-content h1 {
            font-size: 2rem;
          }

          .article-content h2 {
            font-size: 1.5rem;
          }

          .article-content h3 {
            font-size: 1.25rem;
          }

          .article-content p,
          .article-content li {
            font-size: 1rem;
          }

          .article-content .mid-article-cta {
            padding: 1.5rem;
          }

          .article-content .mid-article-cta h3 {
            font-size: 1.5rem;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  )
}
