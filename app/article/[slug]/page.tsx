import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

async function getArticle(pageId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/pages?id=eq.${pageId}&select=*,niches(name)`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        },
        cache: 'no-store'
      }
    )
    
    const data = await response.json()
    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error("Error fetching article:", error)
    return null
  }
}

const heroTitles: Record<string, string> = {
  "Weight Loss": "The Ultimate Weight Loss Breakthrough",
  "Fitness & Sports": "The Ultimate Fitness & Performance Breakthrough",
  "Make Money Online": "How to Build Real Online Income",
  "Health & Fitness": "Transform Your Health Starting Today",
  "Tech & Gadgets": "The Latest Tech That Changes Everything",
  "Beauty & Skincare": "The Beauty Secrets That Actually Work",
  Relationships: "Build the Relationship You Deserve",
  Pets: "Everything Your Pet Needs to Thrive",
  "Home & Garden": "Transform Your Home Into Paradise",
}

function getNicheTitle(page: { niches?: { name?: string } | null; title?: string | null }) {
  const nicheName = page.niches?.name
  return nicheName ? (heroTitles[nicheName] || page.title) : (page.title || "Life-Changing Insights")
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: pageId } = await params
  const page = await getArticle(pageId)

  if (!page) {
    return { title: "Article Not Found" }
  }

  return {
    title: getNicheTitle(page),
    description: "Discover expert insights and proven strategies",
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug: pageId } = await params
  const page = await getArticle(pageId)

  if (!page) {
    notFound()
  }

  const nicheName = page.niches?.name
  const nicheTitle = getNicheTitle(page)

  return (
    <div style={{ 
      margin: 0, 
      padding: 0, 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: '#0a0a0f',
      color: '#ffffff',
      minHeight: '100vh',
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        * { box-sizing: border-box; }
        
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 50px rgba(207, 161, 59, 0.5);
        }
        
        .cta-btn-bottom:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 20px 70px rgba(59, 130, 246, 0.6);
        }
        
        article h2 {
          font-size: 2.25rem; color: #ffffff; margin: 56px 0 24px;
          font-weight: 700; line-height: 1.25; letter-spacing: -0.025em;
          position: relative; padding-bottom: 16px;
        }
        
        article h2:first-child { margin-top: 0; }
        
        article h2::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 80px; height: 4px;
          background: linear-gradient(90deg, #cfa13b 0%, #747637 100%);
          border-radius: 2px; box-shadow: 0 2px 12px rgba(207, 161, 59, 0.4);
        }
        
        article h3 {
          font-size: 1.75rem; color: rgba(255,255,255,0.95);
          margin: 44px 0 20px; font-weight: 600;
          line-height: 1.3; letter-spacing: -0.015em;
        }
        
        article p {
          margin-bottom: 24px; font-size: 1.125rem;
          line-height: 1.85; color: rgba(255,255,255,0.85); font-weight: 400;
        }
        
        article p:first-of-type {
          font-size: 1.25rem; color: rgba(255,255,255,0.95);
          font-weight: 500; line-height: 1.75; margin-bottom: 28px;
        }
        
        article a {
          color: #60a5fa; text-decoration: none; font-weight: 600;
          border-bottom: 2px solid rgba(96, 165, 250, 0.3);
          transition: all 0.2s ease; padding-bottom: 2px;
        }
        
        article a:hover {
          color: #93c5fd;
          border-bottom-color: rgba(147, 197, 253, 0.5);
        }
        
        article ul, article ol {
          margin: 28px 0; padding-left: 0; list-style: none;
        }
        
        article li {
          margin-bottom: 18px; font-size: 1.125rem;
          line-height: 1.85; color: rgba(255,255,255,0.85);
          padding-left: 40px; position: relative;
        }
        
        article li::before {
          content: ''; position: absolute; left: 0; top: 9px;
          width: 22px; height: 22px;
          background: linear-gradient(135deg, #cfa13b 0%, #747637 100%);
          border-radius: 50%; box-shadow: 0 4px 12px rgba(207, 161, 59, 0.3);
        }
        
        article li::after {
          content: '✓'; position: absolute; left: 6px; top: 9px;
          color: #ffffff; font-size: 12px; font-weight: 700;
        }
        
        article strong { color: #ffffff; font-weight: 700; }
        article em { color: rgba(255,255,255,0.7); font-style: italic; }
        
        article blockquote {
          border-left: 4px solid #cfa13b;
          background: rgba(116, 118, 55, 0.08);
          padding: 24px 28px; margin: 36px 0;
          border-radius: 0 12px 12px 0;
          color: rgba(255,255,255,0.9);
          font-style: italic; font-size: 1.1875rem; font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .hero { padding: 60px 20px !important; }
          .hero h1 { font-size: 2.5rem !important; }
          .hero p { font-size: 1.0625rem !important; }
          .content-wrap { padding: 0 16px 60px !important; margin-top: -40px !important; }
          article { padding: 40px 28px !important; border-radius: 20px !important; }
          article h2 { font-size: 1.75rem !important; margin: 44px 0 18px !important; }
          article h3 { font-size: 1.5rem !important; margin: 32px 0 14px !important; }
          article p, article li { font-size: 1.0625rem !important; }
          article p:first-of-type { font-size: 1.125rem !important; }
          .mid-cta { padding: 28px !important; margin: 40px 0 !important; }
          .mid-cta h3 { font-size: 1.5rem !important; }
          .bottom-cta { padding: 40px 28px !important; margin-top: 32px !important; }
          .bottom-cta h2 { font-size: 1.875rem !important; }
        }
      `}</style>

      {/* Hero Section */}
      <div className="hero" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        padding: '100px 24px 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '5%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(116, 118, 55, 0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(207, 161, 59, 0.18) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'pulse 3s ease-in-out infinite'
        }} />
        
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(116, 118, 55, 0.15)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(116, 118, 55, 0.3)',
            color: '#c7d2fe',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '10px 24px',
            borderRadius: '100px',
            marginBottom: '32px'
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
              <circle cx="5" cy="5" r="5"/>
            </svg>
            {nicheName || 'Featured Article'}
          </div>
          
          <h1 style={{
            fontSize: '4rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 50%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.1',
            margin: '0 0 28px 0',
            letterSpacing: '-0.04em'
          }}>{nicheTitle}</h1>
          
          <p style={{
            fontSize: '1.3rem',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: '1.6',
            margin: '0 0 36px 0',
            fontWeight: 400,
            maxWidth: '750px'
          }}>
            Discover proven strategies and expert insights that deliver real results
          </p>
          
          <div style={{
            display: 'flex',
            gap: '28px',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.9375rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#6ee7b7'
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5L7 13L3 9"/>
              </svg>
              Expert Verified
            </span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>•</span>
            <span>Updated {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>•</span>
            <span>5 min read</span>
          </div>
        </div>
      </div>

      <div className="content-wrap" style={{
        maxWidth: '850px',
        margin: '-60px auto 0',
        padding: '0 24px 100px',
        position: 'relative',
        zIndex: 2
      }}>
        <article style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '28px',
          padding: '64px 72px',
          boxShadow: '0 30px 120px -20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(116, 118, 55, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div dangerouslySetInnerHTML={{ __html: page.content || '<p>Content not available</p>' }} />

          {/* Mid-Article CTA */}
          <div className="mid-cta" style={{
            margin: '56px 0',
            padding: '40px',
            background: 'linear-gradient(135deg, rgba(116, 118, 55, 0.12) 0%, rgba(207, 161, 59, 0.12) 100%)',
            border: '2px solid rgba(207, 161, 59, 0.25)',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #cfa13b 0%, #747637 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 32px rgba(207, 161, 59, 0.3)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em'
            }}>Want to Learn More?</h3>
            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(255,255,255,0.75)',
              margin: '0 0 28px 0',
              lineHeight: '1.6'
            }}>
              Thousands are already transforming their lives. Don't miss out on proven strategies that work.
            </p>
            <a
              href={page.affiliate_link}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 40px',
                background: 'linear-gradient(135deg, #cfa13b 0%, #747637 100%)',
                color: '#ffffff',
                fontSize: '1.125rem',
                fontWeight: 700,
                borderRadius: '100px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 12px 40px rgba(207, 161, 59, 0.4)',
                border: 'none'
              }}
            >
              Discover More
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </article>

        {/* Bottom CTA */}
        <div className="bottom-cta" style={{
          marginTop: '48px',
          padding: '56px 48px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: '28px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(207, 161, 59, 0.2)',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(207, 161, 59, 0.15) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '72px',
              height: '72px',
              background: 'linear-gradient(135deg, #cfa13b 0%, #747637 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 12px 48px rgba(207, 161, 59, 0.4)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 20px 0',
              letterSpacing: '-0.03em'
            }}>Ready to Transform Your Life?</h2>
            
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255,255,255,0.8)',
              margin: '0 0 36px 0',
              lineHeight: '1.7',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Join thousands who have already taken action. Get instant access and start seeing results today.
            </p>
            
            <a
              href={page.affiliate_link}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn-bottom"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '22px 52px',
                background: 'linear-gradient(135deg, #cfa13b 0%, #747637 50%, #747637 100%)',
                color: '#ffffff',
                fontSize: '1.25rem',
                fontWeight: 800,
                borderRadius: '100px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 16px 60px rgba(59, 130, 246, 0.5)',
                border: 'none',
                letterSpacing: '0.02em'
              }}
            >
              Get Started Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(255,255,255,0.5)',
              margin: '24px 0 0 0',
              letterSpacing: '0.05em'
            }}>
              ✓ Instant Access  •  ✓ 100% Risk-Free  •  ✓ No Hidden Fees
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
