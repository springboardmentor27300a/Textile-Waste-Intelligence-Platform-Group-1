"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { Menu, Bell, Sun, Moon, Search, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import api from "@/lib/api";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/inventory": "Textile Inventory",
  "/dashboard/image-analysis": "Image Analysis",
  "/dashboard/classification": "Material Classification",
  "/dashboard/recommendations": "Recycling Recommendations",
  "/dashboard/sustainability": "Sustainability Engine",
  "/dashboard/environmental": "Environmental Impact",
  "/dashboard/reports": "Reports",
  "/dashboard/notifications": "Notifications",
  "/dashboard/admin": "Admin Panel",
  "/dashboard/settings": "Settings",
};

interface NavbarProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
}

export default function Navbar({ onMenuToggle, sidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(3);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const title = PAGE_TITLES[pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 flex items-center px-6 gap-4">
      {/* Menu toggle */}
      <button onClick={onMenuToggle} className="btn-ghost p-2">
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h2 className="font-bold text-white text-lg">{title}</h2>
        <p className="text-xs text-gray-500">Textile Waste Intelligence Platform</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-64">
        <Search className="w-4 h-4 text-gray-500" />
        <input className="bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none flex-1"
          placeholder="Search..." />
      </div>

      {/* Theme toggle */}
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="btn-ghost p-2">
        {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
      </button>

      {/* Notifications */}
      <Link href="/dashboard/notifications" className="relative btn-ghost p-2">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="notif-dot">{unreadCount}</span>
        )}
      </Link>

      {/* User dropdown */}
      <div className="relative">
        <button onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-xl px-3 py-2 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {user?.full_name?.charAt(0)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-white leading-none">{user?.full_name?.split(" ")[0]}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace(/_/g, " ")}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 glass-card py-2 shadow-2xl z-50">
            <Link href="/dashboard/settings" onClick={() => setDropdownOpen(false)}
              className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
              Profile Settings
            </Link>
            <hr className="border-white/10 my-1" />
            <button onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
