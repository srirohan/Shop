"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

export default function PageTracker({ page, meta }: { page: string; meta?: string }) {
  useEffect(() => {
    track("page_view", page, meta);
  }, [page, meta]);

  return null;
}
