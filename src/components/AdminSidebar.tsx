"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles, LayoutGrid, Package, ShoppingBag, LogOut,
  UserCircle, ChevronLeft, ChevronRight, Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/categories", label: "Categories", icon: ShoppingBag },
  { href: "/admin/items", label: "Items", icon: Package },
  { href: "/admin/user-records", label: "User Records", icon: Users },
  { href: "/admin/profile", label: "Profile", icon: UserCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

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
    <aside
      className={`relative flex flex-col min-h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-rose-50 hover:border-rose-300 transition-colors"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={13} className="text-gray-500" />
        ) : (
          <ChevronLeft size={13} className="text-gray-500" />
        )}
      </button>

      {/* Logo */}
      <div className={`p-4 border-b border-gray-100 ${collapsed ? "flex justify-center" : ""}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 flex-shrink-0 bg-gradient-to-br from-rose-400 to-pink-600 rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="font-bold text-gray-800 text-sm block truncate">Admin Panel</span>
              <p className="text-xs text-gray-400 truncate">Aradhya Collection</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <Link
        href="/admin/profile"
        className={`flex items-center gap-3 border-b border-gray-100 hover:bg-rose-50 transition-colors ${
          collapsed ? "justify-center p-3" : "p-4"
        }`}
        title={collapsed ? adminName : undefined}
      >
        <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-rose-100 ring-2 ring-rose-200">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="avatar" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-rose-500 font-bold text-base uppercase">
              {adminName.charAt(0)}
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate capitalize">{adminName}</p>
            <p className="text-xs text-gray-400 truncate">{adminEmail}</p>
          </div>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active ? "bg-rose-50 text-rose-600 font-semibold" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={17} className="flex-shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-gray-100">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
