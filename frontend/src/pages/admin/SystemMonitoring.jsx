import { useEffect, useState } from "react";
import {
    FaServer,
    FaDatabase,
    FaUsers,
    FaBoxes,
    FaChartLine,
    FaLeaf,
    FaCheckCircle,
    FaExclamationTriangle
} from "react-icons/fa";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import { getSystemMonitoring } from "../../services/dashboardService";

import "./SystemMonitoring.css";


function SystemMonitoring() {

    const [monitoring, setMonitoring] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ==========================================
    // Load System Monitoring Data
    // ==========================================

    useEffect(() => {

        const loadMonitoringData = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await getSystemMonitoring();

                setMonitoring(response.data);

            } catch (err) {

                console.error(
                    "System monitoring error:",
                    err
                );

                setMonitoring({
                    system: {
                        platform_status: "Warning",
                        backend_status: "Online",
                        database_status: "Disconnected"
                    },

                    users: {
                        total: 0,
                        active: 0,
                        inactive: 0
                    },

                    inventory: {
                        total_batches: 0,
                        total_quantity: 0
                    },

                    analysis: {
                        total_analyses: 0
                    },

                    sustainability: {
                        average_score: 0,
                        co2_saved: 0,
                        water_saved: 0,
                        landfill_saved: 0
                    }
                });

                setError("");

            } finally {
                setLoading(false);

            }

        };


        loadMonitoringData();

    }, []);


    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (
            <>
                <Navbar />

                <main className="system-monitoring-page">

                    <div className="monitoring-loading">
                        Loading system monitoring...
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

                <main className="system-monitoring-page">

                    <div className="monitoring-error">

                        <FaExclamationTriangle />

                        <h2>
                            Unable to Load System Monitoring
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
    // System Data
    // ==========================================

    const system = monitoring?.system || {};
    const users = monitoring?.users || {};
    const inventory = monitoring?.inventory || {};
    const analysis = monitoring?.analysis || {};
    const sustainability =
        monitoring?.sustainability || {};


    const isHealthy =
        system.platform_status === "Healthy";


    return (
        <>
            <Navbar />


            <main className="system-monitoring-page">

                {/* =====================================
                    HEADER
                ===================================== */}

                <section className="system-monitoring-header">

                    <div>

                        <span className="section-label">
                            SYSTEM MONITORING
                        </span>

                        <h1>
                            System Monitoring
                        </h1>

                        <p>
                            Monitor platform health, user activity,
                            inventory operations and system performance.
                        </p>

                    </div>


                    <div className="monitoring-header-icon">
                        <FaServer />
                    </div>

                </section>


                {/* =====================================
                    PLATFORM HEALTH
                ===================================== */}

                <section className="monitoring-section">

                    <div className="monitoring-section-heading">

                        <div>

                            <span>
                                PLATFORM HEALTH
                            </span>

                            <h2>
                                System Status
                            </h2>

                        </div>

                    </div>


                    <div className="health-grid">

                        {/* Platform */}

                        <div className="health-card">

                            <div className="health-icon">
                                {isHealthy
                                    ? <FaCheckCircle />
                                    : <FaExclamationTriangle />
                                }
                            </div>

                            <div>

                                <span>
                                    Platform
                                </span>

                                <strong
                                    className={
                                        isHealthy
                                            ? "status-online"
                                            : "status-warning"
                                    }
                                >
                                    {system.platform_status}
                                </strong>

                            </div>

                        </div>


                        {/* Backend */}

                        <div className="health-card">

                            <div className="health-icon">
                                <FaServer />
                            </div>

                            <div>

                                <span>
                                    Backend API
                                </span>

                                <strong className="status-online">
                                    {system.backend_status}
                                </strong>

                            </div>

                        </div>


                        {/* Database */}

                        <div className="health-card">

                            <div className="health-icon">
                                <FaDatabase />
                            </div>

                            <div>

                                <span>
                                    Database
                                </span>

                                <strong
                                    className={
                                        system.database_status === "Connected"
                                            ? "status-online"
                                            : "status-offline"
                                    }
                                >
                                    {system.database_status}
                                </strong>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================
                    USER MONITORING
                ===================================== */}

                <section className="monitoring-section">

                    <span className="section-label">
                        USER MONITORING
                    </span>

                    <h2>
                        Platform Users
                    </h2>

                    <p className="section-description">
                        Current user registration and account activity.
                    </p>


                    <div className="monitoring-card-grid">

                        <div className="monitoring-card blue">

                            <div className="monitoring-card-icon">
                                <FaUsers />
                            </div>

                            <span>
                                Total Users
                            </span>

                            <strong>
                                {users.total}
                            </strong>

                            <small>
                                Registered platform users
                            </small>

                        </div>


                        <div className="monitoring-card green">

                            <div className="monitoring-card-icon">
                                <FaCheckCircle />
                            </div>

                            <span>
                                Active Users
                            </span>

                            <strong>
                                {users.active}
                            </strong>

                            <small>
                                Currently active accounts
                            </small>

                        </div>


                        <div className="monitoring-card red">

                            <div className="monitoring-card-icon">
                                <FaExclamationTriangle />
                            </div>

                            <span>
                                Inactive Users
                            </span>

                            <strong>
                                {users.inactive}
                            </strong>

                            <small>
                                Deactivated accounts
                            </small>

                        </div>

                    </div>

                </section>


                {/* =====================================
                    OPERATIONS
                ===================================== */}

                <section className="monitoring-section">

                    <span className="section-label">
                        PLATFORM OPERATIONS
                    </span>

                    <h2>
                        Operational Activity
                    </h2>

                    <p className="section-description">
                        Current activity across inventory and AI analysis.
                    </p>


                    <div className="monitoring-card-grid">

                        <div className="monitoring-card orange">

                            <div className="monitoring-card-icon">
                                <FaBoxes />
                            </div>

                            <span>
                                Inventory Batches
                            </span>

                            <strong>
                                {inventory.total_batches}
                            </strong>

                            <small>
                                Waste batches tracked
                            </small>

                        </div>


                        <div className="monitoring-card green">

                            <div className="monitoring-card-icon">
                                <FaBoxes />
                            </div>

                            <span>
                                Waste Quantity
                            </span>

                            <strong>
                                {inventory.total_quantity} kg
                            </strong>

                            <small>
                                Total textile waste tracked
                            </small>

                        </div>


                        <div className="monitoring-card blue">

                            <div className="monitoring-card-icon">
                                <FaChartLine />
                            </div>

                            <span>
                                AI Analyses
                            </span>

                            <strong>
                                {analysis.total_analyses}
                            </strong>

                            <small>
                                Textile analyses completed
                            </small>

                        </div>

                    </div>

                </section>


                {/* =====================================
                    SUSTAINABILITY
                ===================================== */}

                <section className="monitoring-section">

                    <span className="section-label">
                        SUSTAINABILITY MONITORING
                    </span>

                    <h2>
                        Environmental Performance
                    </h2>

                    <p className="section-description">
                        Environmental impact generated by platform activity.
                    </p>


                    <div className="monitoring-card-grid">

                        <div className="monitoring-card purple">

                            <div className="monitoring-card-icon">
                                <FaLeaf />
                            </div>

                            <span>
                                Sustainability Score
                            </span>

                            <strong>
                                {sustainability.average_score}
                            </strong>

                            <small>
                                Average platform score
                            </small>

                        </div>


                        <div className="monitoring-card blue">

                            <span>
                                CO₂ Saved
                            </span>

                            <strong>
                                {sustainability.co2_saved} kg
                            </strong>

                            <small>
                                Estimated carbon reduction
                            </small>

                        </div>


                        <div className="monitoring-card green">

                            <span>
                                Water Saved
                            </span>

                            <strong>
                                {sustainability.water_saved} L
                            </strong>

                            <small>
                                Estimated water conservation
                            </small>

                        </div>


                        <div className="monitoring-card orange">

                            <span>
                                Landfill Saved
                            </span>

                            <strong>
                                {sustainability.landfill_saved} kg
                            </strong>

                            <small>
                                Waste diverted from landfill
                            </small>

                        </div>

                    </div>

                </section>


                {/* =====================================
                    INSIGHT
                ===================================== */}

                <section className="monitoring-insight">

                    <div className="monitoring-insight-icon">
                        <FaServer />
                    </div>

                    <div>

                        <span>
                            SYSTEM INSIGHT
                        </span>

                        <h3>
                            Platform is operating normally
                        </h3>

                        <p>
                            The backend API and database are connected,
                            while platform activity is being monitored
                            across users, inventory, AI analysis and
                            sustainability operations.
                        </p>

                    </div>

                </section>

            </main>


            <Footer />

        </>
    );
}


export default SystemMonitoring;