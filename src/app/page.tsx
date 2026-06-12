import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/lib/types";
import { ArrowRight, Star, MessageCircle } from "lucide-react";
import HeroSlider from "@/components/HeroSlider";
import ContactForm from "@/components/ContactForm";

export const revalidate = 60;

const categoryEmoji: Record<string, string> = {
  "lady-purse": "👜",
  "ladies-suit": "👗",
  "home-decor": "🏠",
  "hair-accessories": "💇",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-16 md:py-24">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-pink-200/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-rose-200 rounded-full px-4 py-1.5 mb-5 shadow-sm">
            <Star size={13} className="text-rose-400 fill-rose-400" />
            <span className="text-xs font-semibold text-rose-600">Premium Quality Collection</span>
            <Star size={13} className="text-rose-400 fill-rose-400" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-rose-600 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Aradhya
            </span>
            <br />
            <span className="text-gray-800">Collection</span>
          </h1>

          <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto mb-8">
            Exclusively for women — Explore our finest range of Purses, Suits,
            Home Decor & Hair Accessories
          </p>

          <Link
            href="#categories"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold px-7 py-3 rounded-full shadow-lg hover:shadow-rose-200 hover:scale-105 transition-all"
          >
            Explore Collection <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Divider strip */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 py-2.5">
        <p className="text-center text-white text-xs font-medium tracking-widest uppercase">
          ✦ Lady Purse &nbsp;&nbsp; ✦ Ladies Suit &nbsp;&nbsp; ✦ Home Decor &nbsp;&nbsp; ✦ Hair Accessories
        </p>
      </div>

      {/* Hero Slider — auto-sliding categories */}
      {categories && categories.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <HeroSlider categories={categories as Category[]} />
        </div>
      )}

      {/* Categories Section */}
      <main id="categories" className="flex-1 max-w-6xl mx-auto px-4 py-14 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Our <span className="text-rose-500">Collections</span>
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Choose a category and find your favourite items
          </p>
        </div>

        {!categories || categories.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No categories available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {(categories as Category[]).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-rose-50"
              >
                <div className="relative h-48 md:h-60 bg-gradient-to-br from-rose-100 to-pink-50 overflow-hidden">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl group-hover:scale-110 transition-transform duration-300 inline-block">
                        {categoryEmoji[cat.slug] || "🛍️"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-600/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="text-white text-xs font-semibold flex items-center gap-1">
                      View <ArrowRight size={12} />
                    </span>
                  </div>
                </div>

                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base group-hover:text-rose-600 transition-colors">
                    {cat.name}
                  </h3>
                  <div className="mt-1.5 h-0.5 w-0 group-hover:w-12 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Contact Section */}
      <section className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-rose-200 rounded-full px-4 py-1.5 mb-4 shadow-sm">
              <MessageCircle size={13} className="text-rose-400" />
              <span className="text-xs font-semibold text-rose-600">Humse Sampark Karein</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Koi <span className="text-rose-500">Sawaal</span> Hai?
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              Apna naam aur message bhejein — hum jaldi reply karenge
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-rose-100 p-6 md:p-8">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-rose-100 py-8 mt-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-rose-400 to-pink-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="font-bold text-rose-600">Aradhya Collection</span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Aradhya Collection. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
