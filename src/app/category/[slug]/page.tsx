import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Item } from "@/lib/types";
import PageTracker from "@/components/PageTracker";
import ItemCard from "@/components/ItemCard";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: items } = await supabase
    .from("items")
    .select("*")
    .eq("category_id", category.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <PageTracker page={`category/${slug}`} meta={category.name} />
      <PageTracker page={`category/${slug}`} meta={category.name} event="category_view" />
      <div className="min-h-[100dvh] bg-[#f7ede4] flex flex-col pt-6 pb-20">
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a66a4f] hover:text-[#c0622a] transition-colors mb-10 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-[#dbb99a]/50 shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block rounded-full border border-[#dbb99a]/60 bg-white/70 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#b07050] backdrop-blur-sm mb-4">✦ Collection</span>
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
              style={{ background:"linear-gradient(120deg,#2a160f 0%,#c0622a 45%,#2a160f 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}
            >
              {category.name}
            </h1>
            <p className="mt-4 text-sm font-medium text-[#6f5344]">
              Explore {items?.length || 0} handpicked items in this collection
            </p>
          </div>

        {!items || items.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No items in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {(items as Item[]).map((item) => {
              const images = item.image_urls?.length ? item.image_urls : [item.image_url];
              return (
                <ItemCard key={item.id} id={item.id} name={item.name} images={images} />
              );
            })}
          </div>
        )}
        </main>
      </div>

      <Footer />
    </>
  );
}
