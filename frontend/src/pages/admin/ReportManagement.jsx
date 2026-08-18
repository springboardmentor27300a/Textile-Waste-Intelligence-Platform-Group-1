import { useEffect, useState } from "react";
import {
    FaFileAlt,
    FaUsers,
    FaBoxes,
    FaRecycle,
    FaLeaf
} from "react-icons/fa";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import { getAdminReportData } from "../../services/dashboardService";
import {
    downloadPDFReport,
    downloadExcelReport
} from "../../utils/reportExport";

import "./ReportManagement.css";


function ReportManagement() {

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedReport, setSelectedReport] = useState(null);


    useEffect(() => {

        const loadReportData = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await getAdminReportData();

                setReportData(response.data);

            } catch (err) {

                console.error(
                    "Report management error:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Unable to load report data."
                );

            } finally {

                setLoading(false);

            }

        };

        loadReportData();

    }, []);


    if (loading) {

        return (
            <>
                <Navbar />

                <main className="report-management-page">

                    <div className="report-loading">
                        Loading reports...
                    </div>

                </main>

                <Footer />
            </>
        );

    }


    if (error) {

        return (
            <>
                <Navbar />

                <main className="report-management-page">

                    <div className="report-error">
                        {error}
                    </div>

                </main>

                <Footer />
            </>
        );

    }


    if (!reportData) {
        return null;
    }


    const {
        users,
        inventory,
        analysis,
        sustainability
    } = reportData;


    return (
        <>
            <Navbar />

            <main className="report-management-page">

                {/* ============================
                    HEADER
                ============================ */}

                <section className="report-header">

                    <div>

                        <span className="section-label">
                            REPORT MANAGEMENT
                        </span>

                        <h1>
                            Platform Reports
                        </h1>

                        <p>
                            Review platform activity, inventory,
                            analysis and sustainability performance.
                        </p>

                    </div>

                    <div className="report-header-icon">
                        <FaFileAlt />
                    </div>

                </section>


                {/* ============================
                    REPORT OVERVIEW
                ============================ */}

                <section className="report-section">

                    <div className="report-section-heading">

                        <div>

                            <span>
                                REPORT OVERVIEW
                            </span>

                            <h2>
                                Platform Summary
                            </h2>

                        </div>

                        <p>
                            Current platform information collected
                            from registered users and operational data.
                        </p>

                    </div>


                    <div className="report-grid">

                        {/* USERS */}

                        <div className="report-card blue">

                            <div className="report-icon">
                                <FaUsers />
                            </div>

                            <div>

                                <span>
                                    User Report
                                </span>

                                <strong>
                                    {users.total}
                                </strong>

                                <small>
                                    {users.active} active · {users.inactive} inactive
                                </small>

                            </div>

                        </div>


                        {/* INVENTORY */}

                        <div className="report-card green">

                            <div className="report-icon">
                                <FaBoxes />
                            </div>

                            <div>

                                <span>
                                    Inventory Report
                                </span>

                                <strong>
                                    {inventory.total_quantity} kg
                                </strong>

                                <small>
                                    {inventory.total_batches} inventory batches
                                </small>

                            </div>

                        </div>


                        {/* ANALYSIS */}

                        <div className="report-card orange">

                            <div className="report-icon">
                                <FaRecycle />
                            </div>

                            <div>

                                <span>
                                    Analysis Report
                                </span>

                                <strong>
                                    {analysis.total_analyses}
                                </strong>

                                <small>
                                    AI textile analyses completed
                                </small>

                            </div>

                        </div>


                        {/* SUSTAINABILITY */}

                        <div className="report-card purple">

                            <div className="report-icon">
                                <FaLeaf />
                            </div>

                            <div>

                                <span>
                                    Sustainability Report
                                </span>

                                <strong>
                                    {sustainability.average_score}
                                </strong>

                                <small>
                                    Average sustainability score
                                </small>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ============================
                    DETAILED REPORTS
                ============================ */}

                <section className="report-section">

                    <div className="report-panel">

                        <span className="section-label">
                            AVAILABLE REPORTS
                        </span>

                        <h2>
                            Operational Reports
                        </h2>

                        <p>
                            Review key platform information using the latest available
                            system data.
                        </p>

                        <div className="report-list">

                            {/* =========================
                                USER REPORT
                            ========================= */}

                            <div className="report-item">

                                <div className="report-item-icon blue">
                                    <FaUsers />
                                </div>

                                <div className="report-item-content">

                                    <h3>
                                        User Activity Report
                                    </h3>

                                    <p>
                                        {users.total} registered users,
                                        including {users.active} active and{" "}
                                        {users.inactive} inactive accounts.
                                    </p>

                                </div>

                                <button
                                    className="report-view-button blue-button"
                                    onClick={() =>
                                        setSelectedReport("users")
                                    }
                                >
                                    View Report
                                </button>

                            </div>


                            {/* =========================
                                INVENTORY REPORT
                            ========================= */}

                            <div className="report-item">

                                <div className="report-item-icon green">
                                    <FaBoxes />
                                </div>

                                <div className="report-item-content">

                                    <h3>
                                        Waste Inventory Report
                                    </h3>

                                    <p>
                                        {inventory.total_batches} batches containing{" "}
                                        {inventory.total_quantity} kg of tracked
                                        textile waste.
                                    </p>

                                </div>

                                <button
                                    className="report-view-button green-button"
                                    onClick={() =>
                                        setSelectedReport("inventory")
                                    }
                                >
                                    View Report
                                </button>

                            </div>


                            {/* =========================
                                ANALYSIS REPORT
                            ========================= */}

                            <div className="report-item">

                                <div className="report-item-icon orange">
                                    <FaRecycle />
                                </div>

                                <div className="report-item-content">

                                    <h3>
                                        Textile Analysis Report
                                    </h3>

                                    <p>
                                        {analysis.total_analyses} AI-powered textile
                                        analyses completed on the platform.
                                    </p>

                                </div>

                                <button
                                    className="report-view-button orange-button"
                                    onClick={() =>
                                        setSelectedReport("analysis")
                                    }
                                >
                                    View Report
                                </button>

                            </div>


                            {/* =========================
                                SUSTAINABILITY REPORT
                            ========================= */}

                            <div className="report-item">

                                <div className="report-item-icon purple">
                                    <FaLeaf />
                                </div>

                                <div className="report-item-content">

                                    <h3>
                                        Sustainability Report
                                    </h3>

                                    <p>
                                        Sustainability score of{" "}
                                        {sustainability.average_score},
                                        with {sustainability.co2_saved} kg CO₂ saved
                                        and {sustainability.water_saved} L water saved.
                                    </p>

                                </div>

                                <button
                                    className="report-view-button purple-button"
                                    onClick={() =>
                                        setSelectedReport("sustainability")
                                    }
                                >
                                    View Report
                                </button>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ============================
                    ENVIRONMENTAL SUMMARY
                ============================ */}

                <section className="environmental-summary">

                    <div>

                        <span>
                            ENVIRONMENTAL IMPACT
                        </span>

                        <h2>
                            Sustainability Performance
                        </h2>

                        <p>
                            Environmental impact calculated from
                            platform sustainability records.
                        </p>

                    </div>


                    <div className="environmental-metrics">

                        <div>
                            <strong>
                                {sustainability.co2_saved} kg
                            </strong>

                            <span>
                                CO₂ Saved
                            </span>
                        </div>


                        <div>
                            <strong>
                                {sustainability.water_saved} L
                            </strong>

                            <span>
                                Water Saved
                            </span>
                        </div>


                        <div>
                            <strong>
                                {sustainability.landfill_saved} kg
                            </strong>

                            <span>
                                Landfill Saved
                            </span>
                        </div>


                        <div>
                            <strong>
                                {sustainability.average_score}
                            </strong>

                            <span>
                                Sustainability Score
                            </span>
                        </div>

                    </div>

                </section>
                {/* ============================
                    PLATFORM EXPORT
                ============================ */}

                <section className="report-export-section">

                    <div className="report-export-content">

                        <div>

                            <span className="section-label">
                                REPORT EXPORT
                            </span>

                            <h2>
                                Download Platform Reports
                            </h2>

                            <p>
                                Export the latest platform performance,
                                inventory, analysis and sustainability data.
                            </p>

                        </div>


                        <div className="report-export-actions">

                            <button
                                className="report-export-button pdf-button"
                                onClick={() =>
                                    downloadPDFReport(reportData)
                                }
                            >
                                📄 Download PDF
                            </button>


                            <button
                                className="report-export-button excel-button"
                                onClick={() =>
                                    downloadExcelReport(reportData)
                                }
                            >
                                📊 Download Excel
                            </button>

                        </div>

                    </div>

                </section>

                

            </main>
            {/* ============================
    REPORT DETAIL MODAL
============================ */}

