import { NavLink } from "react-router-dom";
import {
    // BarChart3,
    Bell,
    BrainCircuit,
    Building2,
    ClipboardPlus,
    FileBarChart,
    FlaskConical,
    LayoutDashboard,
    Leaf,
    Lightbulb,
    Recycle,
    ScanLine,
    // Settings,
    ShieldCheck,
    Warehouse,
} from "lucide-react";

const sections = [
    {
        label: "OVERVIEW",
        items: [
            {
                name: "Dashboard",
                path: "/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        label: "WASTE MANAGEMENT",
        items: [
            {
                name: "Register Waste",
                path: "/waste/register",
                icon: ClipboardPlus,
            },
            {
                name: "Waste Inventory",
                path: "/waste/inventory",
                icon: Warehouse,
            },
            {
                name: "Image Analysis",
                path: "/analysis/images",
                icon: ScanLine,
            },
        ],
    },
    {
        label: "AI INTELLIGENCE",
        items: [
            {
                name: "Material Classification",
                path: "/classification/material",
                icon: BrainCircuit,
            },
            {
                name: "Waste Classification",
                path: "/classification/waste",
                icon: FlaskConical,
            },
            {
                name: "Recommendations",
                path: "/recommendations",
                icon: Lightbulb,
            },
        ],
    },
    {
        label: "SUSTAINABILITY",
        items: [
            {
                name: "Sustainability",
                path: "/sustainability",
                icon: Leaf,
            },
            {
                name: "Reports",
                path: "/reports",
                icon: FileBarChart,
            },
        ],
    },
    {
        label: "MANAGEMENT",
        items: [
            {
                name: "Organization",
                path: "/organization",
                icon: Building2,
            },
            {
                name: "Facilities",
                path: "/facilities",
                icon: Recycle,
            },
            {
                name: "User Management",
                path: "/users",
                icon: ShieldCheck,
            },
        ],
    },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <Leaf size={23} />
                </div>

                <div>
                    <strong>Textile Waste</strong>
                    <span>Intelligence Platform</span>
                </div>
            </div>

            <nav className="sidebar-navigation">
                {sections.map((section) => (
                    <div
                        className="nav-section"
                        key={section.label}
                    >
                        <p className="nav-section-label">
                            {section.label}
                        </p>

                        {section.items.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-item ${isActive ? "active" : ""
                                        }`
                                    }
                                >
                                    <Icon size={18} />
                                    <span>{item.name}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink
                    to="/notifications"
                    className="nav-item"
                >
                    <Bell size={18} />
                    Notifications
                </NavLink>

                {/* <NavLink
                    to="/notifications"
                    className="nav-item"
                >
                    <Bell size={18} />
                    Notifications
                </NavLink> */}

                <div className="system-status">
                    <span className="status-dot" />

                    <div>
                        <strong>System operational</strong>
                        <span>All services available</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}