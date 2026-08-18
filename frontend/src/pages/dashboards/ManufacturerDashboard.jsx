import { useEffect, useMemo, useState } from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
    FaIndustry,
    FaRecycle,
    FaWeightHanging,
    FaLayerGroup,
    FaLeaf,
    FaTint,
    FaChartLine,
    FaArrowUp,
    FaBoxes
} from "react-icons/fa";

import {
    getDashboardStats,
    getMaterialDistribution,
    getAnalysisHistory,
    getSustainabilitySummary
} from "../../services/dashboardService";

import "./ManufacturerDashboard.css";


function ManufacturerDashboard() {

    const [stats, setStats] = useState({
        total_inventory: 0,
        total_quantity: 0,
        fabric_types: 0
    });

    const [materials, setMaterials] = useState({});
    const [history, setHistory] = useState([]);
    const [sustainability, setSustainability] = useState({
        total_co2_saved: 0,
        total_water_saved: 0,
        total_landfill_diversion: 0,
        average_sustainability_score: 0,
        average_circularity_score: 0,
        average_resource_recovery: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const loadManufacturerDashboard = async () => {

            try {

                setLoading(true);

                const [
                    statsResponse,
                    materialResponse,
                    historyResponse,
                    sustainabilityResponse
                ] = await Promise.all([
                    getDashboardStats(),
                    getMaterialDistribution(),
                    getAnalysisHistory(),
                    getSustainabilitySummary()
                ]);


                setStats({
                    total_inventory:
                        statsResponse.data?.total_inventory || 0,

                    total_quantity:
                        statsResponse.data?.total_quantity || 0,

                    fabric_types:
                        statsResponse.data?.fabric_types || 0
                });


                setMaterials(
                    materialResponse.data || {}
                );


                setHistory(
                    Array.isArray(historyResponse.data)
                        ? historyResponse.data
                        : []
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
                    "Manufacturer dashboard error:",
                    err
                );

                setError(
                    "Unable to load manufacturer analytics."
                );

            } finally {

                setLoading(false);

            }

        };


        loadManufacturerDashboard();

    }, []);


    /*
    ==========================================
    MATERIAL DISTRIBUTION
    ==========================================
    */

    const materialEntries = useMemo(() => {

        return Object.entries(materials)
            .sort((a, b) => b[1] - a[1]);

    }, [materials]);


    const maxMaterialValue =
        materialEntries.length > 0
            ? Math.max(...materialEntries.map(item => item[1]))
            : 1;


    /*
    ==========================================
    RECENT ANALYSES
    ==========================================
    */

    const recentAnalyses =
        Array.isArray(history)
            ? history.slice(0, 5)
            : [];


    /*
    ==========================================
    LOADING
    ==========================================
    */

    if (loading) {

        return (
            <>
                <Navbar />

                <div className="manufacturer-loading">

                    <div className="manufacturer-loader"></div>

                    <p>
                        Loading Manufacturer Dashboard...
                    </p>

                </div>

                <Footer />
            </>
        );

    }


    return (

        <>

            <Navbar />


            <main className="manufacturer-dashboard">


                {/* ==========================================
                    HEADER
                ========================================== */}

                <section className="manufacturer-hero">

                    <div className="hero-content">

                        <div className="hero-icon">
                            <FaIndustry />
                        </div>

                        <div>

                            <span className="hero-label">
                                MANUFACTURER WORKSPACE
                            </span>

                            <h1>
                                Production Intelligence
                            </h1>

                            <p>
                                Monitor textile waste, material recovery,
                                circular economy performance and
                                sustainability impact.
                            </p>

                        </div>

                    </div>


                    <div className="hero-status">

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


                {/* ==========================================
                    ERROR
                ========================================== */}

                {error && (

                    <div className="manufacturer-error">
                        {error}
                    </div>

                )}


                {/* ==========================================
                    KPI CARDS
                ========================================== */}

                <section className="manufacturer-kpi-grid">


                    <div className="manufacturer-kpi blue">

                        <div className="kpi-icon">
                            <FaWeightHanging />
                        </div>

                        <div>

                            <span>
                                Tracked Textile Waste
                            </span>

                            <strong>
                                {Number(
                                    stats.total_quantity || 0
                                ).toLocaleString()} kg
                            </strong>

                            <small>
                                Total inventory quantity
                            </small>

                        </div>

                    </div>


                    <div className="manufacturer-kpi green">

                        <div className="kpi-icon">
                            <FaBoxes />
                        </div>

                        <div>

                            <span>
                                Waste Batches
                            </span>

                            <strong>
                                {stats.total_inventory}
                            </strong>

                            <small>
                                Recorded inventory batches
                            </small>

                        </div>

                    </div>


                    <div className="manufacturer-kpi orange">

                        <div className="kpi-icon">
                            <FaLayerGroup />
                        </div>

                        <div>

                            <span>
                                Material Types
                            </span>

                            <strong>
                                {stats.fabric_types}
                            </strong>

                            <small>
                                Fabric categories tracked
                            </small>

                        </div>

                    </div>


                    <div className="manufacturer-kpi purple">

                        <div className="kpi-icon">
                            <FaLeaf />
                        </div>

                        <div>

                            <span>
                                Sustainability Score
                            </span>

                            <strong>
                                {Number(
                                    sustainability.average_sustainability_score || 0
                                ).toFixed(0)}
                            </strong>

                            <small>
                                Average platform score
                            </small>

                        </div>

                    </div>


                </section>


                {/* ==========================================
                    SECTION TITLE
                ========================================== */}

                <div className="manufacturer-section-heading">

                    <div>

                        <span>
                            MANUFACTURING ANALYTICS
                        </span>

                        <h2>
                            Waste & Material Intelligence
                        </h2>

                    </div>

                    <p>
                        Understand what materials are entering
                        your waste stream and how they can be recovered.
                    </p>

                </div>


                {/* ==========================================
                    MATERIAL ANALYSIS
                ========================================== */}

                <section className="manufacturer-main-grid">


                    <div className="manufacturer-panel material-panel">

                        <div className="panel-header">

                            <div className="panel-title">

                                <div className="panel-icon blue-icon">
                                    <FaLayerGroup />
                                </div>

                                <div>

                                    <h3>
                                        Production Material Analysis
                                    </h3>

                                    <p>
                                        Distribution of analyzed textile materials
                                    </p>

                                </div>

                            </div>

                        </div>


                        {materialEntries.length > 0 ? (

                            <div className="material-list">

                                {materialEntries.map(
                                    ([name, value]) => {

                                        const percentage =
                                            (value / maxMaterialValue) * 100;

                                        return (

                                            <div
                                                className="material-row"
                                                key={name}
                                            >

                                                <div className="material-info">

                                                    <span>
                                                        {name}
                                                    </span>

                                                    <strong>
                                                        {value}
                                                    </strong>

                                                </div>

                                                <div className="material-bar">

                                                    <div
                                                        className="material-progress"
                                                        style={{
                                                            width:
                                                                `${percentage}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        ) : (

                            <div className="manufacturer-empty">
                                No material analysis available yet.
                            </div>

                        )}

                    </div>


                    {/* ==========================================
                        MATERIAL RECOVERY
                    ========================================== */}

                    <div className="manufacturer-panel recovery-panel">

                        <div className="panel-header">

                            <div className="panel-title">

                                <div className="panel-icon green-icon">
                                    <FaRecycle />
                                </div>

                                <div>

                                    <h3>
                                        Material Recovery
                                    </h3>

                                    <p>
                                        Circular economy indicators
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="recovery-content">


                            <div className="recovery-score">

                                <div className="recovery-circle">

                                    {Number(
                                        sustainability.average_circularity_score || 0
                                    ).toFixed(0)}

                                    <span>
                                        /100
                                    </span>

                                </div>

                                <div>

                                    <strong>
                                        Circularity Index
                                    </strong>

                                    <p>
                                        Average recovery potential
                                    </p>

                                </div>

                            </div>


                            <div className="recovery-stat">

                                <div>

                                    <span>
                                        Landfill Diversion
                                    </span>

                                    <strong>
                                        {Number(
                                            sustainability.total_landfill_diversion || 0
                                        ).toLocaleString()} kg
                                    </strong>

                                </div>

                                <FaRecycle />

                            </div>


                            <div className="recovery-stat">

                                <div>

                                    <span>
                                        Material Recovery
                                    </span>

                                    <strong>
                                        {history.length}
                                    </strong>

                                </div>

                                <FaArrowUp />

                            </div>


                        </div>

                    </div>


                </section>


                {/* ==========================================
                    SUSTAINABILITY PERFORMANCE
                ========================================== */}

                <section className="manufacturer-panel sustainability-panel">

                    <div className="panel-header">

                        <div className="panel-title">

                            <div className="panel-icon leaf-icon">
                                <FaLeaf />
                            </div>

                            <div>

                                <h3>
                                    Sustainability Performance
                                </h3>

                                <p>
                                    Environmental impact generated through
                                    textile recovery and reuse
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="sustainability-metrics">


                        <div className="sustainability-metric">

                            <div className="metric-icon carbon">
                                <FaLeaf />
                            </div>

                            <span>
                                CO₂ Saved
                            </span>

                            <strong>
                                {Number(
                                    sustainability.total_co2_saved || 0
                                ).toLocaleString()} kg
                            </strong>

                            <small>
                                Carbon reduction
                            </small>

                        </div>


                        <div className="sustainability-metric">

                            <div className="metric-icon water">
                                <FaTint />
                            </div>

                            <span>
                                Water Saved
                            </span>

                            <strong>
                                {Number(
                                    sustainability.total_water_saved || 0
                                ).toLocaleString()} L
                            </strong>

                            <small>
                                Water conservation
                            </small>

                        </div>


                        <div className="sustainability-metric">

                            <div className="metric-icon recycle">
                                <FaRecycle />
                            </div>

                            <span>
                                Resource Recovery
                            </span>

                            <strong>
                                {Number(
                                    sustainability.average_resource_recovery || 0
                                ).toFixed(1)}
                                /5
                            </strong>

                            <small>
                                Material recovery potential
                            </small>

                        </div>


                    </div>

                </section>


                {/* ==========================================
                    RECENT AI ANALYSIS
                ========================================== */}

                <section className="manufacturer-panel analysis-panel">

                    <div className="panel-header">

                        <div className="panel-title">

                            <div className="panel-icon purple-icon">
                                <FaChartLine />
                            </div>

                            <div>

                                <h3>
                                    Recent Production Waste Analysis
                                </h3>

                                <p>
                                    Latest AI-powered textile assessments
                                </p>

                            </div>

                        </div>

                    </div>


                    {recentAnalyses.length > 0 ? (

                        <div className="analysis-table-wrapper">

                            <table className="manufacturer-analysis-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Material
                                        </th>

                                        <th>
                                            Damage
                                        </th>

                                        <th>
                                            Quality
                                        </th>

                                        <th>
                                            Recyclability
                                        </th>

                                        <th>
                                            Recommendation
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {recentAnalyses.map(
                                        (item) => (

                                            <tr key={item.id}>

                                                <td>
                                                    <strong>
                                                        {item.material || "—"}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {item.damage || "—"}
                                                </td>

                                                <td>

                                                    <span className="quality-badge">
                                                        {item.quality_grade || "—"}
                                                    </span>

                                                </td>

                                                <td>
                                                    {item.recyclability || "—"}
                                                </td>

                                                <td>
                                                    {item.recommended_action || "—"}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="manufacturer-empty">
                            No production waste analyses available yet.
                        </div>

                    )}

                </section>


                {/* ==========================================
                    CIRCULAR ECONOMY INSIGHTS
                ========================================== */}

                <section className="manufacturer-insight-grid">


                    <div className="insight-card">

                        <div className="insight-icon">
                            <FaRecycle />
                        </div>

                        <div>

                            <span>
                                CIRCULAR ECONOMY
                            </span>

                            <h3>
                                Improve Material Recovery
                            </h3>

                            <p>
                                Use AI analysis results to identify
                                textile waste suitable for reuse,
                                recycling and material recovery.
                            </p>

                        </div>

                    </div>


                    <div className="insight-card">

                        <div className="insight-icon">
                            <FaLeaf />
                        </div>

                        <div>

                            <span>
                                SUSTAINABILITY
                            </span>

                            <h3>
                                Reduce Environmental Impact
                            </h3>

                            <p>
                                Track carbon, water and landfill
                                savings generated through sustainable
                                waste processing.
                            </p>

                        </div>

                    </div>


                </section>


            </main>


            <Footer />

        </>

    );

}


export default ManufacturerDashboard;