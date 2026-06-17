"use client";

import { track } from "@/lib/track";
import ItemImageSlider from "@/components/ItemImageSlider";
import Link from "next/link";

interface Props {
  id: string;
  name: string;
  images: string[];
}

export default function ItemCard({ id, name, images }: Props) {
  return (
    <Link
      href={`/item/${id}`}
      className="group relative bg-white/60 backdrop-blur-md rounded-2xl md:rounded-[2rem] overflow-hidden border border-[#dbb99a]/40 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col"
      onClick={() => track("item_view", id, name)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
      <div className="relative aspect-[4/5] bg-gradient-to-br from-[#f1e4d8] to-[#f9ede4] p-4 sm:p-6 flex items-center justify-center">
        <ItemImageSlider images={images} />
      </div>
      <div className="p-4 md:p-6 text-center border-t border-[#e8d0b8]/30 bg-white">
        <h3 className="font-bold text-[#3a1e10] text-sm md:text-base leading-snug group-hover:text-[#c0622a] transition-colors">{name}</h3>
      </div>
    </Link>
  );
}
