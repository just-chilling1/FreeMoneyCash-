# Floating Support Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dashboard sidebar contact form with a fixed Intercom-style support widget on all protected pages.

**Architecture:** Refactor `ContactSupportWidget` into a fixed bottom-right launcher + expandable panel. Mount it once in the protected layout. Remove it from the dashboard sidebar. Keep existing form fields, validation, and `mailto:` submit behavior.

**Tech Stack:** Next.js App Router, React client component, Tailwind, Framer Motion (`AnimatePresence`/`motion`), Lucide icons, existing shadcn `Card`/`Button`/`Input`/`Textarea`/`Label`, Supabase browser client for email prefill.

## Global Constraints

- No new dependencies
- Support email remains `support@freemoneycash.com`
- Submit remains client-side `mailto:` only
- Mobile launcher must clear `BottomNav` (~`bottom-24`)
- Z-index above page content (`z-50`) but below bottom-nav More overlay (`z-[60]` / `z-[70]`)
- No automated test suite in repo — verify manually in the browser

## File map

| File | Responsibility |
| --- | --- |
| `components/dashboard/contact-support-widget.tsx` | Floating launcher + panel + form |
| `app/(protected)/layout.tsx` | Global mount |
| `components/dashboard/sidebar.tsx` | Remove sidebar support card |

---

### Task 1: Refactor ContactSupportWidget into floating launcher + panel

**Files:**
- Modify: `components/dashboard/contact-support-widget.tsx`

**Interfaces:**
- Consumes: existing form state/helpers inside the file; `createClient` from `@/lib/supabase/client`
- Produces: `export function ContactSupportWidget(): JSX.Element` — fixed overlay, no props

- [x] **Step 1: Replace the component with the floating widget implementation**

Rewrite `components/dashboard/contact-support-widget.tsx` to:

1. Keep `SUPPORT_EMAIL`, email/message/submitting/sent/error state, auth email prefill `useEffect`, and `handleSubmit` mailto logic exactly as today (same validation messages and body format).
2. Add `open` boolean state.
3. Add `useEffect` for Escape → `setOpen(false)`.
4. Add `useEffect` / `useRef` for outside-click: when open, mousedown outside the root container closes.
5. When open, focus the email input (or message if email already filled) via ref.
6. Render structure:

```tsx
<div
  ref={rootRef}
  className="fixed z-50 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 sm:bottom-6 sm:right-6"
>
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        className="mb-3 w-[min(100vw-2rem,360px)]"
      >
        {/* Card panel: header with title + X button; scrollable body max-h-[min(70dvh,560px)] overflow-y-auto */}
        {/* Reuse existing form / success UI inside CardContent */}
      </motion.div>
    )}
  </AnimatePresence>

  <button
    type="button"
    aria-expanded={open}
    aria-label={open ? "Close support" : "Contact support"}
    onClick={() => setOpen((v) => !v)}
    className="ml-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
  >
    {open ? <X className="h-6 w-6" /> : <Headphones className="h-6 w-6" />}
  </button>
</div>
```

7. Panel header: Headphones icon + “Contact Support” + outline/ghost X close button that calls `setOpen(false)`.
8. Keep all form copy, fields, notes, fallback email, privacy line, and success state from the current component.
9. Launcher sits at the bottom of the fixed container (`ml-auto` so it aligns right when panel is full width).

- [x] **Step 2: Manual smoke check of the component file**

Confirm the file exports `ContactSupportWidget`, is `"use client"`, and has no TypeScript-obvious errors (imports for `X`, `AnimatePresence`, `motion`, hooks).

- [ ] **Step 3: Commit** (skipped — wait for explicit commit request)

```bash
git add components/dashboard/contact-support-widget.tsx
git commit -m "feat: turn contact support into floating expandable widget"
```

---

### Task 2: Mount globally and remove from dashboard sidebar

**Files:**
- Modify: `app/(protected)/layout.tsx`
- Modify: `components/dashboard/sidebar.tsx`

**Interfaces:**
- Consumes: `ContactSupportWidget` from `@/components/dashboard/contact-support-widget`
- Produces: widget available on all protected routes; dashboard sidebar without support card

- [x] **Step 1: Mount in protected layout**

In `app/(protected)/layout.tsx`, import and render after `BottomNav`:

```tsx
import { ContactSupportWidget } from "@/components/dashboard/contact-support-widget"
// ...
<BottomNav />
<ContactSupportWidget />
```

- [x] **Step 2: Remove from dashboard sidebar**

In `components/dashboard/sidebar.tsx`, delete the `ContactSupportWidget` import and the `<ContactSupportWidget />` line. Sidebar should still render Tips, Premium Upgrades, and Live Stats.

- [x] **Step 3: Verify**

- Run `npx tsc --noEmit` if available, or rely on Next.js typecheck during `npm run dev`.
- Manually: open `/dashboard` — floating button bottom-right, no support card in sidebar.
- Open `/create` (or another protected page) — same floating button.
- Open panel, Escape closes, outside click closes, submit still triggers mailto.

- [ ] **Step 4: Commit** (skipped — wait for explicit commit request)

```bash
git add app/(protected)/layout.tsx components/dashboard/sidebar.tsx
git commit -m "feat: mount floating support widget on all protected pages"
```

---

## Spec coverage checklist

- [x] Global protected mount → Task 2
- [x] Remove from sidebar → Task 2
- [x] Round headphones launcher / expand panel → Task 1
- [x] Mobile above bottom nav → Task 1 (`bottom-[calc(...+5.5rem)]`)
- [x] Same form content + mailto → Task 1
- [x] Escape / outside click / X close → Task 1
- [x] Light motion → Task 1 (Framer Motion)
- [x] z-50 below More menu → Task 1
