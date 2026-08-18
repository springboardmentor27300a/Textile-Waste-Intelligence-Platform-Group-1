import {
    FaStar,
    FaAward,
    FaPalette,
    FaSun,
    FaAdjust,
    FaBullseye
} from "react-icons/fa";

import "./QualityCard.css";

function QualityCard({ quality }) {

    if (!quality) return null;

    return (

        <div className="quality-card">

            <h3>
                <FaStar />
                Quality Analysis
            </h3>

            {/* Main Result */}

            <div className="quality-main">

                <div className="quality-circle">

                    {quality.quality_grade}

                </div>

                <div>

                    <h2>
                        {quality.quality_score}/100
                    </h2>

                    <p>
                        Overall Quality Score
                    </p>

                </div>

            </div>

            {/* Metrics */}

            <div className="quality-grid">

                <div className="quality-box">

                    <FaPalette className="metric-icon"/>

                    <span>Dominant Color</span>

                    <strong>{quality.dominant_color}</strong>

                </div>

                <div className="quality-box">

                    <FaSun className="metric-icon"/>

                    <span>Brightness</span>

                    <strong>{Math.round(quality.brightness)}</strong>

                </div>

                <div className="quality-box">

                    <FaAdjust className="metric-icon"/>

                    <span>Contrast</span>

                    <strong>{Math.round(quality.contrast)}</strong>

                </div>

                <div className="quality-box">

                    <FaBullseye className="metric-icon"/>

                    <span>Sharpness</span>

                    <strong>{Math.round(quality.sharpness)}</strong>

                </div>

            </div>

        </div>

    );

}

export default QualityCard;