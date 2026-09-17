"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink, Loader2, Pause, Pencil, Play, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SharePageDialog } from "@/components/share-page-dialog"
import Link from "next/link"

interface PageActionsProps {
  pageId: string
  pageTitle: string
  status: string
  affiliateLink: string
}

export function PageActions({ pageId, pageTitle, status, affiliateLink }: PageActionsProps) {
  const [loading, setLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [titleDraft, setTitleDraft] = useState(pageTitle)
  const [renameError, setRenameError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (renameOpen) {
      setTitleDraft(pageTitle)
      setRenameError("")
    }
  }, [renameOpen, pageTitle])

  const handleToggleStatus = async () => {
    setLoading(true)
    const supabase = createClient()
    const newStatus = status === "active" ? "paused" : "active"

    await supabase.from("pages").update({ status: newStatus }).eq("id", pageId)

    router.refresh()
    setLoading(false)
  }

  const handleRename = async () => {
    const nextTitle = titleDraft.trim()
    if (!nextTitle) {
      setRenameError("Enter a page title.")
      return
    }
    if (nextTitle === pageTitle.trim()) {
      setRenameOpen(false)
      return
    }

    setLoading(true)
    setRenameError("")
    const supabase = createClient()
    const { error } = await supabase.from("pages").update({ title: nextTitle }).eq("id", pageId)

    if (error) {
      setRenameError("Couldn't rename this page. Try again.")
      setLoading(false)
      return
    }

    setRenameOpen(false)
    router.refresh()
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    const supabase = createClient()

    await supabase.from("pages").delete().eq("id", pageId)

    setDeleteOpen(false)
    router.refresh()
    setLoading(false)
  }

  const articleUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/article/${pageId}`

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild variant="default" className="h-12 min-w-[140px] flex-1 text-base font-bold glow-purple">
        <Link href={`/article/${pageId}`} target="_blank">
          <ExternalLink className="mr-2 h-5 w-5" />
          View Page
        </Link>
      </Button>
      <SharePageDialog pageUrl={articleUrl} pageTitle={pageTitle} />
      <Button
        variant="outline"
        onClick={() => setRenameOpen(true)}
        disabled={loading}
        className="h-12 bg-transparent px-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_rgba(207,161,59,0.18)]"
      >
        <Pencil className="mr-2 h-5 w-5" />
        Rename
      </Button>
      <Button
        variant="outline"
        onClick={handleToggleStatus}
        disabled={loading}
        className="h-12 bg-transparent px-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_rgba(207,161,59,0.18)]"
      >
        {status === "active" ? (
          <>
            <Pause className="mr-2 h-5 w-5" />
            Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            Activate
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setDeleteOpen(true)}
        disabled={loading}
        aria-label="Delete page"
        className="h-12 w-12 rounded-full bg-transparent text-destructive transition-all duration-200 hover:-translate-y-0.5 hover:border-destructive/60 hover:bg-destructive/15 hover:text-destructive hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]"
      >
        <Trash2 className="h-5 w-5" />
      </Button>

      <Dialog open={renameOpen} onOpenChange={(open) => !loading && setRenameOpen(open)}>
        <DialogContent
          showCloseButton={!loading}
          className="glass-strong max-w-md border-primary/25 gap-0 p-0 sm:max-w-md"
        >
          <div className="space-y-5 p-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary">
              <Pencil className="h-7 w-7" />
            </div>

            <DialogHeader className="space-y-2 text-center sm:text-center">
              <DialogTitle className="text-2xl font-bold text-foreground">Rename page</DialogTitle>
              <DialogDescription className="text-base leading-relaxed text-muted-foreground">
                Update the title shown in Your Pages and Share Tools.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 text-left">
              <Label
                htmlFor={`rename-title-${pageId}`}
                className="text-xs font-semibold uppercase tracking-wide text-primary/90"
              >
                Page title
              </Label>
              <Input
                id={`rename-title-${pageId}`}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                disabled={loading}
                maxLength={120}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    void handleRename()
                  }
                }}
                className="h-12"
              />
              {renameError ? <p className="text-sm text-red-400">{renameError}</p> : null}
            </div>

            <DialogFooter className="gap-2 sm:justify-stretch">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setRenameOpen(false)}
                className="h-11 flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button type="button" disabled={loading} onClick={handleRename} className="h-11 flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Save Title
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(open) => !loading && setDeleteOpen(open)}>
        <DialogContent
          showCloseButton={!loading}
          className="glass-strong max-w-md border-destructive/30 gap-0 p-0 sm:max-w-md"
        >
          <div className="space-y-5 p-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
              <Trash2 className="h-7 w-7" />
            </div>

            <DialogHeader className="space-y-2 text-center sm:text-center">
              <DialogTitle className="text-2xl font-bold text-foreground">Delete this page?</DialogTitle>
              <DialogDescription className="text-base leading-relaxed text-muted-foreground">
                This permanently removes the page and its tracked stats. You can&apos;t undo this.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:justify-stretch">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setDeleteOpen(false)}
                className="h-11 flex-1 bg-transparent"
              >
                Keep Page
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={loading}
                onClick={handleDelete}
                className="h-11 flex-1 bg-red-600 text-white hover:bg-red-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Page
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
