import "./RecyclingCard.css";

import {
    FaRecycle,
    FaCheckCircle,
    FaLightbulb
} from "react-icons/fa";

function RecyclingCard({ recycle }) {

    if (!recycle) return null;

    return (

        <div className="recycling-card">

            <h3>
                <FaRecycle />
                Recycling Recommendation Engine
            </h3>

            {/* Hero Section */}

            <div className="recycling-hero">

                        <div className="hero-icon">
                            <FaRecycle />
                        </div>

                        <div className="hero-content">
                            <h2>{recycle.recommended_method}</h2>
                            <p>Recommended Recycling Method</p>
                        </div>

                    </div>

            {/* Metrics */}

            <div className="recycling-grid">

                <div className="recycling-item">
                    <span>Fiber Recycling</span>
                    <strong>{recycle.fiber_recycling}</strong>
                </div>

                <div className="recycling-item">
                    <span>Mechanical</span>
                    <strong>{recycle.mechanical_recycling}</strong>
                </div>

                <div className="recycling-item">
                    <span>Chemical</span>
                    <strong>{recycle.chemical_recycling}</strong>
                </div>

                <div className="recycling-item">
                    <span>Fabric Reuse</span>
                    <strong>{recycle.fabric_reuse}</strong>
                </div>

                <div className="recycling-item">
                    <span>Industrial Recovery</span>
                    <strong>{recycle.industrial_recovery}</strong>
                </div>

                <div className="recycling-item">
                    <span>Donation</span>
                    <strong>{recycle.donation}</strong>
                </div>

            </div>

            {/* Waste Reduction */}

            <div className="strategy-box">

                <h4>Waste Reduction Strategy</h4>

                <p>{recycle.waste_reduction_strategy}</p>

            </div>

            {/* Upcycling */}

            <div className="upcycling-box">

                <h4>
                    <FaLightbulb />
                    Upcycling Suggestions
                </h4>

                <ul>

                    {recycle.upcycling_suggestions.map((item, index) => (

                        <li key={index}>

                            <FaCheckCircle className="tick-icon" />

                            {item}

                        </li>

                    ))}

                </ul>

            </div>

        </div>

    );

}

export default RecyclingCard;