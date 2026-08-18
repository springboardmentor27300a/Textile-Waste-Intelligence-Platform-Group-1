import { useEffect, useState } from "react";

import {
    FaChartLine,
    FaUsers,
    FaBoxes,
    FaRecycle,
    FaLeaf
} from "react-icons/fa";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import { getPlatformAnalytics } from "../../services/dashboardService";

import "./PlatformAnalytics.css";


function PlatformAnalytics() {

    // ==========================================
    // State
    // ==========================================

    const [analytics, setAnalytics] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================
    // Load Platform Analytics
    // ==========================================

    useEffect(() => {

        const loadAnalytics = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await getPlatformAnalytics();

                setAnalytics(response.data);

            } catch (err) {

                console.error(
                    "Failed to load platform analytics:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Unable to load platform analytics."
                );

            } finally {

                setLoading(false);

            }

        };

        loadAnalytics();

    }, []);


    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (
            <>
                <Navbar />

                <main className="platform-analytics-page">

                    <div className="analytics-loading">

                        <h2>
                            Loading Platform Analytics...
                        </h2>

                        <p>
                            Fetching the latest platform statistics.
                        </p>

                    </div>

                </main>

                <Footer />
            </>
        );

    }


    // ==========================================
    // Error
    // ==========================================

    if (error) {

        return (
            <>
                <Navbar />

                <main className="platform-analytics-page">

                    <div className="analytics-error">

                        <h2>
                            Unable to Load Analytics
                        </h2>

                        <p>
                            {error}
                        </p>

                    </div>

                </main>

                <Footer />
            </>
        );

    }


    // ==========================================
    // Safety Check
    // ==========================================

    if (!analytics) {
        return null;
    }


    // ==========================================
    // Extract Data
    // ==========================================

    const totalUsers =
        analytics.users?.total ?? 0;

    const activeUsers =
        analytics.users?.active ?? 0;

    const inactiveUsers =
        analytics.users?.inactive ?? 0;

    const totalBatches =
        analytics.inventory?.total_batches ?? 0;

    const totalQuantity =
        analytics.inventory?.total_quantity ?? 0;

    const totalAnalyses =
        analytics.analysis?.total_analyses ?? 0;

    const recyclableItems =
        analytics.analysis?.recyclable_items ?? 0;

    const reusableItems =
        analytics.analysis?.reusable_items ?? 0;

    const sustainabilityScore =
        analytics.sustainability?.average_score ?? 0;

    const co2Saved =
        analytics.sustainability?.co2_saved ?? 0;

    const waterSaved =
        analytics.sustainability?.water_saved ?? 0;

    const landfillSaved =
        analytics.sustainability?.landfill_saved ?? 0;


    return (
        <>
            <Navbar />

            <main className="platform-analytics-page">

                {/* ==============================
                    HEADER
                ============================== */}

                <section className="platform-analytics-header">

                    <div>

                        <span className="section-label">
                            PLATFORM ANALYTICS
                        </span>

                        <h1>
                            Platform Analytics
                        </h1>

                        <p>
                            Monitor platform activity, operational usage
                            and sustainability insights.
                        </p>

                    </div>

                    <div className="analytics-header-icon">
                        <FaChartLine />
                    </div>

                </section>


                {/* ==============================
                    PLATFORM OVERVIEW
                ============================== */}

                <section className="analytics-section">

                    <div className="analytics-section-heading">

                        <div>

                            <span>
                                PLATFORM OVERVIEW
                            </span>

                            <h2>
                                System Performance
                            </h2>

                        </div>

                        <p>
                            Overview of activity across the Textile Waste
                            Intelligence Platform.
                        </p>

                    </div>


                    <div className="analytics-card-grid">

                        {/* ==========================
                            Total Users
                        ========================== */}

                        <div className="analytics-card blue">

                            <div className="analytics-icon">
                                <FaUsers />
                            </div>

                            <span>
                                Total Users
                            </span>

                            <strong>
                                {totalUsers}
                            </strong>

                            <small>
                                {activeUsers} active · {inactiveUsers} inactive
                            </small>

                        </div>


                        {/* ==========================
                            Waste Inventory
                        ========================== */}

                        <div className="analytics-card green">

                            <div className="analytics-icon">
                                <FaBoxes />
                            </div>

                            <span>
                                Waste Inventory
                            </span>

                            <strong>
                                {totalQuantity} kg
                            </strong>

                            <small>
                                {totalBatches} inventory batches
                            </small>

                        </div>


                        {/* ==========================
                            Recovery Activity
                        ========================== */}

                        <div className="analytics-card orange">

                            <div className="analytics-icon">
                                <FaRecycle />
                            </div>

                            <span>
                                Recovery Activity
                            </span>

                            <strong>
                                {totalAnalyses}
                            </strong>

                            <small>
                                {recyclableItems} recyclable ·{" "}
                                {reusableItems} reusable
                            </small>

                        </div>


                        {/* ==========================
                            Sustainability
                        ========================== */}

                        <div className="analytics-card purple">

                            <div className="analytics-icon">
                                <FaLeaf />
                            </div>

                            <span>
                                Sustainability
                            </span>

                            <strong>
                                {sustainabilityScore}
                            </strong>

                            <small>
                                Average sustainability score
                            </small>

                        </div>

                    </div>

                </section>


                {/* ==============================
                    ACTIVITY
                ============================== */}

                <section className="analytics-section">

                    <div className="analytics-panel">

                        <span className="section-label">
                            PLATFORM ACTIVITY
                        </span>

                        <h2>
                            Operational Activity
                        </h2>

                        <p>
                            Current platform activity based on registered
                            users, textile inventory, AI analysis and
                            recovery operations.
                        </p>


                        <div className="activity-grid">

                            {/* Analysis */}

                            <div>

                                <strong>
                                    Analysis
                                </strong>

                                <span>
                                    {totalAnalyses} AI textile analyses
                                </span>

                            </div>


                            {/* Inventory */}

                            <div>

                                <strong>
                                    Inventory
                                </strong>

                                <span>
                                    {totalBatches} waste batches ·{" "}
                                    {totalQuantity} kg tracked
                                </span>

                            </div>


                            {/* Users */}

                            <div>

                                <strong>
                                    Users
                                </strong>

                                <span>
                                    {activeUsers} active platform users
                                </span>

                            </div>


                            {/* Recovery */}

                            <div>

                                <strong>
                                    Recovery
                                </strong>

                                <span>
                                    {recyclableItems} recyclable ·{" "}
                                    {reusableItems} reusable
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==============================
                    SUSTAINABILITY OVERVIEW
                ============================== */}

                <section className="analytics-section">

                    <div className="analytics-panel">

                        <span className="section-label">
                            SUSTAINABILITY OVERVIEW
                        </span>

                        <h2>
                            Environmental Impact
                        </h2>

                        <p>
                            Sustainability impact generated from textile
                            analysis records across the platform.
                        </p>


                        <div className="activity-grid">

                            <div>

                                <strong>
                                    CO₂ Saved
                                </strong>

                                <span>
                                    {co2Saved}
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Water Saved
                                </strong>

                                <span>
                                    {waterSaved}
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Landfill Saved
                                </strong>

                                <span>
                                    {landfillSaved}
                                </span>

                            </div>


                            <div>

                                <strong>
                                    Sustainability Score
                                </strong>

                                <span>
                                    {sustainabilityScore}
                                </span>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==============================
                    INSIGHT
                ============================== */}

                <section className="analytics-insight">

                    <div className="analytics-insight-icon">

                        <FaChartLine />

                    </div>

                    <div>

                        <span>
                            PLATFORM INSIGHT
                        </span>

                        <h3>
                            Centralized platform monitoring
                        </h3>

                        <p>
                            Administrators can use platform analytics to
                            understand system activity and operational
                            performance across all workspaces.
                        </p>

                    </div>

                </section>

            </main>

            <Footer />
        </>
    );
}


export default PlatformAnalytics;