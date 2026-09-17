import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, MousePointerClick, Calendar } from "lucide-react"
import Link from "next/link"
import { PageActions } from "@/components/page-actions"

export default async function MyPagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's pages with niche and offer details
  const { data: pages } = await supabase
    .from("pages")
    .select(
      `
      *,
      niches (name, icon),
      offers (title)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-2">Your Pages</h1>
          <p className="text-xl text-muted-foreground">Manage and track your profit pages</p>
        </div>
        <Button asChild className="h-14 text-lg font-bold glow-purple" size="lg">
          <Link href="/create">Build New Page</Link>
        </Button>
      </div>

      {!pages || pages.length === 0 ? (
        <Card className="glass-strong border-border/50">
          <CardContent className="p-12 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Eye className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">No Pages Yet</h2>
              <p className="text-lg text-muted-foreground">
                Create your first profit page and start earning commissions today
              </p>
            </div>
            <Button asChild className="h-14 text-lg font-bold glow-purple" size="lg">
              <Link href="/create">Build Your First Page</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pages.map((page) => (
            <Card key={page.id} className="glass border-border/50 hover:glow-purple transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{page.niches?.icon}</span>
                      <CardTitle className="text-2xl font-bold text-foreground">{page.title}</CardTitle>
                    </div>
                    <p className="text-base text-muted-foreground">
                      Promoting: <span className="font-semibold text-foreground">{page.offers?.title}</span>
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-bold ${
                      page.status === "active"
                        ? "bg-accent/20 text-accent"
                        : page.status === "paused"
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-primary" />
                      <p className="text-sm text-muted-foreground font-semibold">Views</p>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{page.views || 0}</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MousePointerClick className="w-5 h-5 text-secondary" />
                      <p className="text-sm text-muted-foreground font-semibold">Clicks</p>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{page.clicks || 0}</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-accent" />
                      <p className="text-sm text-muted-foreground font-semibold">Created</p>
                    </div>
                    <p className="text-base font-bold text-foreground">
                      {new Date(page.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <PageActions
                  pageId={page.id}
                  pageTitle={page.title}
                  status={page.status}
                  affiliateLink={page.affiliate_link}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
