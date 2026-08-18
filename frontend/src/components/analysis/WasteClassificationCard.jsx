import "./WasteClassificationCard.css";

import {
    FaRecycle,
    FaLeaf,
    FaCheckCircle,
    FaExclamationTriangle
} from "react-icons/fa";

function WasteClassificationCard({ waste }) {

    if (!waste) return null;

    return (

        <div className="waste-card">

            <h3>
                <FaRecycle />
                Textile Waste Classification
            </h3>

            {/* Main Result */}

            <div className="waste-main">

                <div className="waste-circle">

                    <FaRecycle />

                </div>

                <div>

                    <h2>{waste.category}</h2>

                    <p>Identified Waste Category</p>

                </div>

            </div>

            {/* Metric Cards */}

            <div className="waste-grid">

                <div className="waste-item">
                    <span>Recyclability</span>
                    <strong>{waste.recyclability}</strong>
                </div>

                <div className="waste-item">
                    <span>Reuse Potential</span>
                    <strong>{waste.reuse_potential}</strong>
                </div>

                <div className="waste-item">
                    <span>Contamination</span>
                    <strong>{waste.contamination_detection}</strong>
                </div>

                <div className="waste-item">
                    <span>Disposal</span>
                    <strong>{waste.disposal_recommendation}</strong>
                </div>

            </div>

            {/* Status */}

            <div className="waste-status">

                <div className="status-box">

                    <FaLeaf className="status-icon green" />

                    <div>

                        <span>Compostable</span>

                        <strong>
                            {waste.compostable ? "Yes" : "No"}
                        </strong>

                    </div>

                </div>

                <div className="status-box">

                    {waste.hazardous_textile ? (
                        <FaExclamationTriangle className="status-icon red" />
                    ) : (
                        <FaCheckCircle className="status-icon green" />
                    )}

                    <div>

                        <span>Hazardous Textile</span>

                        <strong>
                            {waste.hazardous_textile ? "Yes" : "No"}
                        </strong>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default WasteClassificationCard;