import {
    FaRecycle,
    FaLeaf,
    FaCoins,
    FaExclamationCircle,
    FaCheckCircle
} from "react-icons/fa";

import "./RecommendationCard.css";

function RecommendationCard({ recommendation }) {

    if (!recommendation) return null;

    return (

        <div className="recommendation-card">

            <h3>
                <FaRecycle />
                AI Recommendation
            </h3>

            {/* Main Action */}

            <div className="recommendation-main">

                <div className="recommendation-circle">

                    <FaRecycle />

                </div>

                <div>

                    <h2>
                        {recommendation.recommended_action}
                    </h2>

                    <p>
                        Recommended AI Action
                    </p>

                </div>

            </div>

            {/* Metrics */}

            <div className="recommendation-grid">

                <div className="info-box">

                    <FaRecycle className="info-icon blue"/>

                    <span>Recyclability</span>

                    <strong>{recommendation.recyclability}</strong>

                </div>

                <div className="info-box">

                    <FaLeaf className="info-icon green"/>

                    <span>Environmental Impact</span>

                    <strong>{recommendation.environmental_impact}</strong>

                </div>

                <div className="info-box">

                    <FaCoins className="info-icon orange"/>

                    <span>Estimated Value</span>

                    <strong>{recommendation.estimated_value}</strong>

                </div>

                <div className="info-box">

                    <FaExclamationCircle className="info-icon red"/>

                    <span>Priority</span>

                    <strong>{recommendation.priority}</strong>

                </div>

            </div>

            {/* Reason */}

            <div className="reason">

                <h4>

                    <FaCheckCircle />

                    Why this recommendation?

                </h4>

                <p>

                    {recommendation.reason}

                </p>

            </div>

        </div>

    );

}

export default RecommendationCard;