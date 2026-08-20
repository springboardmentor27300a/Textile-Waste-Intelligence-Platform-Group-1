import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import FeatureCard from "../components/FeatureCard";
import "../styles/Home.css";
import { useEffect, useState } from "react";
import API from "../services/api";

function Home() {

    const [message, setMessage] = useState("");

    useEffect(() => {

        API.get("/")
            .then((response) => {

                setMessage(response.data.message);

            })
            .catch((error) => {

                console.log(error);

            });

    }, []);

    return (

        <>

            <Navbar />

            <div className="hero">

                <div className="hero-content">

                    <h1 className="hero-title">
                        🧵 Textile Waste Intelligence Platform
                    </h1>

                    <p className="backend-status">
                        {message}
                    </p>

                    <h2 className="hero-subtitle">
                        AI Powered Sustainable Textile Waste Management
                    </h2>

                    <p className="hero-description">

                        A modern Artificial Intelligence platform that helps
                        classify textile materials, analyze recyclability,
                        manage inventory, organize datasets and promote
                        sustainable waste management.

                    </p>

                    <div className="hero-buttons">

                        <Link to="/login">
                            <button className="hero-btn">
                                Login
                            </button>
                        </Link>

                        <Link to="/register">
                            <button className="hero-btn secondary-btn">
                                Register
                            </button>
                        </Link>

                    </div>

                </div>

            </div>

            <section className="stats-section">

                <div className="stat-card">
                    <h2>11+</h2>
                    <p>Fabric Classes</p>
                </div>

                <div className="stat-card">
                    <h2>14K+</h2>
                    <p>Training Images</p>
                </div>

                <div className="stat-card">
                    <h2>100%</h2>
                    <p>Recognition Accuracy*</p>
                </div>

                <div className="stat-card">
                    <h2>AI</h2>
                    <p>MobileNetV2 Model</p>
                </div>

            </section>

            <section className="features-section">

                <h2 className="section-title">
                    Platform Features
                </h2>

                <div className="features">

                    <FeatureCard
                        icon="🧵"
                        title="Fabric Classification"
                        description="Recognize textile materials using AI-powered MobileNetV2."
                    />

                    <FeatureCard
                        icon="♻️"
                        title="Waste Classification"
                        description="Categorize textile waste and identify recyclable materials."
                    />

                    <FeatureCard
                        icon="📂"
                        title="Dataset Management"
                        description="Upload, organize and maintain textile datasets."
                    />

                    <FeatureCard
                        icon="📦"
                        title="Inventory Management"
                        description="Track textile inventory and manage waste efficiently."
                    />

                </div>

            </section>

            <section className="about-section">

                <h2>
                    🌍 Why This Project?
                </h2>

                <p>

                    Textile waste has become one of the world's fastest
                    growing environmental challenges.

                    Our AI platform helps industries and organizations
                    automatically identify fabric materials and recommend
                    sustainable recycling methods, reducing waste and
                    supporting a circular economy.

                </p>

            </section>

            <section className="technology-section">

                <h2>
                    ⚙ Technologies Used
                </h2>

                <div className="tech-grid">

                    <div className="tech-card">⚛ React</div>

                    <div className="tech-card">🚀 FastAPI</div>

                    <div className="tech-card">🐘 PostgreSQL</div>

                    <div className="tech-card">🤖 TensorFlow</div>

                    <div className="tech-card">📊 MobileNetV2</div>

                    <div className="tech-card">🐍 Python</div>

                </div>

            </section>

            <footer className="footer">

                <h3>
                    Textile Waste Intelligence Platform
                </h3>

                <p>
                    AI Powered • Sustainable • Smart Recycling
                </p>

                <p>
                    Developed for Virtual Internship Project
                </p>

            </footer>

        </>

    );

}

export default Home;