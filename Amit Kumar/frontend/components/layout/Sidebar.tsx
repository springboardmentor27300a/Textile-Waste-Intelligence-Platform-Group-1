"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Leaf, LayoutDashboard, Package, Camera, Tag, Recycle, TrendingUp,
  Globe, FileText, Bell, Settings, Users, LogOut, ChevronRight, X,
  Factory, RefreshCw
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",                  icon: LayoutDashboard, label: "Dashboard"          },
  { href: "/dashboard/inventory",        icon: Package,         label: "Inventory"          },
  { href: "/dashboard/image-analysis",   icon: Camera,          label: "Image Analysis"     },
  { href: "/dashboard/classification",   icon: Tag,             label: "Classification"     },
  { href: "/dashboard/recommendations",  icon: Recycle,         label: "Recommendations"    },
  { href: "/dashboard/sustainability",   icon: TrendingUp,      label: "Sustainability"      },
  { href: "/dashboard/environmental",    icon: Globe,           label: "Environmental"       },
  { href: "/dashboard/reports",          icon: FileText,        label: "Reports"             },
  { href: "/dashboard/notifications",    icon: Bell,            label: "Notifications"       },
];

// Role-specific dashboards (Milestone 4)
const ROLE_DASHBOARDS = [
  { href: "/dashboard/recycling-facility", icon: RefreshCw, label: "Recycling Facility",  roles: ["recycling_facility_operator", "admin"] },
  { href: "/dashboard/manufacturer",       icon: Factory,   label: "Manufacturer View",   roles: ["textile_manufacturer", "admin"] },
];

const ADMIN_ITEMS = [
  { href: "/dashboard/admin", icon: Users, label: "Admin Panel" },
];

const BOTTOM_ITEMS = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const getShortenedRole = (role: string) =>
    role?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed left-0 top-0 h-full w-64 z-50 flex flex-col transition-transform duration-300
        bg-dark-900/95 backdrop-blur-xl border-r border-white/5 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm">TWIP</p>
              <p className="text-[10px] text-gray-500 leading-tight">Textile Waste Intelligence</p>
            </div>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{getShortenedRole(user?.role || "")}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-2 mb-3">Main Menu</p>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href}
              className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}>
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{width: 18, height: 18}} />
              <span className="flex-1">{item.label}</span>
              {isActive(item.href) && <ChevronRight className="w-4 h-4 text-primary-400" />}
            </Link>
          ))}

          {/* Role-specific dashboards (Milestone 4) */}
          {ROLE_DASHBOARDS.some(d => d.roles.includes(user?.role || "")) && (
            <>
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-2 mt-4 mb-3">Role Dashboards</p>
              {ROLE_DASHBOARDS.filter(d => d.roles.includes(user?.role || "")).map(item => (
                <Link key={item.href} href={item.href}
                  className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}>
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{width: 18, height: 18}} />
                  <span className="flex-1">{item.label}</span>
                  {isActive(item.href) && <ChevronRight className="w-4 h-4 text-primary-400" />}
                </Link>
              ))}
            </>
          )}

          {isAdmin && (
            <>
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-2 mt-4 mb-3">Admin</p>
              {ADMIN_ITEMS.map(item => (
                <Link key={item.href} href={item.href}
                  className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}>
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{width: 18, height: 18}} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5 space-y-1">
          {BOTTOM_ITEMS.map(item => (
            <Link key={item.href} href={item.href}
              className={`sidebar-item ${isActive(item.href) ? "active" : ""}`}>
              <item.icon style={{width: 18, height: 18}} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button onClick={logout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut style={{width: 18, height: 18}} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
