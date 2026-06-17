"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({ title }: { title: string }) {
  return (
    <button
      className="group flex items-center justify-center gap-3 rounded-full px-8 py-4 bg-white border-2 border-[#dbb99a]/40 transition-all duration-300 hover:-translate-y-1 hover:border-[#c0622a] hover:text-[#c0622a] text-[#8b674f]"
      onClick={() => {
        if (typeof navigator !== "undefined" && navigator.share) {
          navigator.share({
            title: title,
            url: window.location.href,
          }).catch(console.error);
        }
      }}
    >
      <Share2 size={18} className="transition-transform group-hover:scale-110" />
    </button>
  );
}
