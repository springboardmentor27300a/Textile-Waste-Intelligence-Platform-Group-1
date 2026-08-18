import {
    FaLeaf,
    FaTint,
    FaTrashRestore,
    FaRecycle,
    FaChartLine,
    FaGlobe
} from "react-icons/fa";

import "./SustainabilityDashboard.css";

function SustainabilityDashboard({ sustainability }) {

    if (!sustainability) return null;

    console.log("Sustainability Data:", sustainability);

    const cards = [
        {
            title: "CO₂ Saved",
            value: `${sustainability.total_co2_saved ?? 0} kg`,
            icon: <FaLeaf />,
            color: "green"
        },
        {
            title: "Water Saved",
            value: `${Number(
                sustainability.total_water_saved ?? 0
            ).toLocaleString()} L`,
            icon: <FaTint />,
            color: "blue"
        },
        {
            title: "Landfill Saved",
            value: `${sustainability.total_landfill_saved ?? 0} kg`,
            icon: <FaTrashRestore />,
            color: "orange"
        },
        {
            title: "Avg Sustainability",
            value: `${sustainability.average_sustainability ?? 0}%`,
            icon: <FaRecycle />,
            color: "emerald"
        },
        {
            title: "Avg Circularity",
            value: `${sustainability.average_circularity ?? 0}%`,
            icon: <FaChartLine />,
            color: "purple"
        },
        {
            title: "Avg Eco Rating",
            value: `${sustainability.average_eco_rating ?? 0}/5`,
            icon: <FaGlobe />,
            color: "teal"
        }
    ];

    return (
        <div className="sustainability-section">

            <h2 className="section-title">
                Sustainability Intelligence
            </h2>

            <div className="sustainability-grid">

                {cards.map((card, index) => (

                    <div
                        key={index}
                        className={`sustainability-card ${card.color}`}
                    >

                        <div className="card-icon">
                            {card.icon}
                        </div>

                        <h4>{card.title}</h4>

                        <h2>{card.value}</h2>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default SustainabilityDashboard;