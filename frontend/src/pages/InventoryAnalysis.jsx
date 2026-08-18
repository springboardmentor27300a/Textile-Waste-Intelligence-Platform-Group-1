import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
    FaArrowLeft,
    FaRecycle,
    FaLeaf,
    FaTint,
    FaTrash,
    FaChartLine,
    FaCheckCircle
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

import "./InventoryAnalysis.css";


function InventoryAnalysis() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const inventoryId =
        searchParams.get("inventory_id");


    const [analysis, setAnalysis] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==========================================
    // Load Inventory Sustainability Analysis
    // ==========================================

    useEffect(() => {

        const loadAnalysis = async () => {

            try {

                setLoading(true);
                setError("");


                if (!inventoryId) {

                    setError(
                        "Inventory batch was not specified."
                    );

                    return;
                }


                const token =
                    localStorage.getItem("token");


                const response = await API.post(
                    `/inventory-analysis/${inventoryId}`,
                    {},
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                setAnalysis(response.data);

            }

            catch (err) {

                console.error(
                    "Inventory analysis error:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Unable to analyze inventory batch."
                );

            }

            finally {

                setLoading(false);

            }

        };


        loadAnalysis();

    }, [inventoryId]);


    // ==========================================
    // Loading
    // ==========================================

    if (loading) {

        return (
            <>
                <Navbar />

                <main className="inventory-analysis-page">

                    <div className="analysis-loading">

                        <div className="loading-spinner"></div>

                        <h2>
                            Analyzing Inventory Batch
                        </h2>

                        <p>
                            Generating sustainability,
                            environmental and circular
                            economy insights...
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

                <main className="inventory-analysis-page">

                    <div className="analysis-error">

                        <FaTrash />

                        <h2>
                            Unable to Analyze Batch
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                navigate("/inventory")
                            }
                        >
                            <FaArrowLeft />
                            Back to Inventory
                        </button>

                    </div>

                </main>

                <Footer />
            </>
        );

    }


    if (!analysis) {
        return null;
    }


    return (
        <>
            <Navbar />

            <main className="inventory-analysis-page">

                {/* =================================
                    HEADER
                ================================= */}

                <section className="inventory-analysis-header">

                    <div>

                        <span className="section-label">
                            INVENTORY SUSTAINABILITY ANALYSIS
                        </span>

                        <h1>
                            Batch Analysis
                        </h1>

                        <p>
                            Sustainability and circular
                            economy assessment for inventory
                            batch {analysis.batch_id}.
                        </p>

                    </div>


                    <button
                        className="back-inventory-button"
                        onClick={() =>
                            navigate("/inventory")
                        }
                    >
                        <FaArrowLeft />
                        Back to Inventory
                    </button>

                </section>


                {/* =================================
                    BATCH INFORMATION
                ================================= */}

                <section className="inventory-analysis-section">

                    <div className="section-heading">

                        <span>
                            BATCH INFORMATION
                        </span>

                        <h2>
                            Inventory Details
                        </h2>

                    </div>


                    <div className="batch-info-grid">

                        <div className="batch-info-card">

                            <span>
                                Batch ID
                            </span>

                            <strong>
                                {analysis.batch_id}
                            </strong>

                        </div>


                        <div className="batch-info-card">

                            <span>
                                Fabric Type
                            </span>

                            <strong>
                                {analysis.fabric_type}
                            </strong>

                        </div>


                        <div className="batch-info-card">

                            <span>
                                Quantity
                            </span>

                            <strong>
                                {analysis.quantity} kg
                            </strong>

                        </div>


                        <div className="batch-info-card">

                            <span>
                                Condition
                            </span>

                            <strong>
                                {analysis.condition || "Not specified"}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================
                    RECOMMENDATION
                ================================= */}

                <section className="recommendation-card">

                    <div className="recommendation-icon">
                        <FaRecycle />
                    </div>

                    <div>

                        <span>
                            RECOMMENDED ACTION
                        </span>

                        <h2>
                            {analysis.recommended_action}
                        </h2>

                        <p>
                            Recovery potential:
                            {" "}
                            <strong>
                                {analysis.recovery_potential}
                            </strong>
                        </p>

                    </div>

                </section>


                {/* =================================
                    SCORE CARDS
                ================================= */}

                <section className="inventory-analysis-section">

                    <div className="section-heading">

                        <span>
                            SUSTAINABILITY INTELLIGENCE
                        </span>

                        <h2>
                            Sustainability Assessment
                        </h2>

                    </div>


                    <div className="score-grid">

                        <div className="score-card">

                            <FaLeaf />

                            <span>
                                Sustainability Score
                            </span>

                            <strong>
                                {analysis.sustainability_score}
                            </strong>

                            <small>
                                / 100
                            </small>

                        </div>


                        <div className="score-card">

                            <FaRecycle />

                            <span>
                                Recyclability Score
                            </span>

                            <strong>
                                {analysis.recyclability_score}
                            </strong>

                            <small>
                                / 100
                            </small>

                        </div>


                        <div className="score-card">

                            <FaChartLine />

                            <span>
                                Circularity Score
                            </span>

                            <strong>
                                {analysis.circularity_score}
                            </strong>

                            <small>
                                / 100
                            </small>

                        </div>


                        <div className="score-card">

                            <FaCheckCircle />

                            <span>
                                Circular Economy Index
                            </span>

                            <strong>
                                {analysis.circular_economy_index}
                            </strong>

                            <small>
                                / 100
                            </small>

                        </div>

                    </div>

                </section>


                {/* =================================
                    ENVIRONMENTAL IMPACT
                ================================= */}

                <section className="inventory-analysis-section">

                    <div className="section-heading">

                        <span>
                            ENVIRONMENTAL IMPACT
                        </span>

                        <h2>
                            Environmental Impact & Benefits
                        </h2>

                        <p>
                            Impact values and estimated environmental
                            benefits for this inventory batch.
                        </p>

                    </div>


                    <div className="impact-grid">

                        {/* Carbon Footprint */}

                        <div className="impact-card">

                            <div className="impact-icon">
                                <FaLeaf />
                            </div>

                            <span>
                                Carbon Footprint
                            </span>

                            <strong>
                                {analysis.carbon_footprint != null
                                    ? `${analysis.carbon_footprint} kg CO₂e`
                                    : "Not available"
                                }
                            </strong>

                            <small>
                                Estimated production impact
                            </small>

                        </div>


                        {/* CO2 Saved */}

                        <div className="impact-card benefit-card">

                            <div className="impact-icon">
                                <FaLeaf />
                            </div>

                            <span>
                                CO₂ Saved
                            </span>

                            <strong>
                                {analysis.co2_saved != null
                                    ? `${analysis.co2_saved} kg`
                                    : "Not available"
                                }
                            </strong>

                            <small>
                                Estimated recovery benefit
                            </small>

                        </div>


                        {/* Water Impact */}

                        <div className="impact-card">

                            <div className="impact-icon">
                                <FaTint />
                            </div>

                            <span>
                                Water Impact
                            </span>

                            <strong>
                                {analysis.water_impact != null
                                    ? `${Number(
                                        analysis.water_impact
                                    ).toLocaleString()} L`
                                    : "Not available"
                                }
                            </strong>

                            <small>
                                Estimated production impact
                            </small>

                        </div>


                        {/* Water Saved */}

                        <div className="impact-card benefit-card">

                            <div className="impact-icon">
                                <FaTint />
                            </div>

                            <span>
                                Water Saved
                            </span>

                            <strong>
                                {analysis.water_saved != null
                                    ? `${Number(
                                        analysis.water_saved
                                    ).toLocaleString()} L`
                                    : "Not available"
                                }
                            </strong>

                            <small>
                                Estimated recovery benefit
                            </small>

                        </div>


                        {/* Landfill Diversion */}

                        <div className="impact-card benefit-card">

                            <div className="impact-icon">
                                <FaTrash />
                            </div>

                            <span>
                                Landfill Diversion
                            </span>

                            <strong>
                                {analysis.landfill_diversion != null
                                    ? `${analysis.landfill_diversion} kg`
                                    : "Not available"
                                }
                            </strong>

                            <small>
                                Estimated waste diverted
                            </small>

                        </div>

                    </div>


                    {/* Methodology */}

                    <div className="impact-methodology">

                        <div className="methodology-header">

                            <FaCheckCircle />

                            <strong>
                                Assessment Methodology
                            </strong>

                        </div>

                        <p>
                            These values are platform estimates
                            generated from the inventory sustainability
                            assessment. Source-backed impact factors are
                            shown together with the applicable assessment
                            scenario.
                        </p>

                        {analysis.impact_source && (
                            <div className="methodology-details">

                                <div>
                                    <span>
                                        Source
                                    </span>

                                    <strong>
                                        {analysis.impact_source}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Boundary
                                    </span>

                                    <strong>
                                        {analysis.impact_boundary ||
                                            "Not available"}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Region
                                    </span>

                                    <strong>
                                        {analysis.impact_region ||
                                            "Not available"}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Scenario
                                    </span>

                                    <strong>
                                        {analysis.impact_scenario ||
                                            "Not available"}
                                    </strong>
                                </div>

                            </div>
                        )}

                    </div>

                </section>


                {/* =================================
                    CIRCULAR ECONOMY
                ================================= */}

                <section className="inventory-analysis-section">

                    <div className="section-heading">

                        <span>
                            CIRCULAR ECONOMY ANALYTICS
                        </span>

                        <h2>
                            Recovery & Circularity
                        </h2>

                    </div>


                    <div className="circular-grid">

                        <div className="circular-card">

                            <span>
                                Material Recovery
                            </span>

                            <strong>
                                {analysis.material_recovery_score}
                            </strong>

                            <small>
                                / 100
                            </small>

                        </div>


                        <div className="circular-card">

                            <span>
                                Reuse Score
                            </span>

                            <strong>
                                {analysis.reuse_score}
                            </strong>

                            <small>
                                / 100
                            </small>

                        </div>


                        <div className="circular-card">

                            <span>
                                Waste Diversion
                            </span>

                            <strong>
                                {analysis.waste_diversion_rate}%
                            </strong>

                        </div>


                        <div className="circular-card">

                            <span>
                                Resource Recovery
                            </span>

                            <strong>
                                {analysis.resource_recovery_rate}%
                            </strong>

                        </div>


                        <div className="circular-card">

                            <span>
                                Circularity Category
                            </span>

                            <strong>
                                {analysis.circularity_category}
                            </strong>

                        </div>


                        <div className="circular-card">

                            <span>
                                Circular Rating
                            </span>

                            <strong>
                                {analysis.circular_rating}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================
                    ANALYSIS METADATA
                ================================= */}

                <section className="inventory-analysis-section">

                    <div className="section-heading">

                        <span>
                            ANALYSIS DETAILS
                        </span>

                        <h2>
                            Assessment Information
                        </h2>

                    </div>


                    <div className="analysis-metadata-grid">

                        <div className="metadata-card">

                            <span>
                                Analyzed By
                            </span>

                            <strong>
                                {analysis.analyzed_by != null
                                    ? `User ${analysis.analyzed_by}`
                                    : "Not available"
                                }
                            </strong>

                        </div>


                        <div className="metadata-card">

                            <span>
                                Analysis Status
                            </span>

                            <strong className="status-complete">
                                <FaCheckCircle />
                                Completed
                            </strong>

                        </div>


                        <div className="metadata-card">

                            <span>
                                Impact Factor Status
                            </span>

                            <strong>
                                {analysis.impact_factor_status ||
                                    "Not available"}
                            </strong>

                        </div>


                        <div className="metadata-card">

                            <span>
                                Analysis Date
                            </span>

                            <strong>
                                {analysis.analyzed_at
                                    ? new Date(
                                        analysis.analyzed_at
                                    ).toLocaleDateString()
                                    : "Not available"
                                }
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================
                    FOOTER INSIGHT
                ================================= */}

                <section className="analysis-insight">

                    <FaChartLine />

                    <div>

                        <span>
                            INVENTORY INSIGHT
                        </span>

                        <h3>
                            Sustainability assessment completed
                        </h3>

                        <p>
                            Batch {analysis.batch_id} has been
                            assessed for recycling potential,
                            environmental impact and circular
                            economy performance.
                        </p>

                    </div>

                </section>

            </main>

            <Footer />
        </>
    );
}


export default InventoryAnalysis;