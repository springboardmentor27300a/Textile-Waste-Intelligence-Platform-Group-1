import "./MaterialDetailsCard.css";
import { FaInfoCircle } from "react-icons/fa";

function MaterialDetailsCard({ details }) {

    if (!details) return null;

    return (

        <div className="material-details-card">

            <h3>
                <FaInfoCircle />
                Material Details
            </h3>

            {/* Main */}

            <div className="details-main">

                <div className="details-circle">
                    <FaInfoCircle />
                </div>

                <div>

                    <h2>
                        {details.fabric_type}
                    </h2>

                    <p>
                        Identified Fabric Type
                    </p>

                </div>

            </div>

            {/* Details */}

            <div className="details-grid">

                <div className="detail-card">

                    <span>Category</span>

                    <strong>{details.material_category}</strong>

                </div>

                <div className="detail-card">

                    <span>Fiber Composition</span>

                    <strong>{details.fiber_composition}</strong>

                </div>

                <div className="detail-card">

                    <span>Blend</span>

                    <strong>{details.blend_identification}</strong>

                </div>

                <div className="detail-card">

                    <span>Texture</span>

                    <strong>{details.fabric_texture}</strong>

                </div>

                <div className="detail-card">

                    <span>Pattern</span>

                    <strong>{details.fabric_pattern}</strong>

                </div>

            </div>

        </div>

    );

}

export default MaterialDetailsCard;