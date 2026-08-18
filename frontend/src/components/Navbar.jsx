import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaRecycle } from "react-icons/fa";

import NotificationBell from "./NotificationBell";

import "./Navbar.css";

function Navbar() {

    const location = useLocation();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );


    // ==========================================
    // Dashboard Path Based on Role
    // ==========================================

    const getDashboardPath = () => {

        switch (user?.role) {

            case "recycling_operator":
                return "/dashboard/recycling";

            case "sustainability_manager":
                return "/dashboard/sustainability";

            case "manufacturer":
                return "/dashboard/manufacturer";

            case "admin":
                return "/dashboard";

            default:
                return "/dashboard";
        }
    };


    const dashboardPath = getDashboardPath();


    // ==========================================
    // Logout
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };


    return (

        <nav className="navbar">

            {/* ==========================================
                Logo
            ========================================== */}

            <div
                className="logo"
                onClick={() => navigate("/")}
            >

                <FaRecycle className="logo-icon" />

                <div className="logo-text">

                    <h2>
                        Textile Waste
                    </h2>

                    <span>
                        Intelligence Platform
                    </span>

                </div>

            </div>


            {/* ==========================================
                BEFORE LOGIN
            ========================================== */}

            {!token ? (

                <div className="nav-links">

                    <Link
                        to="/"
                        className={
                            location.pathname === "/"
                                ? "active"
                                : ""
                        }
                    >
                        Home
                    </Link>


                    <Link
                        to="/login"
                        className={
                            location.pathname === "/login"
                                ? "active"
                                : ""
                        }
                    >
                        Login
                    </Link>


                    <Link
                        to="/register"
                        className={
                            location.pathname === "/register"
                                ? "active"
                                : ""
                        }
                    >
                        Register
                    </Link>

                </div>

            ) : (

                /* ==========================================
                    AFTER LOGIN
                ========================================== */

                <div className="nav-right">


                    {/* ======================================
                        Navigation Links
                    ====================================== */}

                    <div className="nav-links">

                        <Link
                            to={dashboardPath}
                            className={
                                location.pathname === dashboardPath
                                    ? "active"
                                    : ""
                            }
                        >
                            Dashboard
                        </Link>


                        <Link
                            to="/analyze"
                            className={
                                location.pathname === "/analyze"
                                    ? "active"
                                    : ""
                            }
                        >
                            Analyze Textile
                        </Link>


                        <Link
                            to="/inventory"
                            className={
                                location.pathname === "/inventory"
                                    ? "active"
                                    : ""
                            }
                        >
                            Inventory
                        </Link>


                        <Link
                            to="/analysis-history"
                            className={
                                location.pathname === "/analysis-history"
                                    ? "active"
                                    : ""
                            }
                        >
                            Analysis History
                        </Link>


                        <Link
                            to="/profile"
                            className={
                                location.pathname === "/profile"
                                    ? "active"
                                    : ""
                            }
                        >
                            Profile
                        </Link>

                    </div>


                    {/* ======================================
                        Notification Bell
                    ====================================== */}

                    <div className="navbar-notification">

                        <NotificationBell />

                    </div>


                    {/* ======================================
                        User Section
                    ====================================== */}

                    <div className="user-section">

                        <div className="avatar">

                            {user?.full_name
                                ? user.full_name
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}

                        </div>


                        <div className="user-info">

                            <span className="user-name">

                                {user?.full_name || "User"}

                            </span>


                            <span className="user-role">

                                {user?.role
                                    ?.replaceAll("_", " ")}

                            </span>

                        </div>


                        <button
                            className="logout-nav-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>

                </div>

            )}

        </nav>

    );
}

export default Navbar;