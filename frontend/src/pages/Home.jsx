import { Link } from "react-router-dom";
import {
    FaRecycle,
    FaChartLine,
    FaBoxes,
    FaLeaf
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./Home.css";

function Home() {

    return (
        <>
            <Navbar />

            <section className="hero">

                <div className="hero-left">

                    <h1>
                        Textile Waste Intelligence Platform
                    </h1>

                    <p>

                        Empowering sustainable textile waste management through
                        Artificial Intelligence, Computer Vision, and Data
                        Analytics to improve recycling efficiency, inventory
                        management, and environmental sustainability.

                    </p>

                    <div className="hero-buttons">

                        <Link to="/login">

                            <button className="login-btn">
                                Login
                            </button>

                        </Link>

                        <Link to="/register">

                            <button className="register-btn">
                                Register
                            </button>

                        </Link>

                    </div>

                </div>

                <div className="hero-right">

                    <div className="hero-card">

                        <FaRecycle className="hero-icon"/>

                        <h2>Sustainable Future</h2>

                        <p>
                            Manage textile waste efficiently with modern
                            technology.
                        </p>

                    </div>

                </div>

            </section>

            {/* FEATURES */}

            <section className="features">

                <h2>Platform Features</h2>

                <div className="feature-grid">

                    <div className="feature-card">

                        <FaBoxes className="feature-icon"/>

                        <h3>Inventory Management</h3>

                        <p>

                            Track textile waste batches with complete inventory
                            management.

                        </p>

                    </div>

                    <div className="feature-card">

                        <FaChartLine className="feature-icon"/>

                        <h3>Analytics Dashboard</h3>

                        <p>

                            Monitor textile inventory using interactive
                            statistics and reports.

                        </p>

                    </div>

                    <div className="feature-card">

                        <FaLeaf className="feature-icon"/>

                        <h3>Sustainability</h3>

                        <p>

                            Support eco-friendly recycling and sustainable
                            textile waste management.

                        </p>

                    </div>

                </div>

            </section>

            {/* ABOUT */}

            <section className="about-section">

                <h2>About the Platform</h2>

                <p>

                    The Textile Waste Intelligence Platform is designed to
                    improve the management of textile waste by integrating
                    inventory tracking, analytics, and future-ready AI
                    capabilities. The platform helps organizations monitor
                    textile waste efficiently while supporting sustainability
                    initiatives.

                </p>

            </section>

            {/* PLATFORM HIGHLIGHTS */}

            <section className="stats-section">

                <div className="stat-box">

                    <h2>4</h2>

                    <p>User Roles</p>

                </div>

                <div className="stat-box">

                    <h2>10</h2>

                    <p>Fashion-MNIST Classes</p>

                </div>

                <div className="stat-box">

                    <h2>JWT</h2>

                    <p>Secure Authentication</p>

                </div>

                <div className="stat-box">

                    <h2>OAuth</h2>

                    <p>Google Sign-In</p>

                </div>

            </section>

            <Footer />

        </>
    );

}

export default Home;