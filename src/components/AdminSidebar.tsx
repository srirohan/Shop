"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LayoutGrid, Package, ShoppingBag, LogOut, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/categories", label: "Categories", icon: ShoppingBag },
  { href: "/admin/items", label: "Items", icon: Package },
  { href: "/admin/profile", label: "Profile", icon: UserCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAdminEmail(user.email || "");
        setAdminName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out successfully!");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-rose-400 to-pink-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-800 text-sm">Admin Panel</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Aradhya Collection</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active ? "bg-rose-50 text-rose-600 font-semibold" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Admin Info + Logout */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        <Link href="/admin/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-rose-100 flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-rose-400 font-bold text-sm uppercase">
                {adminName.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate capitalize">{adminName}</p>
            <p className="text-xs text-gray-400 truncate">{adminEmail}</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
