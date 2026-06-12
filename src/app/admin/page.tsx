import { createClient } from "@/lib/supabase/server";
import { Package, ShoppingBag, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [
    { count: catCount },
    { count: itemCount },
    { data: recentItems },
    { data: { user } },
  ] = await Promise.all([
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("items").select("*", { count: "exact", head: true }),
    supabase.from("items").select("*, categories(name)").order("created_at", { ascending: false }).limit(5),
    supabase.auth.getUser(),
  ]);

  const adminName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Admin";

  return (
    <div className="max-w-3xl">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 mb-6 text-white shadow-md">
        <p className="text-rose-100 text-sm mb-1">Welcome back,</p>
        <h1 className="text-2xl font-bold capitalize">{adminName} 👋</h1>
        <p className="text-rose-100 text-sm mt-1">Aradhya Collection Admin Panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center mb-3">
            <ShoppingBag size={20} className="text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{catCount ?? 0}</div>
          <div className="text-sm text-gray-400 mt-0.5">Total Categories</div>
          <Link href="/admin/categories" className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 mt-2">
            Manage <ArrowRight size={11} />
          </Link>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <Package size={20} className="text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{itemCount ?? 0}</div>
          <div className="text-sm text-gray-400 mt-0.5">Total Items</div>
          <Link href="/admin/items" className="text-xs text-purple-500 hover:text-purple-700 flex items-center gap-1 mt-2">
            Manage <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          href="/admin/categories"
          className="flex items-center gap-3 bg-white border border-rose-100 hover:border-rose-300 rounded-xl px-4 py-3 transition-colors group"
        >
          <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center group-hover:bg-rose-100 transition-colors">
            <Plus size={16} className="text-rose-500" />
          </div>
          <span className="text-sm font-medium text-gray-700">Add Category</span>
        </Link>
        <Link
          href="/admin/items"
          className="flex items-center gap-3 bg-white border border-purple-100 hover:border-purple-300 rounded-xl px-4 py-3 transition-colors group"
        >
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <Plus size={16} className="text-purple-500" />
          </div>
          <span className="text-sm font-medium text-gray-700">Add Item</span>
        </Link>
      </div>

      {/* Recent Items */}
      {recentItems && recentItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 text-sm">Recently Added Items</h2>
            <Link href="/admin/items" className="text-xs text-rose-500 hover:text-rose-700">View all</Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {recentItems.map((item: any) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.categories?.name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
