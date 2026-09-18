"use client"

import type { ReactNode } from "react"
import { ChevronDown, FolderOpen, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SavedGenerationRow = {
  id: string
  name: string
  affiliateUrl: string
  updatedAt: string
}

export function SavedGenerationsLibrary<T extends SavedGenerationRow>({
  title,
  subtitle,
  emptyTitle,
  emptyHint,
  sets,
  libraryOpen,
  onLibraryOpenChange,
  openSetId,
  onOpenSetIdChange,
  deletingId,
  error,
  onDelete,
  metaForSet,
  renderSet,
}: {
  title: string
  subtitle: string
  emptyTitle: string
  emptyHint: string
  sets: T[]
  libraryOpen: boolean
  onLibraryOpenChange: (open: boolean) => void
  openSetId: string | null
  onOpenSetIdChange: (id: string | null) => void
  deletingId: string | null
  error: string
  onDelete: (id: string) => void
  metaForSet: (set: T) => string
  renderSet: (set: T) => ReactNode
}) {
  return (
    <section className="glass-card overflow-hidden p-0">
      <button
        type="button"
        onClick={() => onLibraryOpenChange(!libraryOpen)}
        aria-expanded={libraryOpen}
        className="flex w-full flex-wrap items-center gap-3 border-b border-border bg-secondary/15 p-5 text-left transition-colors hover:bg-secondary/25 md:p-6"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card text-accent shadow-sm">
          <FolderOpen size={24} strokeWidth={1.75} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-accent">Library</span>
          <span className="block text-xl font-semibold text-foreground sm:text-2xl">{title}</span>
          <span className="mt-1 block text-sm text-muted-foreground">{subtitle}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground">
            {sets.length} set{sets.length === 1 ? "" : "s"}
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-accent transition-transform duration-200",
              libraryOpen && "rotate-180",
            )}
            aria-hidden
          />
        </span>
      </button>

      {libraryOpen ? (
        <div className="space-y-4 p-5 md:p-6">
          {error ? (
            <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/15 px-3.5 py-2.5 text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}

          {sets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
              <FolderOpen className="mx-auto h-8 w-8 text-accent" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-foreground">{emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{emptyHint}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sets.map((set) => {
                const open = openSetId === set.id
                return (
                  <article key={set.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-md">
                    <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                      <button
                        type="button"
                        onClick={() => onOpenSetIdChange(open ? null : set.id)}
                        aria-expanded={open}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-accent">
                          <FolderOpen className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-foreground">{set.name}</span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">{metaForSet(set)}</span>
                        </span>
                        <ChevronDown
                          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
                          aria-hidden
                        />
                      </button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={deletingId === set.id}
                        onClick={() => onDelete(set.id)}
                        className="h-9 shrink-0"
                        aria-label={`Delete ${set.name}`}
                      >
                        {deletingId === set.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>

                    {open ? (
                      <div className="space-y-3 border-t border-border bg-muted/40 px-4 py-4 sm:px-5">
                        <p className="truncate text-xs text-muted-foreground">{set.affiliateUrl}</p>
                        {renderSet(set)}
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      ) : null}
    </section>
  )
}
