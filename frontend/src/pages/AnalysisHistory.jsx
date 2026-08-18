import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecentAnalysis from "../components/dashboard/RecentAnalysis";
import { generateHistoryPDF } from "../utils/historyPdfGenerator";
import { generateHistoryCSV } from "../utils/historyCsvGenerator";

import { getAnalysisHistory } from "../services/analysisService";

import "./AnalysisHistory.css";

function AnalysisHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await getAnalysisHistory();
            setHistory(response.data);
        } catch (error) {
            console.error("Failed to load analysis history:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="analysis-history-container">

                <div className="page-header">
                    <h1>Analysis History</h1>
                    <p>View all AI textile analyses and export reports.</p>
                </div>

                {loading ? (

                    <div className="empty-card">
                        Loading analysis history...
                    </div>

                ) : history.length > 0 ? (

                    <RecentAnalysis
                        history={history}
                        onView={(item) => setSelectedAnalysis(item)}
                        onPdf={(item) => generateHistoryPDF(item)}
                        onCsv={(item) => generateHistoryCSV(item)}
                    />

                ) : (

                    <div className="empty-card">
                        No analysis history available.
                    </div>

                )}

            </div>

            {selectedAnalysis && (

                <div className="modal-overlay">

                    <div className="analysis-modal">

                        <div className="modal-header">

                            <h2>AI Textile Analysis Report</h2>

                            <button
                                className="close-btn"
                                onClick={() => setSelectedAnalysis(null)}
                            >
                                ✕
                            </button>

                        </div>

                        {/* BASIC */}

                        <div className="detail-section">

                            <h3>📄 Basic Information</h3>

                            <div className="detail-grid">

                                <div><strong>Image</strong></div>
                                <div>{selectedAnalysis.image_name}</div>

                                <div><strong>Material</strong></div>
                                <div>{selectedAnalysis.material}</div>

                                <div><strong>Material Confidence</strong></div>
                                <div>
                                    {(selectedAnalysis.material_confidence * 100).toFixed(1)}%
                                </div>

                                <div><strong>Damage</strong></div>
                                <div>{selectedAnalysis.damage}</div>

                                <div><strong>Damage Confidence</strong></div>
                                <div>
                                    {(selectedAnalysis.damage_confidence * 100).toFixed(1)}%
                                </div>

                                <div><strong>Quality Grade</strong></div>
                                <div>{selectedAnalysis.quality_grade}</div>

                                <div><strong>Quality Score</strong></div>
                                <div>{selectedAnalysis.quality_score}</div>

                                <div><strong>Recommendation</strong></div>
                                <div>{selectedAnalysis.recommended_action}</div>

                                <div><strong>Date</strong></div>
                                <div>
                                    {new Date(selectedAnalysis.analyzed_at).toLocaleString()}
                                </div>

                            </div>

                        </div>

                        {/* MATERIAL */}

                        <div className="detail-section">

                            <h3>🧵 Material Classification</h3>

                            <div className="detail-grid">

                                <div><strong>Material Category</strong></div>
                                <div>{selectedAnalysis.material_category}</div>

                                <div><strong>Fiber Composition</strong></div>
                                <div>{selectedAnalysis.fiber_composition}</div>

                                <div><strong>Blend Identification</strong></div>
                                <div>{selectedAnalysis.blend_identification}</div>

                                <div><strong>Fabric Texture</strong></div>
                                <div>{selectedAnalysis.fabric_texture}</div>

                                <div><strong>Fabric Pattern</strong></div>
                                <div>{selectedAnalysis.fabric_pattern}</div>

                            </div>

                        </div>

                        {/* WASTE */}

                        <div className="detail-section">

                            <h3>♻ Waste Classification</h3>

                            <div className="detail-grid">

                                <div><strong>Category</strong></div>
                                <div>{selectedAnalysis.waste_category}</div>

                                <div><strong>Recyclability</strong></div>
                                <div>{selectedAnalysis.recyclability}</div>

                                <div><strong>Reuse Potential</strong></div>
                                <div>{selectedAnalysis.reuse_potential}</div>

                                <div><strong>Contamination</strong></div>
                                <div>{selectedAnalysis.contamination_detection}</div>

                                <div><strong>Disposal</strong></div>
                                <div>{selectedAnalysis.disposal_recommendation}</div>

                                <div><strong>Compostable</strong></div>
                                <div>{selectedAnalysis.compostable}</div>

                                <div><strong>Hazardous Textile</strong></div>
                                <div>{selectedAnalysis.hazardous_textile}</div>

                            </div>

                        </div>

                        {/* RECYCLING */}

                        <div className="detail-section">

                            <h3>🔄 Recycling Recommendation</h3>

                            <div className="detail-grid">

                                <div><strong>Method</strong></div>
                                <div>{selectedAnalysis.recommended_method}</div>

                                <div><strong>Fiber Recycling</strong></div>
                                <div>{selectedAnalysis.fiber_recycling}</div>

                                <div><strong>Mechanical Recycling</strong></div>
                                <div>{selectedAnalysis.mechanical_recycling}</div>

                                <div><strong>Chemical Recycling</strong></div>
                                <div>{selectedAnalysis.chemical_recycling}</div>

                                <div><strong>Fabric Reuse</strong></div>
                                <div>{selectedAnalysis.fabric_reuse}</div>

                                <div><strong>Industrial Recovery</strong></div>
                                <div>{selectedAnalysis.industrial_recovery}</div>

                                <div><strong>Donation</strong></div>
                                <div>{selectedAnalysis.donation}</div>

                                <div><strong>Estimated Value</strong></div>
                                <div>{selectedAnalysis.estimated_value}</div>

                                <div><strong>Environmental Impact</strong></div>
                                <div>{selectedAnalysis.environmental_impact}</div>

                                <div><strong>Priority</strong></div>
                                <div>{selectedAnalysis.priority}</div>

                                <div><strong>Waste Reduction Strategy</strong></div>
                                <div>{selectedAnalysis.waste_reduction_strategy}</div>

                                <div><strong>Upcycling Suggestions</strong></div>
                                <div>{selectedAnalysis.upcycling_suggestions}</div>
                                

                            </div>

                            {/* SUSTAINABILITY */}

                        <div className="detail-section">

                            <h3>🌱 Sustainability Intelligence</h3>

                            <div className="detail-grid">

                                <div><strong>Sustainability Score</strong></div>
                                <div>{selectedAnalysis.sustainability_score}</div>

                                <div><strong>Environmental Rating</strong></div>
                                <div>{selectedAnalysis.environmental_rating}</div>

                                <div><strong>Carbon Footprint</strong></div>
                                <div>{selectedAnalysis.carbon_footprint} kg CO₂e</div>

                                <div><strong>CO₂ Saved</strong></div>
                                <div>{selectedAnalysis.co2_saved} kg</div>

                                <div><strong>Water Saved</strong></div>
                                <div>{selectedAnalysis.water_saved?.toLocaleString()} L</div>

                                <div><strong>Landfill Saved</strong></div>
                                <div>{selectedAnalysis.landfill_saved} kg</div>

                                <div><strong>Resource Conservation</strong></div>
                                <div>{selectedAnalysis.resource_conservation}</div>

                            </div>
                            {/* ENVIRONMENTAL ANALYTICS */}

                            <div className="detail-section">

                                <h3>🌍 Environmental Analytics</h3>

                                <div className="detail-grid">

                                    <div><strong>Carbon Reduction</strong></div>
                                    <div>{selectedAnalysis.carbon_reduction} kg</div>

                                    <div><strong>Water Conservation</strong></div>
                                    <div>{selectedAnalysis.water_conservation?.toLocaleString()} L</div>

                                    <div><strong>Landfill Diversion</strong></div>
                                    <div>{selectedAnalysis.landfill_diversion} kg</div>

                                    <div><strong>Eco Rating</strong></div>
                                    <div>{selectedAnalysis.eco_rating}/5</div>

                                </div>

                            </div>

                            {/* WASTE SCORING */}

                            <div className="detail-section">

                                <h3>📊 Waste Scoring Engine</h3>

                                <div className="detail-grid">

                                    <div><strong>Recyclability Score</strong></div>
                                    <div>{selectedAnalysis.recyclability_score}%</div>

                                    <div><strong>Reuse Score</strong></div>
                                    <div>{selectedAnalysis.reuse_score}%</div>

                                    <div><strong>Sustainability Score</strong></div>
                                    <div>{selectedAnalysis.sustainability_score}%</div>

                                    <div><strong>Material Recovery Score</strong></div>
                                    <div>{selectedAnalysis.material_recovery_score}%</div>

                                    <div><strong>Processing Feasibility</strong></div>
                                    <div>{selectedAnalysis.processing_feasibility_score}%</div>

                                    <div><strong>Circularity Score</strong></div>
                                    <div>{selectedAnalysis.circularity_score}%</div>

                                    <div><strong>Circularity Category</strong></div>
                                    <div>{selectedAnalysis.circularity_category}</div>

                                </div>

                            </div>

                            {/* CIRCULAR ECONOMY */}

                            <div className="detail-section">

                                <h3>♻ Circular Economy Analytics</h3>

                                <div className="detail-grid">

                                    <div><strong>Recycling Efficiency</strong></div>
                                    <div>{selectedAnalysis.recycling_efficiency}%</div>

                                    <div><strong>Waste Diversion Rate</strong></div>
                                    <div>{selectedAnalysis.waste_diversion_rate}%</div>

                                    <div><strong>Resource Recovery Rate</strong></div>
                                    <div>{selectedAnalysis.resource_recovery_rate}%</div>

                                    <div><strong>Circular Economy Index</strong></div>
                                    <div>{selectedAnalysis.circular_economy_index}</div>

                                    <div><strong>Overall Rating</strong></div>
                                    <div>{selectedAnalysis.circular_rating}</div>

                                </div>

                            </div>

                            {/* BENCHMARK */}

                            <div className="detail-section">

                                <h3>🏆 Sustainability Benchmark</h3>

                                <div className="detail-grid">

                                    <div><strong>Overall Score</strong></div>
                                    <div>{selectedAnalysis.overall_score}%</div>

                                    <div><strong>Sustainability Grade</strong></div>
                                    <div>{selectedAnalysis.sustainability_grade}</div>

                                    <div><strong>ESG Rating</strong></div>
                                    <div>{selectedAnalysis.esg_rating}</div>

                                    <div><strong>Industry Percentile</strong></div>
                                    <div>{selectedAnalysis.industry_percentile}%</div>

                                    <div><strong>Performance</strong></div>
                                    <div>{selectedAnalysis.performance}</div>

                                    <div><strong>Improvement Suggestions</strong></div>
                                    <div>{selectedAnalysis.improvement_suggestions}</div>

                                </div>

                            </div>

</div>

                        </div>

                    </div>

                </div>

            )}

            <Footer />
        </>
    );
}

export default AnalysisHistory;