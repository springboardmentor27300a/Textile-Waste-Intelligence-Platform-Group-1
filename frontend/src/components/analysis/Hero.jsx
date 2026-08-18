import { FaBrain } from "react-icons/fa";

import "./Hero.css";

function Hero() {

    return (

        <div className="analysis-hero">

            <div className="hero-icon">

                <FaBrain />

            </div>

            <h1>AI Textile Waste Analysis</h1>

            <p>

                Analyze textile images using deep learning models to
                identify material type, detect damage, evaluate quality,
                and generate sustainable recycling recommendations.

            </p>

        </div>

    );

}

export default Hero;