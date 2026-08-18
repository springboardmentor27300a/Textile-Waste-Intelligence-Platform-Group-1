import {
    FaCheckCircle
} from "react-icons/fa";

import ConfidenceBar from "./ConfidenceBar";

import "./ResultCard.css";

function ResultCard({

    title,

    value,

    confidence,

    icon: Icon

}) {

    return (

        <div className="result-card">

            <h3>

                <Icon />

                {title}

            </h3>

            {/* Main Result */}

            <div className="result-main">

                <div className="result-circle">

                    <Icon />

                </div>

                <div>

                    <h2>

                        {value}

                    </h2>

                    <p>

                        AI Detection Result

                    </p>

                </div>

            </div>

            {/* Confidence */}

            {confidence !== undefined && (

                <div className="confidence-card">

                    <div className="confidence-text">

                        <span>

                            Confidence Score

                        </span>

                        <strong>

                            {(confidence * 100).toFixed(1)}%

                        </strong>

                    </div>

                    <ConfidenceBar confidence={confidence} />

                </div>

            )}

            {/* Status */}

            <div className="result-status">

                <FaCheckCircle />

                Successfully classified by AI model

            </div>

        </div>

    );

}

export default ResultCard;