{selectedReport && (

    <div
        className="report-modal-overlay"
        onClick={() => setSelectedReport(null)}
    >

        <div
            className="report-modal"
            onClick={(e) => e.stopPropagation()}
        >

            {/* USER REPORT */}

            {selectedReport === "users" && (
                <>
                    <div className="modal-icon blue">
                        <FaUsers />
                    </div>

                    <span className="section-label">
                        USER ACTIVITY REPORT
                    </span>

                    <h2>
                        Platform Users
                    </h2>

                    <p className="modal-description">
                        Current user registration and account activity
                        across the platform.
                    </p>

                    <div className="modal-metrics">

                        <div>
                            <strong>{users.total}</strong>
                            <span>Total Users</span>
                        </div>

                        <div>
                            <strong>{users.active}</strong>
                            <span>Active Users</span>
                        </div>

                        <div>
                            <strong>{users.inactive}</strong>
                            <span>Inactive Users</span>
                        </div>

                    </div>
                </>
            )}


            {/* INVENTORY REPORT */}

            {selectedReport === "inventory" && (
                <>
                    <div className="modal-icon green">
                        <FaBoxes />
                    </div>

                    <span className="section-label">
                        WASTE INVENTORY REPORT
                    </span>

                    <h2>
                        Textile Waste Inventory
                    </h2>

                    <p className="modal-description">
                        Current textile waste inventory tracked by
                        the platform.
                    </p>

                    <div className="modal-metrics">

                        <div>
                            <strong>
                                {inventory.total_batches}
                            </strong>
                            <span>Total Batches</span>
                        </div>

                        <div>
                            <strong>
                                {inventory.total_quantity} kg
                            </strong>
                            <span>Total Waste</span>
                        </div>

                    </div>
                </>
            )}


            {/* ANALYSIS REPORT */}

            {selectedReport === "analysis" && (
                <>
                    <div className="modal-icon orange">
                        <FaRecycle />
                    </div>

                    <span className="section-label">
                        TEXTILE ANALYSIS REPORT
                    </span>

                    <h2>
                        AI Textile Analysis
                    </h2>

                    <p className="modal-description">
                        Summary of AI-powered textile analysis activity
                        performed on the platform.
                    </p>

                    <div className="modal-metrics">

                        <div>
                            <strong>
                                {analysis.total_analyses}
                            </strong>

                            <span>
                                Total Analyses
                            </span>
                        </div>

                    </div>
                </>
            )}


            {/* SUSTAINABILITY REPORT */}

            {selectedReport === "sustainability" && (
                <>
                    <div className="modal-icon purple">
                        <FaLeaf />
                    </div>

                    <span className="section-label">
                        SUSTAINABILITY REPORT
                    </span>

                    <h2>
                        Environmental Performance
                    </h2>

                    <p className="modal-description">
                        Sustainability and environmental impact
                        generated from platform records.
                    </p>

                    <div className="modal-metrics">

                        <div>
                            <strong>
                                {sustainability.average_score}
                            </strong>

                            <span>
                                Sustainability Score
                            </span>
                        </div>

                        <div>
                            <strong>
                                {sustainability.co2_saved} kg
                            </strong>

                            <span>
                                CO₂ Saved
                            </span>
                        </div>

                        <div>
                            <strong>
                                {sustainability.water_saved} L
                            </strong>

                            <span>
                                Water Saved
                            </span>
                        </div>

                        <div>
                            <strong>
                                {sustainability.landfill_saved} kg
                            </strong>

                            <span>
                                Landfill Saved
                            </span>
                        </div>

                    </div>
                </>
            )}


            <button
                className="modal-close-button"
                onClick={() => setSelectedReport(null)}
            >
                Close Report
            </button>

        </div>

    </div>

)}

            <Footer />
        </>
    );
}


export default ReportManagement;