import "./EnvironmentalAnalyticsCard.css";

export default function EnvironmentalAnalyticsCard({
    environmental,
}) {

    if (!environmental) return null;

    const {
        carbon_reduction,
        water_conservation,
        landfill_diversion,
        environmental_impact,
        eco_rating,
        summary,
    } = environmental;

    return (
        <div className="environment-card">

            <h2>🌍 Environmental Analytics</h2>

            <div className="environment-grid">

                <div className="environment-item">
                    <span>🌍 Carbon Reduction</span>
                    <strong>{carbon_reduction} kg CO₂</strong>
                </div>

                <div className="environment-item">
                    <span>💧 Water Conservation</span>
                    <strong>{water_conservation} L</strong>
                </div>

                <div className="environment-item">
                    <span>♻️ Landfill Diversion</span>
                    <strong>{landfill_diversion} kg</strong>
                </div>

                <div className="environment-item">
                    <span>🌱 Environmental Impact</span>
                    <span
                        className={`impact-badge ${environmental_impact.toLowerCase()}`}
                    >
                        {environmental_impact}
                    </span>
                </div>

                <div className="environment-item">
                    <span>🌟 Eco Rating</span>
                    <strong>
                        {"⭐".repeat(eco_rating)}
                        {"☆".repeat(5 - eco_rating)}
                        &nbsp; ({eco_rating}/5)
                        
                    </strong>
                </div>

            </div>

            <div className="environment-summary">
                <h3>Summary</h3>
                <p>
                    By following the recommended recycling method, this textile can save approximately{" "}
                    <strong>{carbon_reduction} kg</strong> of CO₂ emissions,
                    conserve around <strong>{water_conservation} liters</strong> of water,
                    and prevent <strong>{landfill_diversion} kg</strong> of waste from reaching landfills.
                </p>
            </div>

        </div>
    );
}