import { useState } from "react";

import {
    FaRecycle,
    FaLeaf,
    FaIndustry,
    FaShieldAlt,
    FaUsers,
    FaChartLine,
    FaBoxes,
    FaArrowRight,
    FaFileAlt,
    FaBullhorn
} from "react-icons/fa";

import { Link } from "react-router-dom";

import { createPlatformAnnouncement } from "../../services/dashboardService";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "./AdminDashboard.css";


function AdminDashboard() {

    // ==========================================
    // Platform Announcement State
    // ==========================================

    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementMessage, setAnnouncementMessage] = useState("");
    const [announcementPriority, setAnnouncementPriority] = useState("medium");

    const [announcementLoading, setAnnouncementLoading] = useState(false);
    const [announcementSuccess, setAnnouncementSuccess] = useState("");
    const [announcementError, setAnnouncementError] = useState("");


    // ==========================================
    // Create Platform Announcement
    // ==========================================

    const handleCreateAnnouncement = async (e) => {

        e.preventDefault();

        setAnnouncementSuccess("");
        setAnnouncementError("");

        if (!announcementTitle.trim()) {
            setAnnouncementError(
                "Please enter an announcement title."
            );
            return;
        }

        if (!announcementMessage.trim()) {
            setAnnouncementError(
                "Please enter an announcement message."
            );
            return;
        }

        try {

            setAnnouncementLoading(true);

            const response = await createPlatformAnnouncement(
                announcementTitle,
                announcementMessage,
                announcementPriority
            );

            setAnnouncementSuccess(
                `Announcement sent successfully to ${response.data.created_count} active users.`
            );

            // Clear form
            setAnnouncementTitle("");
            setAnnouncementMessage("");
            setAnnouncementPriority("medium");

        } catch (error) {

            console.error(
                "Announcement error:",
                error
            );

            if (error.response?.status === 403) {

                setAnnouncementError(
                    "Only administrators can create platform announcements."
                );

            } else {

                setAnnouncementError(
                    error.response?.data?.detail ||
                    "Failed to send announcement."
                );

            }

        } finally {

            setAnnouncementLoading(false);

        }

    };

    return (
        <>
            <Navbar />

            <main className="admin-dashboard">

                {/* =========================================
                    HERO
                ========================================= */}

                <section className="admin-hero">

                    <div className="admin-hero-content">

                        <div className="admin-hero-icon">
                            <FaShieldAlt />
                        </div>

                        <div>

                            <span className="admin-hero-label">
                                PLATFORM ADMINISTRATION
                            </span>

                            <h1>
                                Admin Control Center
                            </h1>

                            <p>
                                Monitor the Textile Waste Intelligence
                                Platform, manage workspaces and oversee
                                sustainability operations.
                            </p>

                        </div>

                    </div>


                    <div className="admin-status">

                        <FaChartLine />

                        <div>

                            <span>
                                Platform Status
                            </span>

                            <strong>
                                Active
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =========================================
                    PLATFORM OVERVIEW
                ========================================= */}

                <section className="admin-section">

                    <div className="admin-section-heading">

                        <div>

                            <span>
                                PLATFORM OVERVIEW
                            </span>

                            <h2>
                                System at a Glance
                            </h2>

                        </div>

                        <p>
                            Access and monitor the major operational
                            areas of the platform.
                        </p>

                    </div>


                    <div className="admin-overview-grid">

                        {/* User Management */}

                        <Link
                            to="/admin/users"
                            className="admin-overview-card blue"
                        >

                            <div className="overview-icon">
                                <FaUsers />
                            </div>

                            <div>

                                <span>
                                    User Management
                                </span>

                                <strong>
                                    Manage
                                </strong>

                                <small>
                                    Monitor registered platform users
                                </small>

                            </div>

                        </Link>


                        {/* System Monitoring */}

                            <Link
                                to="/admin/system-monitoring"
                                className="admin-overview-card green"
                            >

                                <div className="overview-icon">
                                    <FaBoxes />
                                </div>

                                <div>

                                    <span>
                                        System Monitoring
                                    </span>

                                    <strong>
                                        Monitor
                                    </strong>

                                    <small>
                                        Monitor platform health and system activity
                                    </small>

                                </div>

                            </Link>

                        {/* Platform Analytics */}

                        <Link
                            to="/admin/analytics"
                            className="admin-overview-card orange"
                        >

                            <div className="overview-icon">
                                <FaChartLine />
                            </div>

                            <div>

                                <span>
                                    Platform Analytics
                                </span>

                                <strong>
                                    Analyze
                                </strong>

                                <small>
                                    Monitor platform activity and insights
                                </small>

                            </div>

                        </Link>


                       {/* Report Management */}

                            <Link
                                to="/admin/reports"
                                className="admin-overview-card purple"
                            >

                                <div className="overview-icon">
                                    <FaFileAlt />
                                </div>

                                <div>

                                    <span>
                                        Report Management
                                    </span>

                                    <strong>
                                        Reports
                                    </strong>

                                    <small>
                                        Review platform and sustainability reports
                                    </small>

                                </div>

                            </Link>

                    </div>

                </section>


                {/* =========================================
                    WORKSPACE MANAGEMENT
                ========================================= */}

                <section className="admin-section">

                    <div className="admin-section-heading">

                        <div>

                            <span>
                                WORKSPACE MANAGEMENT
                            </span>

                            <h2>
                                Operational Workspaces
                            </h2>

                        </div>

                        <p>
                            Admins can access every operational workspace
                            from one central control center.
                        </p>

                    </div>


                    <div className="workspace-grid">


                        {/* =================================
                            RECYCLING FACILITY
                        ================================= */}

                        <div className="workspace-card recycling">

                            <div className="workspace-card-top">

                                <div className="workspace-icon">
                                    <FaRecycle />
                                </div>

                                <span className="workspace-badge">
                                    OPERATIONS
                                </span>

                            </div>


                            <h3>
                                Recycling Facility
                            </h3>

                            <p>
                                Manage textile waste, recycling
                                opportunities, processing analytics
                                and material recovery.
                            </p>


                            <div className="workspace-features">

                                <span>
                                    Waste Inventory
                                </span>

                                <span>
                                    Processing Analytics
                                </span>

                                <span>
                                    Recovery Statistics
                                </span>

                            </div>


                            <Link
                                to="/dashboard/recycling"
                                className="workspace-button recycling-button"
                            >
                                Open Workspace
                                <FaArrowRight />
                            </Link>

                        </div>


                        {/* =================================
                            SUSTAINABILITY MANAGER
                        ================================= */}

                        <div className="workspace-card sustainability">

                            <div className="workspace-card-top">

                                <div className="workspace-icon">
                                    <FaLeaf />
                                </div>

                                <span className="workspace-badge">
                                    ESG
                                </span>

                            </div>


                            <h3>
                                Sustainability Manager
                            </h3>

                            <p>
                                Monitor sustainability metrics,
                                carbon reduction, waste diversion
                                and ESG performance.
                            </p>


                            <div className="workspace-features">

                                <span>
                                    Sustainability Metrics
                                </span>

                                <span>
                                    Carbon Reduction
                                </span>

                                <span>
                                    ESG Reporting
                                </span>

                            </div>


                            <Link
                                to="/dashboard/sustainability"
                                className="workspace-button sustainability-button"
                            >
                                Open Workspace
                                <FaArrowRight />
                            </Link>

                        </div>


                        {/* =================================
                            MANUFACTURER
                        ================================= */}

                        <div className="workspace-card manufacturer">

                            <div className="workspace-card-top">

                                <div className="workspace-icon">
                                    <FaIndustry />
                                </div>

                                <span className="workspace-badge">
                                    PRODUCTION
                                </span>

                            </div>


                            <h3>
                                Manufacturer
                            </h3>

                            <p>
                                Analyze production waste, material
                                recovery, circular economy insights
                                and sustainability performance.
                            </p>


                            <div className="workspace-features">

                                <span>
                                    Production Waste
                                </span>

                                <span>
                                    Material Recovery
                                </span>

                                <span>
                                    Circular Economy
                                </span>

                            </div>


                            <Link
                                to="/dashboard/manufacturer"
                                className="workspace-button manufacturer-button"
                            >
                                Open Workspace
                                <FaArrowRight />
                            </Link>

                        </div>


                    </div>

                </section>

                                {/* =========================================
                    PLATFORM ANNOUNCEMENTS
                ========================================= */}

                <section className="announcement-section">

                    <div className="announcement-header">

                        <div className="announcement-title-area">

                            <div className="announcement-icon">
                                <FaBullhorn />
                            </div>

                            <div>

                                <span>
                                    ADMIN COMMUNICATION
                                </span>

                                <h2>
                                    Platform Announcements
                                </h2>

                                <p>
                                    Send important announcements to all
                                    active platform users.
                                </p>

                            </div>

                        </div>

                    </div>


                    <form
                        className="announcement-form"
                        onSubmit={handleCreateAnnouncement}
                    >

                        {/* Announcement Title */}

                        <div className="form-group">

                            <label>
                                Announcement Title
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. Scheduled Platform Maintenance"
                                value={announcementTitle}
                                onChange={(e) =>
                                    setAnnouncementTitle(e.target.value)
                                }
                                maxLength={150}
                            />

                        </div>


                        {/* Announcement Message */}

                        <div className="form-group">

                            <label>
                                Message
                            </label>

                            <textarea
                                placeholder="Enter the announcement message..."
                                value={announcementMessage}
                                onChange={(e) =>
                                    setAnnouncementMessage(e.target.value)
                                }
                                rows={5}
                                maxLength={500}
                            />

                        </div>


                        {/* Priority */}

                        <div className="form-group">

                            <label>
                                Priority
                            </label>

                            <select
                                value={announcementPriority}
                                onChange={(e) =>
                                    setAnnouncementPriority(e.target.value)
                                }
                            >

                                <option value="low">
                                    Low
                                </option>

                                <option value="medium">
                                    Medium
                                </option>

                                <option value="high">
                                    High
                                </option>

                            </select>

                        </div>


                        {/* Error */}

                        {announcementError && (

                            <div className="announcement-error">
                                {announcementError}
                            </div>

                        )}


                        {/* Success */}

                        {announcementSuccess && (

                            <div className="announcement-success">
                                {announcementSuccess}
                            </div>

                        )}


                        {/* Send Button */}

                        <button
                            type="submit"
                            className="announcement-submit"
                            disabled={announcementLoading}
                        >

                            <FaBullhorn />

                            {announcementLoading
                                ? "Sending..."
                                : "Send Announcement"
                            }

                        </button>

                    </form>

                </section>

                {/* =========================================
                    ADMIN NOTICE
                ========================================= */}

                <section className="admin-notice">

                    <div className="notice-icon">
                        <FaShieldAlt />
                    </div>

                    <div>

                        <h3>
                            Administrator Access
                        </h3>

                        <p>
                            You are viewing the platform's central
                            administration workspace. Administrators
                            have access to all operational dashboards
                            and platform management capabilities.
                        </p>

                    </div>

                </section>

            </main>

            <Footer />

        </>
    );
}


export default AdminDashboard;