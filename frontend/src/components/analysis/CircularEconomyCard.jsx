import "./CircularEconomyCard.css";
import { FaRecycle } from "react-icons/fa";

function CircularEconomyCard({ data }) {

    if (!data) return null;

    return (

        <div className="circular-card">

            <h3>
                <FaRecycle />
                Circular Economy Analytics
            </h3>

            <div className="circular-grid">

                <div className="metric-card">
                    <span>Recycling Efficiency</span>
                    <strong>{data.recycling_efficiency}%</strong>
                </div>

                <div className="metric-card">
                    <span>Waste Diversion Rate</span>
                    <strong>{data.waste_diversion_rate}%</strong>
                </div>

                <div className="metric-card">
                    <span>Resource Recovery Rate</span>
                    <strong>{data.resource_recovery_rate}%</strong>
                </div>

                <div className="metric-card">
                    <span>Circular Economy Index</span>
                    <strong>{data.circular_economy_index}</strong>
                </div>

                <div className="metric-card">
                    <span>Overall Rating</span>
                    <strong>{data.rating}</strong>
                </div>

            </div>

        </div>

    );

}

export default CircularEconomyCard;