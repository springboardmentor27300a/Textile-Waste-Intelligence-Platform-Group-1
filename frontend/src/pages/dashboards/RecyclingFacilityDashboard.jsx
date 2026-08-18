import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
    FaBoxes,
    FaRecycle,
    FaIndustry,
    FaChartLine,
    FaLeaf,
    FaTint,
    FaTrashAlt,
    FaArrowUp,
    FaArrowDown
} from "react-icons/fa";

import {
    getDashboardStats,
    getMaterialDistribution,
    getDamageDistribution,
    getQualityDistribution,
    getRecommendationDistribution,
    getSustainabilitySummary,
    getAnalysisHistory
} from "../../services/dashboardService";

import "./RecyclingFacilityDashboard.css";

function RecyclingFacilityDashboard() {

    const [stats, setStats] = useState({
        total_inventory: 0,
        total_quantity: 0,
        fabric_types: 0,
        today_entries: 0
    });

    const [materials, setMaterials] = useState({});
    const [damage, setDamage] = useState({});
    const [quality, setQuality] = useState({});
    const [recommendations, setRecommendations] = useState({});
    const [sustainability, setSustainability] = useState({
        total_co2_saved: 0,
        total_water_saved: 0,
        total_landfill_saved: 0,
        average_sustainability: 0,
        average_circularity: 0,
        average_eco_rating: 0
    });

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                setLoading(true);

                const [
                    statsResponse,
                    materialResponse,
                    damageResponse,
                    qualityResponse,
                    recommendationResponse,
                    sustainabilityResponse,
                    historyResponse
                ] = await Promise.all([

                    getDashboardStats(),
                    getMaterialDistribution(),
                    getDamageDistribution(),
                    getQualityDistribution(),
                    getRecommendationDistribution(),
                    getSustainabilitySummary(),
                    getAnalysisHistory()

                ]);

                setStats({
                    total_inventory:
                        statsResponse.data?.total_inventory || 0,

                    total_quantity:
                        statsResponse.data?.total_quantity || 0,

                    fabric_types:
                        statsResponse.data?.fabric_types || 0,

                    today_entries:
                        statsResponse.data?.today_entries || 0
                });

                setMaterials(materialResponse.data || {});
                setDamage(damageResponse.data || {});
                setQuality(qualityResponse.data || {});
                setRecommendations(
                    recommendationResponse.data || {}
                );

                setSustainability({
                    total_co2_saved:
                        sustainabilityResponse.data?.total_co2_saved || 0,

                    total_water_saved:
                        sustainabilityResponse.data?.total_water_saved || 0,

                    total_landfill_saved:
                        sustainabilityResponse.data?.total_landfill_saved || 0,

                    average_sustainability:
                        sustainabilityResponse.data?.average_sustainability || 0,

                    average_circularity:
                        sustainabilityResponse.data?.average_circularity || 0,

                    average_eco_rating:
                        sustainabilityResponse.data?.average_eco_rating || 0
                });

                setHistory(
                    Array.isArray(historyResponse.data)
                        ? historyResponse.data
                        : []
                );

                setError("");

            } catch (err) {

                console.error(
                    "Recycling dashboard error:",
                    err
                );

                setError(
                    "Unable to load recycling facility analytics."
                );

            } finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, []);


    if (loading) {

        return (
            <>
                <Navbar />

                <div className="recycling-loading">

                    <div className="recycling-loader"></div>

                    <h3>
                        Loading Recycling Operations...
                    </h3>

                    <p>
                        Preparing waste and recovery analytics
                    </p>

                </div>

                <Footer />
            </>
        );

    }


    return (

        <>

            <Navbar />

            <main className="recycling-dashboard">

                {/* =====================================
                    HEADER
                ===================================== */}

                <section className="recycling-hero">

                    <div>

                        <span className="recycling-eyebrow">
                            RECYCLING OPERATIONS
                        </span>

                        <h1>
                            Recycling Facility Dashboard
                        </h1>

                        <p>
                            Monitor waste inventory, identify recycling
                            opportunities, analyze processing conditions
                            and track material recovery.
                        </p>

                    </div>

                    <div className="recycling-hero-icon">
                        <FaRecycle />
                    </div>

                </section>


                {error && (

                    <div className="recycling-error">
                        {error}
                    </div>

                )}


                {/* =====================================
                    KPI SECTION
                ===================================== */}

                <section className="recycling-kpi-grid">

                    <div className="recycling-kpi">

                        <div className="recycling-kpi-icon blue">
                            <FaBoxes />
                        </div>

                        <div>
                            <span>
                                Waste Inventory
                            </span>

                            <strong>
                                {stats.total_inventory}
                            </strong>

                            <small>
                                Total batches
                            </small>
                        </div>

                    </div>


                    <div className="recycling-kpi">

                        <div className="recycling-kpi-icon green">
                            <FaRecycle />
                        </div>

                        <div>
                            <span>
                                Waste Quantity
                            </span>

                            <strong>
                                {Number(
                                    stats.total_quantity
                                ).toLocaleString()} kg
                            </strong>

                            <small>
                                Total quantity
                            </small>
                        </div>

                    </div>


                    <div className="recycling-kpi">

                        <div className="recycling-kpi-icon orange">
                            <FaIndustry />
                        </div>

                        <div>
                            <span>
                                Fabric Types
                            </span>

                            <strong>
                                {stats.fabric_types}
                            </strong>

                            <small>
                                Material categories
                            </small>
                        </div>

                    </div>


                    <div className="recycling-kpi">

                        <div className="recycling-kpi-icon purple">
                            <FaChartLine />
                        </div>

                        <div>
                            <span>
                                Today's Entries
                            </span>

                            <strong>
                                {stats.today_entries}
                            </strong>

                            <small>
                                New waste records
                            </small>
                        </div>

                    </div>

                </section>


                {/* =====================================
                    WASTE INVENTORY
                ===================================== */}

                <section className="recycling-section">

                    <div className="recycling-section-heading">

                        <div>

                            <span>
                                INVENTORY
                            </span>

                            <h2>
                                Waste Inventory Overview
                            </h2>

                        </div>

                        <FaBoxes />

                    </div>


                    <div className="recycling-data-grid">

                        <div className="recycling-panel">

                            <h3>
                                Material Distribution
                            </h3>

                            <div className="distribution-list">

                                {Object.keys(materials).length > 0 ? (

                                    Object.entries(materials)
                                        .map(([name, value]) => (

                                            <div
                                                className="distribution-row"
                                                key={name}
                                            >

                                                <span>
                                                    {name}
                                                </span>

                                                <strong>
                                                    {value}
                                                </strong>

                                            </div>

                                        ))

                                ) : (

                                    <p className="no-data">
                                        No material distribution data available.
                                    </p>

                                )}

                            </div>

                        </div>


                        <div className="recycling-panel">

                            <h3>
                                Processing Quality
                            </h3>

                            <div className="distribution-list">

                                {Object.keys(quality).length > 0 ? (

                                    Object.entries(quality)
                                        .map(([name, value]) => (

                                            <div
                                                className="distribution-row"
                                                key={name}
                                            >

                                                <span>
                                                    {name}
                                                </span>

                                                <strong>
                                                    {value}
                                                </strong>

                                            </div>

                                        ))

                                ) : (

                                    <p className="no-data">
                                        No quality data available.
                                    </p>

                                )}

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================
                    RECYCLING OPPORTUNITIES
                ===================================== */}

                <section className="recycling-section">

                    <div className="recycling-section-heading">

                        <div>

                            <span>
                                OPPORTUNITIES
                            </span>

                            <h2>
                                Recycling Opportunities
                            </h2>

                        </div>

                        <FaRecycle />

                    </div>


                    <div className="opportunity-grid">

                        {Object.keys(recommendations).length > 0 ? (

                            Object.entries(recommendations)
                                .map(([name, value]) => (

                                    <div
                                        className="opportunity-card"
                                        key={name}
                                    >

                                        <div className="opportunity-icon">
                                            <FaRecycle />
                                        </div>

                                        <div>

                                            <h3>
                                                {name}
                                            </h3>

                                            <strong>
                                                {value}
                                            </strong>

                                            <p>
                                                Recommended processing
                                                opportunity
                                            </p>

                                        </div>

                                    </div>

                                ))

                        ) : (

                            <div className="no-data-card">
                                No recycling opportunities available.
                            </div>

                        )}

                    </div>

                </section>


                {/* =====================================
                    PROCESSING ANALYTICS
                ===================================== */}

                <section className="recycling-section">

                    <div className="recycling-section-heading">

                        <div>

                            <span>
                                PROCESSING ANALYTICS
                            </span>

                            <h2>
                                Waste Processing Conditions
                            </h2>

                        </div>

                        <FaChartLine />

                    </div>


                    <div className="analytics-grid">

                        <div className="analytics-card">

                            <FaRecycle />

                            <span>
                                Material Types
                            </span>

                            <strong>
                                {Object.keys(materials).length}
                            </strong>

                            <small>
                                Identified materials
                            </small>

                        </div>


                        <div className="analytics-card">

                            <FaTrashAlt />

                            <span>
                                Damage Categories
                            </span>

                            <strong>
                                {Object.keys(damage).length}
                            </strong>

                            <small>
                                Damage classifications
                            </small>

                        </div>


                        <div className="analytics-card">

                            <FaIndustry />

                            <span>
                                Quality Categories
                            </span>

                            <strong>
                                {Object.keys(quality).length}
                            </strong>

                            <small>
                                Quality classifications
                            </small>

                        </div>

                    </div>


                    <div className="recycling-panel damage-panel">

                        <h3>
                            Damage Distribution
                        </h3>

                        {Object.keys(damage).length > 0 ? (

                            Object.entries(damage)
                                .map(([name, value]) => (

                                    <div
                                        className="distribution-row"
                                        key={name}
                                    >

                                        <span>
                                            {name}
                                        </span>

                                        <strong>
                                            {value}
                                        </strong>

                                    </div>

                                ))

                        ) : (

                            <p className="no-data">
                                No damage analytics available.
                            </p>

                        )}

                    </div>

                </section>


                {/* =====================================
                    RECOVERY STATISTICS
                ===================================== */}

                <section className="recycling-section">

                    <div className="recycling-section-heading">

                        <div>

                            <span>
                                RECOVERY PERFORMANCE
                            </span>

                            <h2>
                                Recovery Statistics
                            </h2>

                        </div>

                        <FaLeaf />

                    </div>


                    <div className="recovery-grid">

                        <div className="recovery-card">

                            <FaRecycle />

                            <span>
                                Sustainability Score
                            </span>

                            <strong>
                                {sustainability.average_sustainability}
                            </strong>

                        </div>


                        <div className="recovery-card">

                            <FaChartLine />

                            <span>
                                Circularity Score
                            </span>

                            <strong>
                                {sustainability.average_circularity}
                            </strong>

                        </div>


                        <div className="recovery-card">

                            <FaLeaf />

                            <span>
                                Eco Rating
                            </span>

                            <strong>
                                {sustainability.average_eco_rating}
                            </strong>

                        </div>


                        <div className="recovery-card">

                            <FaRecycle />

                            <span>
                                CO₂ Saved
                            </span>

                            <strong>
                                {Number(
                                    sustainability.total_co2_saved
                                ).toLocaleString()} kg
                            </strong>

                        </div>


                        <div className="recovery-card">

                            <FaTint />

                            <span>
                                Water Saved
                            </span>

                            <strong>
                                {Number(
                                    sustainability.total_water_saved
                                ).toLocaleString()} L
                            </strong>

                        </div>


                        <div className="recovery-card">

                            <FaTrashAlt />

                            <span>
                                Landfill Saved
                            </span>

                            <strong>
                                {Number(
                                    sustainability.total_landfill_saved
                                ).toLocaleString()} kg
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =====================================
                    RECENT PROCESSING
                ===================================== */}

                <section className="recycling-section">

                    <div className="recycling-section-heading">

                        <div>

                            <span>
                                RECENT ACTIVITY
                            </span>

                            <h2>
                                Recent Waste Analysis
                            </h2>

                        </div>

                        <FaChartLine />

                    </div>


                    <div className="recycling-table-wrapper">

                        {history.length > 0 ? (

                            <table className="recycling-table">

                                <thead>

                                    <tr>
                                        <th>Image</th>
                                        <th>Material</th>
                                        <th>Damage</th>
                                        <th>Quality</th>
                                        <th>Recommendation</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {history
                                        .slice(0, 8)
                                        .map((item) => (

                                            <tr key={item.id}>

                                                <td>
                                                    {item.image_name}
                                                </td>

                                                <td>
                                                    {item.material}
                                                </td>

                                                <td>
                                                    {item.damage}
                                                </td>

                                                <td>
                                                    {item.quality_grade}
                                                </td>

                                                <td>
                                                    {item.recommended_action}
                                                </td>

                                            </tr>

                                        ))}

                                </tbody>

                            </table>

                        ) : (

                            <div className="no-data-card">
                                No recent waste analysis records found.
                            </div>

                        )}

                    </div>

                </section>

            </main>

            <Footer />

        </>

    );

}

export default RecyclingFacilityDashboard;