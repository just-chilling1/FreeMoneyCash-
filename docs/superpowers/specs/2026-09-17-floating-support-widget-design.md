# Floating Support Widget Design

**Date:** 2026-09-17  
**Status:** Approved for planning  
**Scope:** Replace the dashboard sidebar contact form with a global floating support widget on all protected pages.

## Problem

The contact support form currently lives as a full-length card at the top of the dashboard right sidebar. It consumes vertical space and is only available on the dashboard. Users need quick access to support from any logged-in page without a permanent full-height form.

## Goals

- Provide a fixed bottom-right support launcher on all protected (logged-in) pages.
- Expand into a compact support panel where the user can send a message.
- Preserve existing form fields, copy, validation, and `mailto:` submit behavior.
- Free the dashboard sidebar for Tips / Upgrades / Live stats only.

## Non-goals

- Live chat, ticketing, or server-side email sending
- Changing the support email address or mailto flow
- Adding a second support entry point in the dashboard sidebar
- New dependencies

## Chosen approach

**Fixed launcher in the protected layout (Intercom-style).**

Mount once in `app/(protected)/layout.tsx` as a fixed bottom-right control. Collapsed state is a round headphones button; expanded state is a panel above the button containing the existing support form. Remove the widget from `DashboardSidebar`.

Rejected alternatives:

- Bottom sheet on mobile + floating panel on desktop — better mobile typing UX, but two layouts to maintain.
- Dashboard sidebar card plus global launcher — duplicates UI and adds clutter.

## Placement & interaction

| Concern | Decision |
| --- | --- |
| Mount point | `app/(protected)/layout.tsx`, sibling to `BottomNav` |
| Sidebar | Remove `ContactSupportWidget` from `components/dashboard/sidebar.tsx` |
| Collapsed UI | Round primary button, headphones icon, fixed bottom-right |
| Desktop position | Approximately `bottom-6 right-6` |
| Mobile position | Raised above bottom nav (approximately `bottom-24` / safe-area aware) |
| Open | Click launcher → panel appears above button |
| Close | Click launcher again, panel header X, outside click, or Escape |
| Panel width | ~360px desktop; near full width with side margins on mobile |

## Visual & component behavior

- Match existing dark card styling (border, primary accents) used by the current support card.
- When open, launcher icon becomes X (or panel header provides clear close control — prefer icon swap on launcher plus header close for clarity).
- Panel header: “Contact Support”.
- Panel body: existing form content unchanged:
  - Intro reply-time copy
  - Email field (prefilled from Supabase auth user when available)
  - Message textarea
  - Validation errors
  - “Please note” reply-address notice
  - Send button
  - Direct-email fallback (`support@freemoneycash.com`)
  - Privacy line
- Success state remains inside the panel (“Check your email app” + send another).
- Motion: light fade + slight rise on open/close (Framer Motion is already used in the app via `BottomNav`; reuse if natural, otherwise CSS transitions).
- Z-index: above normal page content; stay below full-screen overlays/menus that already use a higher layer if applicable.
- Submit: unchanged `mailto:` to `support@freemoneycash.com` with subject/body encoding.

## Architecture

```
ProtectedLayout
  ├── AnimatedBackground
  ├── AppSidebar
  ├── main (page content)
  ├── BottomNav
  └── ContactSupportWidget  ← new global mount (fixed)
        ├── LauncherButton (collapsed / toggle)
        └── SupportPanel (open only)
              └── existing form + success UI
```

### File changes

1. **`components/dashboard/contact-support-widget.tsx`**  
   Refactor from always-visible sidebar card into fixed floating launcher + expandable panel. Keep form state, auth email prefills, validation, and mailto logic.

2. **`app/(protected)/layout.tsx`**  
   Render `<ContactSupportWidget />` once at layout level.

3. **`components/dashboard/sidebar.tsx`**  
   Remove `ContactSupportWidget` import and usage.

No API, schema, or env changes.

## Edge cases

- **Bottom nav overlap:** Mobile `bottom` offset must clear `BottomNav` and safe-area insets.
- **Keyboard / small viewports:** Panel should scroll internally if content exceeds available height above the launcher.
- **mailto success:** Keep current behavior (mark sent when mailto is invoked); “Send another” resets to the form inside the still-open panel.
- **Auth email load:** Prefill when available; user can still edit email.
- **Focus:** When panel opens, focus moves into the panel (email or message). Escape closes and returns focus to the launcher.

## Testing

- Desktop: launcher visible bottom-right on dashboard, create, pages, settings, etc.; open/close; submit opens mail client; success UI works.
- Mobile: launcher sits above bottom nav; panel usable; no overlap with More menu when closed.
- Dashboard sidebar no longer shows the support card; tips/upgrades/stats remain.
- Outside click and Escape close the panel.
- Invalid email / short message still show validation errors.

## Success criteria

- Support is reachable from any protected page via a bottom-right floating button.
- Dashboard right column no longer hosts a full-length support form.
- Form content and mailto behavior match the previous widget.
