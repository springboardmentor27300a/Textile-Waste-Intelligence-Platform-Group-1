import "./WasteScoringCard.css";
import { FaRecycle, FaChartLine } from "react-icons/fa";

function getLevel(score) {

    if (score >= 90)
        return "Excellent";

    if (score >= 75)
        return "High";

    if (score >= 60)
        return "Moderate";

    return "Low";

}
function getDescription(category) {

    switch (category) {

        case "Excellent Recovery Potential":
            return "This textile has excellent recovery and reuse potential.";

        case "High Recovery Potential":
            return "This textile has high recovery potential with minimal processing.";

        case "Moderate Recovery Potential":
            return "This textile can be partially recovered through suitable recycling methods.";

        case "Limited Recovery Potential":
            return "Recovery is possible but may require additional processing.";

        default:
            return "Disposal is recommended after environmental evaluation.";
    }
}

function WasteScoringCard({ scoring }) {

    if (!scoring) return null;

    return (

        <div className="waste-score-card">

            <h3>
                <FaRecycle />
                Waste Scoring Engine
            </h3>

            <div className="score-grid">

    <div className="score-item">
        <span>Recyclability Score</span>
        <strong>{scoring.recyclability_score}%</strong>
        <p className="score-level">

            {getLevel(scoring.recyclability_score)}

        </p>

        <div className="progress">
            <div
                className="progress-fill"
                style={{ width: `${scoring.recyclability_score}%` }}
            />
        </div>
    </div>

    <div className="score-item">
        <span>Reuse Score</span>
        <strong>{scoring.reuse_score}%</strong>
        <p className="score-level">

            {getLevel(scoring.reuse_score)}

        </p>

        <div className="progress">
            <div
                className="progress-fill"
                style={{ width: `${scoring.reuse_score}%` }}
            />
        </div>
    </div>

    <div className="score-item">
        <span>Sustainability Score</span>
        <strong>{scoring.sustainability_score}</strong>
        <p className="score-level">

            {getLevel(scoring.sustainability_score)}

        </p>

        <div className="progress">
            <div
                className="progress-fill"
                style={{ width: `${scoring.sustainability_score}%` }}
            />
        </div>
    </div>

    <div className="score-item">
        <span>Material Recovery</span>
        <strong>{scoring.material_recovery_score}%</strong>
        <p className="score-level">

            {getLevel(scoring.material_recovery_score)}

        </p>

        <div className="progress">
            <div
                className="progress-fill"
                style={{ width: `${scoring.material_recovery_score}%` }}
            />
        </div>
    </div>

    <div className="score-item">
        <span>Processing Feasibility</span>
        <strong>{scoring.processing_feasibility_score}%</strong>
        <p className="score-level">

            {getLevel(scoring.processing_feasibility_score)}

        </p>

        <div className="progress">
            <div
                className="progress-fill"
                style={{ width: `${scoring.processing_feasibility_score}%` }}
            />
        </div>
    </div>

    <div className="score-item">
        <span>Circularity Score</span>
        <strong>{scoring.circularity_score}</strong>
        <p className="score-level">

            {getLevel(scoring.circularity_score)}

        </p>

        <div className="progress">
            <div
                className="progress-fill"
                style={{ width: `${scoring.circularity_score}%` }}
            />
        </div>
    </div>

</div>
            <div className="circularity-box">

    <FaChartLine />

    <div>

        <h4>Circular Economy Status</h4>

        <h3>{scoring.circularity_category}</h3>

        <p>{getDescription(scoring.circularity_category)}</p>

    </div>

</div>

        </div>

    );

}

export default WasteScoringCard;