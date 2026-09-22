import type { createClient } from "@/lib/supabase/server"

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/**
 * Resolve a niches.id by name (case-insensitive), falling back to any existing
 * niche or creating a "General" row if the table is empty.
 */
export async function resolveNicheId(
  supabase: SupabaseClient,
  nicheName: string,
): Promise<string | null> {
  const { data: named } = await supabase
    .from("niches")
    .select("id")
    .ilike("name", nicheName)
    .limit(1)
    .maybeSingle()

  if (named?.id) return named.id

  const { data: existing } = await supabase.from("niches").select("id").limit(1).maybeSingle()
  if (existing?.id) return existing.id

  const { data: created, error } = await supabase
    .from("niches")
    .insert({
      name: "General",
      description: "General niche for all content",
      icon: "📄",
    })
    .select("id")
    .single()

  if (error || !created) {
    console.error("[dfy-profit] could not resolve niche:", error)
    return null
  }

  return created.id
}
