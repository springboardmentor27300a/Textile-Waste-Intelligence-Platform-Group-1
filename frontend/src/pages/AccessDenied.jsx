import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./AccessDenied.css";

function AccessDenied() {

    const navigate = useNavigate();

    return (
        <>
            <Navbar />

            <div className="access-denied-page">

                <div className="access-denied-card">

                    <div className="access-denied-icon">
                        <FaShieldAlt />
                    </div>

                    <h1>Access Denied</h1>

                    <h2>You don't have permission to access this dashboard.</h2>

                    <p>
                        This dashboard is restricted to authorized users
                        based on their assigned role.
                    </p>

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="access-denied-button"
                    >
                        <FaArrowLeft />
                        Back to My Dashboard
                    </button>

                </div>

            </div>

            <Footer />
        </>
    );
}

export default AccessDenied;