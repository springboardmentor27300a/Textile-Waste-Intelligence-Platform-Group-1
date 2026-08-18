import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
    getDashboardStats,
    getSustainabilitySummary,
    getRecommendationDistribution,
    getInventorySustainabilitySummary
} from "../../services/dashboardService";

// FIXED PATH
import NotificationBell from "../../components/NotificationBell";

import {
    FaLeaf,
    FaCloud,
    FaTint,
    FaRecycle,
    FaChartLine,
    FaIndustry,
    FaGlobe,
    FaClipboardCheck
} from "react-icons/fa";

import "./SustainabilityManagerDashboard.css";


function SustainabilityManagerDashboard() {

    const [sustainability, setSustainability] = useState({
        total_co2_saved: 0,
        total_water_saved: 0,
        total_landfill_saved: 0,
        average_sustainability_score: 0,
        average_circularity_score: 0,
        average_resource_recovery: 0
    });


    const [stats, setStats] = useState({
        total_quantity: 0
    });


    const [inventorySustainability, setInventorySustainability] =
        useState({
            total_analyzed_batches: 0,
            lca_coverage: 0,
            lca_coverage_total: 0,
            total_quantity: 0,
            total_carbon_footprint: 0,
            total_co2_saved: 0,
            total_water_impact: 0,
            total_water_saved: 0,
            total_landfill_diversion: 0,
            average_sustainability_score: 0,
            average_circularity_score: 0,
            average_resource_recovery: 0,
            recycling_opportunities: 0
        });


    const [recommendations, setRecommendations] =
        useState({});


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    // ==========================================
    // Load Dashboard Data
    // ==========================================

    useEffect(() => {

        const loadSustainabilityDashboard = async () => {

            try {

                setLoading(true);


                const statsResponse =
                    await getDashboardStats();


                const sustainabilityResponse =
                    await getSustainabilitySummary();


                const recommendationResponse =
                    await getRecommendationDistribution();


                const inventoryResponse =
                    await getInventorySustainabilitySummary();


                setStats({
                    total_quantity:
                        statsResponse.data?.total_quantity || 0
                });


                setRecommendations(
                    recommendationResponse.data || {}
                );


                setInventorySustainability(
                    inventoryResponse.data || {}
                );


                setSustainability({
                    total_co2_saved:
                        sustainabilityResponse.data?.total_co2_saved || 0,

                    total_water_saved:
                        sustainabilityResponse.data?.total_water_saved || 0,

                    total_landfill_diversion:
                        sustainabilityResponse.data?.total_landfill_diversion || 0,

                    average_sustainability_score:
                        sustainabilityResponse.data?.average_sustainability_score || 0,

                    average_circularity_score:
                        sustainabilityResponse.data?.average_circularity_score || 0,

                    average_resource_recovery:
                        sustainabilityResponse.data?.average_resource_recovery || 0
                });

                setError("");


            } catch (err) {

                console.error(
                    "Sustainability dashboard error:",
                    err
                );


                setError(
                    "Unable to load sustainability analytics."
                );


            } finally {

                setLoading(false);

            }

        };


        loadSustainabilityDashboard();

    }, []);


    const recyclingOpportunities =
        recommendations?.Recycle || 0;


    return (
        <>

            <Navbar />


            <main className="sustainability-dashboard">

                {/* ==========================================
                    NOTIFICATIONS
                ========================================== */}

                {/* <NotificationBell /> */}


                {/* ==========================================
                    HERO
                ========================================== */}

                <section className="sustainability-hero">

                    <div className="hero-content">

                        <span className="hero-label">
                            SUSTAINABILITY MANAGEMENT
                        </span>


                        <h1>
                            Sustainability Intelligence
                        </h1>


                        <p>
                            Monitor environmental impact, carbon reduction,
                            waste diversion and ESG performance across the
                            textile waste platform.
                        </p>

                    </div>


                    <div className="hero-icon">
                        <FaLeaf />
                    </div>

                </section>


                {/* ==========================================
                    SUSTAINABILITY METRICS
                ========================================== */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>

                            <span className="section-label">
                                SUSTAINABILITY METRICS
                            </span>


                            <h2>
                                Environmental Performance
                            </h2>


                            <p>
                                Track the environmental benefits generated
                                through textile waste recovery.
                            </p>

                        </div>


                        <FaChartLine className="section-icon" />

                    </div>


                    <div className="metric-grid">

                        <div className="metric-card green">

                            <div className="metric-icon">
                                <FaLeaf />
                            </div>


                            <span>
                                Sustainability Score
                            </span>


                            <strong>
                                {sustainability.average_sustainability_score}
                            </strong>


                            <small>
                                Overall platform performance
                            </small>

                        </div>


                        <div className="metric-card blue">

                            <div className="metric-icon">
                                <FaCloud />
                            </div>


                            <span>
                                CO₂ Saved
                            </span>


                            <strong>
                                {sustainability.total_co2_saved} kg
                            </strong>


                            <small>
                                Carbon emissions reduced
                            </small>

                        </div>


                        <div className="metric-card cyan">

                            <div className="metric-icon">
                                <FaTint />
                            </div>


                            <span>
                                Water Saved
                            </span>


                            <strong>
                                {sustainability.total_water_saved.toLocaleString()} L
                            </strong>


                            <small>
                                Water conservation impact
                            </small>

                        </div>


                        <div className="metric-card orange">

                            <div className="metric-icon">
                                <FaRecycle />
                            </div>


                            <span>
                                Landfill Diversion
                            </span>


                            <strong>
                                {sustainability.total_landfill_diversion} kg
                            </strong>


                            <small>
                                Waste diverted from landfill
                            </small>

                        </div>

                    </div>

                </section>


                {/* ==========================================
                    CARBON REDUCTION
                ========================================== */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>

                            <span className="section-label">
                                CARBON REDUCTION
                            </span>


                            <h2>
                                Carbon Reduction Report
                            </h2>


                            <p>
                                Understand the environmental impact of
                                textile recovery and reuse.
                            </p>

                        </div>


                        <FaCloud className="section-icon green-icon" />

                    </div>


                    <div className="carbon-card">

                        <div className="carbon-main">

                            <div className="carbon-circle">
                                <FaCloud />
                            </div>


                            <div>

                                <span>
                                    Total CO₂ Reduction
                                </span>


                                <h3>
                                    {sustainability.total_co2_saved} kg
                                </h3>


                                <p>
                                    Estimated carbon emissions avoided
                                    through sustainable textile processing.
                                </p>

                            </div>

                        </div>


                        <div className="carbon-progress">

                            <div className="progress-header">

                                <span>
                                    Carbon Reduction Performance
                                </span>


                                <strong>
                                    {sustainability.average_sustainability_score}%
                                </strong>

                            </div>


                            <div className="progress-bar">

                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${Math.min(
                                            Number(
                                                sustainability.average_sustainability_score
                                            ) || 0,
                                            100
                                        )}%`
                                    }}
                                ></div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==========================================
                    WASTE DIVERSION
                ========================================== */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>

                            <span className="section-label">
                                WASTE DIVERSION
                            </span>


                            <h2>
                                Waste Diversion Analytics
                            </h2>


                            <p>
                                Analyze how textile waste is being redirected
                                from disposal toward recovery.
                            </p>

                        </div>


                        <FaRecycle className="section-icon green-icon" />

                    </div>


                    <div className="diversion-grid">

                        <div className="diversion-card">

                            <div className="diversion-icon">
                                <FaRecycle />
                            </div>


                            <div>

                                <span>
                                    Recovered Waste
                                </span>


                                <strong>
                                    {stats.total_quantity} kg
                                </strong>


                                <small>
                                    Total textile quantity tracked
                                </small>

                            </div>

                        </div>


                        <div className="diversion-card">

                            <div className="diversion-icon blue-bg">
                                <FaIndustry />
                            </div>


                            <div>

                                <span>
                                    Recycling Opportunities
                                </span>


                                <strong>
                                    {recyclingOpportunities}
                                </strong>


                                <small>
                                    Identified recovery opportunities
                                </small>

                            </div>

                        </div>


                        <div className="diversion-card">

                            <div className="diversion-icon orange-bg">
                                <FaGlobe />
                            </div>


                            <div>

                                <span>
                                    Landfill Saved
                                </span>


                                <strong>
                                    {sustainability.total_landfill_diversion} kg
                                </strong>


                                <small>
                                    Waste diverted from landfill
                                </small>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==========================================
                    ESG REPORTING
                ========================================== */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>

                            <span className="section-label">
                                ESG REPORTING
                            </span>


                            <h2>
                                ESG Performance Overview
                            </h2>


                            <p>
                                Environmental, social and governance
                                indicators for sustainability reporting.
                            </p>

                        </div>


                        <FaClipboardCheck className="section-icon purple-icon" />

                    </div>


                    <div className="esg-grid">

                        <div className="esg-card">

                            <div className="esg-title">

                                <FaLeaf />

                                <h3>
                                    Environmental
                                </h3>

                            </div>


                            <div className="esg-value">

                                {sustainability.average_sustainability_score}

                                <span>
                                    /100
                                </span>

                            </div>


                            <p>
                                Strong environmental performance based on
                                waste recovery and resource conservation.
                            </p>

                        </div>


                        <div className="esg-card">

                            <div className="esg-title">

                                <FaGlobe />

                                <h3>
                                    Social
                                </h3>

                            </div>


                            <div className="esg-value">
                                Active
                            </div>


                            <p>
                                Supports responsible textile waste handling
                                and sustainable operational practices.
                            </p>

                        </div>


                        <div className="esg-card">

                            <div className="esg-title">

                                <FaClipboardCheck />

                                <h3>
                                    Governance
                                </h3>

                            </div>


                            <div className="esg-value">
                                Monitored
                            </div>


                            <p>
                                Centralized monitoring of sustainability
                                activities and platform performance.
                            </p>

                        </div>

                    </div>

                </section>


                {/* ==========================================
                    INVENTORY SUSTAINABILITY ANALYTICS
                ========================================== */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>

                            <span className="section-label">
                                INVENTORY SUSTAINABILITY
                            </span>


                            <h2>
                                Inventory Sustainability Analytics
                            </h2>


                            <p>
                                Sustainability and environmental insights
                                calculated from analyzed textile inventory batches.
                            </p>

                        </div>


                        <FaRecycle className="section-icon green-icon" />

                    </div>


                    <div className="metric-grid">

                        {/* Analyzed Batches */}

                        <div className="metric-card green">

                            <div className="metric-icon">
                                <FaClipboardCheck />
                            </div>


                            <span>
                                Analyzed Batches
                            </span>


                            <strong>
                                {inventorySustainability.total_analyzed_batches}
                            </strong>


                            <small>
                                Inventory batches assessed
                            </small>

                        </div>


                        {/* Carbon Footprint */}

                        <div className="metric-card blue">

                            <div className="metric-icon">
                                <FaCloud />
                            </div>


                            <span>
                                Carbon Footprint
                            </span>


                            <strong>
                                {Number(
                                    inventorySustainability.total_carbon_footprint || 0
                                ).toLocaleString()} kg
                            </strong>


                            <small>
                                Estimated kg CO₂e
                            </small>

                        </div>


                        {/* LCA Coverage */}

                        <div className="metric-card green">

                            <div className="metric-icon">
                                <FaClipboardCheck />
                            </div>


                            <span>
                                LCA Coverage
                            </span>


                            <strong>

                                {inventorySustainability.lca_coverage || 0}

                                /

                                {inventorySustainability.lca_coverage_total || 0}

                            </strong>


                            <small>
                                Inventory batches with configured LCA factors
                            </small>

                        </div>


                        {/* CO2 Saved */}

                        <div className="metric-card cyan">

                            <div className="metric-icon">
                                <FaCloud />
                            </div>


                            <span>
                                CO₂ Saved
                            </span>


                            <strong>
                                {Number(
                                    inventorySustainability.total_co2_saved || 0
                                ).toLocaleString()} kg
                            </strong>


                            <small>
                                Estimated emissions avoided
                            </small>

                        </div>


                        {/* Landfill Diversion */}

                        <div className="metric-card orange">

                            <div className="metric-icon">
                                <FaRecycle />
                            </div>


                            <span>
                                Landfill Diversion
                            </span>


                            <strong>
                                {Number(
                                    inventorySustainability.total_landfill_diversion || 0
                                ).toLocaleString()} kg
                            </strong>


                            <small>
                                Waste diverted from landfill
                            </small>

                        </div>

                    </div>


                    {/* Environmental Metrics */}

                    <div className="diversion-grid">

                        <div className="diversion-card">

                            <div className="diversion-icon">
                                <FaTint />
                            </div>


                            <div>

                                <span>
                                    Water Impact
                                </span>


                                <strong>
                                    {Number(
                                        inventorySustainability.total_water_impact || 0
                                    ).toLocaleString()} L
                                </strong>


                                <small>
                                    Estimated production water impact
                                </small>

                            </div>

                        </div>


                        <div className="diversion-card">

                            <div className="diversion-icon blue-bg">
                                <FaTint />
                            </div>


                            <div>

                                <span>
                                    Water Saved
                                </span>


                                <strong>
                                    {Number(
                                        inventorySustainability.total_water_saved || 0
                                    ).toLocaleString()} L
                                </strong>


                                <small>
                                    Estimated water conservation
                                </small>

                            </div>

                        </div>


                        <div className="diversion-card">

                            <div className="diversion-icon orange-bg">
                                <FaIndustry />
                            </div>


                            <div>

                                <span>
                                    Recycling Opportunities
                                </span>


                                <strong>
                                    {inventorySustainability.recycling_opportunities}
                                </strong>


                                <small>
                                    Inventory batches recommended for recycling
                                </small>

                            </div>

                        </div>

                    </div>


                    {/* Circular Economy */}

                    <div className="esg-grid">

                        <div className="esg-card">

                            <div className="esg-title">

                                <FaLeaf />

                                <h3>
                                    Sustainability
                                </h3>

                            </div>


                            <div className="esg-value">

                                {inventorySustainability.average_sustainability_score}

                                <span>
                                    /100
                                </span>

                            </div>


                            <p>
                                Average sustainability score across analyzed
                                inventory batches.
                            </p>

                        </div>


                        <div className="esg-card">

                            <div className="esg-title">

                                <FaRecycle />

                                <h3>
                                    Circularity
                                </h3>

                            </div>


                            <div className="esg-value">

                                {inventorySustainability.average_circularity_score}

                                <span>
                                    /100
                                </span>

                            </div>


                            <p>
                                Average circular economy performance.
                            </p>

                        </div>


                        <div className="esg-card">

                            <div className="esg-title">

                                <FaIndustry />

                                <h3>
                                    Resource Recovery
                                </h3>

                            </div>


                            <div className="esg-value">

                                {inventorySustainability.average_resource_recovery}

                                <span>
                                    %
                                </span>

                            </div>


                            <p>
                                Average material recovery potential.
                            </p>

                        </div>

                    </div>

                </section>


                {/* ==========================================
                    KEY INSIGHTS
                ========================================== */}

                <section className="insight-card">

                    <div className="insight-icon">
                        <FaChartLine />
                    </div>


                    <div>

                        <span>
                            SUSTAINABILITY INSIGHT
                        </span>


                        <h3>
                            Textile recovery is generating measurable
                            environmental benefits
                        </h3>


                        <p>
                            Current platform data indicates positive
                            sustainability performance through carbon
                            reduction, water conservation and landfill
                            diversion.
                        </p>

                    </div>

                </section>

            </main>


            <Footer />

        </>
    );
}


export default SustainabilityManagerDashboard;