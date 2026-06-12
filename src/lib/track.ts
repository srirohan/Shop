import { createClient } from "@/lib/supabase/client";

export async function track(event: string, page?: string, meta?: string) {
  try {
    const supabase = createClient();
    await supabase.from("analytics").insert({ event, page, meta });
  } catch {}
}
