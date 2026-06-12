import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Item } from "@/lib/types";
import ItemImageSlider from "@/components/ItemImageSlider";
import PageTracker from "@/components/PageTracker";

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
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-700 mb-6"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {category.name}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {items?.length || 0} items available
          </p>
        </div>

        {!items || items.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No items in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {(items as Item[]).map((item) => {
              const images =
                item.image_urls?.length ? item.image_urls : [item.image_url];
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md border border-rose-50 hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 md:h-60 bg-rose-50">
                    <ItemImageSlider images={images} />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-semibold text-gray-800 text-sm">
                      {item.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-6 border-t border-rose-100">
        © {new Date().getFullYear()} Aradhya Collection. All rights reserved.
      </footer>
    </>
  );
}
