import { FaLeaf, FaArrowRight } from "react-icons/fa";
import "./WelcomeBanner.css";

function WelcomeBanner({ user, today, onAnalyze }) {
    return (
        <div className="welcome-banner">

            <div className="welcome-content">

                <span className="welcome-badge">
                    AI Powered Sustainability Platform
                </span>

                <h1>
                    Welcome back,
                    <span> {user?.full_name || "User"} 👋</span>
                </h1>

                <p>
                    Manage textile waste efficiently using Artificial Intelligence.
                    Analyze materials, detect damage, monitor inventory and
                    generate sustainability recommendations from one dashboard.
                </p>

                <div className="welcome-buttons">

                    <button
                        className="primary-btn"
                        onClick={onAnalyze}
                    >
                        Analyze Textile
                        <FaArrowRight />
                    </button>

                </div>

            </div>

            <div className="welcome-right">

                <div className="welcome-card">

                    <FaLeaf className="leaf-icon"/>

                    <h3>Sustainability Score</h3>

                    <h2>92%</h2>

                    <small>{today}</small>

                </div>

            </div>

        </div>
    );
}

export default WelcomeBanner;