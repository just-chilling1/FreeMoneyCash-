const DEFAULT_TIMEOUT_MS = 42_000

export interface AiCallOptions {
  maxRetries?: number
  timeoutMs?: number
}

interface ChatResponse {
  result?: string
  message?: string | { content?: string }
  response?: string
  choices?: { message?: { content?: string } }[]
}

function rapidApiKey(): string {
  return process.env.RAPIDAPI_KEY?.trim() || ""
}

function rapidApiHost(): string {
  return process.env.RAPIDAPI_HOST?.trim() || "chatgpt-42.p.rapidapi.com"
}

export function isAiConfigured(): boolean {
  return rapidApiKey().length > 0
}

export function extractJsonFromText(text: string): unknown {
  const trimmed = text.trim()

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidates: string[] = []
  if (fenced?.[1]) candidates.push(fenced[1].trim())

  const objStart = trimmed.indexOf("{")
  const objEnd = trimmed.lastIndexOf("}")
  if (objStart !== -1 && objEnd > objStart) candidates.push(trimmed.slice(objStart, objEnd + 1))

  const arrStart = trimmed.indexOf("[")
  const arrEnd = trimmed.lastIndexOf("]")
  if (arrStart !== -1 && arrEnd > arrStart) candidates.push(trimmed.slice(arrStart, arrEnd + 1))

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {
      /* try the next candidate */
    }
  }

  return null
}

function readResponseText(data: ChatResponse): string {
  const message = typeof data.message === "string" ? data.message : data.message?.content
  const text = data.result || message || data.response || data.choices?.[0]?.message?.content || ""
  return typeof text === "string" ? text : ""
}

export async function generateText(prompt: string, options: AiCallOptions = {}): Promise<string> {
  const key = rapidApiKey()
  if (!key) throw new Error("RAPIDAPI_KEY is not configured")

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(`https://${rapidApiHost()}/gpt4o`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": key,
        "x-rapidapi-host": rapidApiHost(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }], web_access: false }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => "")
      throw new Error(`AI request failed: ${response.status}${detail ? ` - ${detail.slice(0, 200)}` : ""}`)
    }

    const text = readResponseText((await response.json()) as ChatResponse)
    if (!text) throw new Error("Empty AI response")
    return text
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Ask for JSON and keep asking until `validate` accepts the shape.
 * Retries exist because this endpoint regularly wraps JSON in prose or
 * truncates long articles.
 */
export async function generateStructuredJson<T>(args: {
  prompt: string
  validate: (raw: unknown) => T | null
  options?: AiCallOptions
}): Promise<T> {
  const maxRetries = args.options?.maxRetries ?? 3
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      const raw = await generateText(
        attempt === 0
          ? args.prompt
          : `${args.prompt}\n\nIMPORTANT: your previous reply was rejected. Reply with valid JSON only, no prose, no markdown fences.`,
        args.options,
      )
      const validated = args.validate(extractJsonFromText(raw))
      if (validated) return validated
      lastError = new Error("AI response failed validation")
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  throw lastError ?? new Error("AI generation failed")
}
