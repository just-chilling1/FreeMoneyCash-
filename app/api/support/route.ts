import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { consumeSupportQuota } from "@/lib/rate-limit"
import { SUPPORT_EMAIL, support } from "@/lib/support-config"

const APP_SUPPORT_NAME = support.productName
const NO_STORE = { "Cache-Control": "no-store" } as const

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")
}

/** Single-line, bounded subject for email/ticket headers. */
function sanitizeSubject(raw: unknown): string {
  if (typeof raw !== "string") return ""
  return raw.replace(/[\r\n]+/g, " ").trim().slice(0, 80)
}

function ticketBody(email: string, message: string, userId: string, requestType: string) {
  const requestTypeText = requestType ? `Request type: ${requestType}\n` : ""
  const requestTypeHtml = requestType
    ? `<br><strong>Request type:</strong> ${escapeHtml(requestType)}`
    : ""

  return {
    text: `Customer email: ${email}\nSoftware: ${APP_SUPPORT_NAME}\n${requestTypeText}\nCustomer inquiry is:\n${message}\n\n---\nUser ID: ${userId}`,
    html: `<p><strong>Customer email:</strong> ${escapeHtml(email)}<br><strong>Software:</strong> ${APP_SUPPORT_NAME}${requestTypeHtml}</p><p><strong>Customer inquiry is:</strong></p><p>${escapeHtml(message)}</p><p><em>User ID: ${userId}</em></p>`,
  }
}

async function sendViaResend(
  email: string,
  message: string,
  userId: string,
  requestType: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  const from = process.env.RESEND_FROM_EMAIL || `${APP_SUPPORT_NAME} <${SUPPORT_EMAIL}>`
  const { text, html } = ticketBody(email, message, userId, requestType)
  const subject = requestType
    ? `${APP_SUPPORT_NAME} — ${requestType} from ${email}`
    : `${APP_SUPPORT_NAME} support request from ${email}`

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [SUPPORT_EMAIL],
      reply_to: email,
      subject,
      text,
      html,
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error("[fmc] Resend email error:", res.status, detail)
    return false
  }

  return true
}

async function sendViaFreshdesk(
  email: string,
  message: string,
  userId: string,
  requestType: string,
): Promise<boolean> {
  const apiKey = process.env.FRESHDESK_API_KEY
  const domain = process.env.FRESHDESK_DOMAIN
  if (!apiKey || !domain) return false

  const auth = Buffer.from(`${apiKey}:X`).toString("base64")
  const { html } = ticketBody(email, message, userId, requestType)
  const subject = requestType
    ? `${APP_SUPPORT_NAME} — ${requestType}`
    : `${APP_SUPPORT_NAME} — Dashboard Support Request`

  const res = await fetch(`https://${domain}.freshdesk.com/api/v2/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      email,
      subject,
      description: html,
      priority: 2,
      status: 2,
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error("[fmc] Freshdesk ticket error:", res.status, detail)
    return false
  }

  return true
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE })
    }

    if (!consumeSupportQuota(user.id)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait and try again." },
        { status: 429, headers: NO_STORE },
      )
    }

    const body = await request.json().catch(() => ({}))
    const email = user.email?.trim() || ""
    const message = typeof body.message === "string" ? body.message.trim() : ""
    const subject = sanitizeSubject(body.subject)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Your account email is missing. Please sign in again." },
        { status: 400, headers: NO_STORE },
      )
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "Message is too short" }, { status: 400, headers: NO_STORE })
    }

    const sent =
      (await sendViaFreshdesk(email, message, user.id, subject)) ||
      (await sendViaResend(email, message, user.id, subject))

    if (!sent) {
      return NextResponse.json(
        {
          error: "Could not send automatically — opening your email app instead.",
          useMailto: true,
        },
        { status: 503, headers: NO_STORE },
      )
    }

    return NextResponse.json({ success: true }, { headers: NO_STORE })
  } catch (error) {
    console.error("[fmc] Support request error:", error)
    return NextResponse.json(
      {
        error: "Could not send automatically — opening your email app instead.",
        useMailto: true,
      },
      { status: 500, headers: NO_STORE },
    )
  }
}
