import { FaLayerGroup, FaCheckCircle } from "react-icons/fa";
import "./MaterialCard.css";

function MaterialCard({ material, details }) {

    if (!material) return null;

    const probabilities = material.probabilities || {};

    return (

        <div className="material-card">

            <div className="material-header">

                <div className="material-title">

                    <FaLayerGroup className="material-icon" />

                    <h3>Material Classification</h3>

                </div>

                <div className="confidence-badge">

                    <FaCheckCircle />

                    {(material.confidence * 100).toFixed(1)}%

                </div>

            </div>

            <div className="material-main">

                <h1 className="material-label">
                    {material.label}
                </h1>

                <p className="material-subtitle">
                    AI Predicted Textile Material
                </p>

            </div>

            {/* Material Probability */}

            <div className="probability-list">

                {Object.entries(probabilities).map(([name, value]) => (

                    <div
                        className="probability-item"
                        key={name}
                    >

                        <div className="probability-title">

                            <span>{name}</span>

                            <span>{(value * 100).toFixed(1)}%</span>

                        </div>

                        <div className="progress">

                            <div
                                className="progress-fill"
                                style={{
                                    width: `${value * 100}%`
                                }}
                            />

                        </div>

                    </div>

                ))}

            </div>

            {/* Material Details */}

            {details && (
                <div className="material-details">

                    <h4>Material Details</h4>

                    <div className="details-grid">

                        <div className="detail-item">
                            <span>Fabric Type</span>
                            <strong>{details.fabric_type}</strong>
                        </div>

                        <div className="detail-item">
                            <span>Category</span>
                            <strong>{details.material_category}</strong>
                        </div>

                        <div className="detail-item">
                            <span>Fiber Composition</span>
                            <strong>{details.fiber_composition}</strong>
                        </div>

                        <div className="detail-item">
                            <span>Blend Identification</span>
                            <strong>{details.blend_identification}</strong>
                        </div>

                        <div className="detail-item">
                            <span>Fabric Texture</span>
                            <strong>{details.fabric_texture}</strong>
                        </div>

                        <div className="detail-item">
                            <span>Fabric Pattern</span>
                            <strong>{details.fabric_pattern}</strong>
                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

export default MaterialCard;