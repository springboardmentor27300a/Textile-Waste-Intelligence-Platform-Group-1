import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import {
    FaRecycle,
    FaShieldAlt,
    FaLeaf,
    FaBoxes
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

import "./Login.css";

function Login() {

    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const navigateByRole = (user) => {

    switch (user?.role) {

        case "recycling_operator":
            navigate("/dashboard/recycling");
            break;

        case "sustainability_manager":
            navigate("/dashboard/sustainability");
            break;

        case "manufacturer":
            navigate("/dashboard/manufacturer");
            break;

        case "admin":
            navigate("/dashboard");
            break;

        default:
            navigate("/dashboard");
    }

};
    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    // ===============================
    // Email Login
    // ===============================

    const handleSubmit = async (e) => {

            e.preventDefault();

            setError("");

            try {

                const response = await API.post(
                    "/auth/login",
                    formData
                );

                localStorage.setItem(
                    "token",
                    response.data.access_token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

                navigateByRole(response.data.user);

            } catch (err) {

                if (err.response) {

                    setError(err.response.data.detail);

                } else {

                    setError("Login Failed.");

                }

            }

        };

    // ===============================
    // Google Login
    // ===============================

    const handleGoogleSuccess = async (credentialResponse) => {

        try {

            const response = await API.post(
                "/auth/google",
                {
                    token: credentialResponse.credential
                }
            );

            if (response.data.new_user) {

                navigate("/complete-profile", {

                    state: {

                        token: credentialResponse.credential,
                        full_name: response.data.full_name,
                        email: response.data.email

                    }

                });

                return;

            }

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigateByRole(response.data.user);

        } catch (error) {

            if (error.response) {

                alert(error.response.data.detail);

            } else {

                alert("Google Login Failed");

            }

        }

    };

    return (

        <>

            <Navbar />

            <div className="login-page">

                {/* LEFT PANEL */}

                <div className="login-left">

                    <div className="brand-card">

                        <h1>

                            Textile Waste
                            <br />
                            Intelligence Platform

                        </h1>

                        <p>

                            Smart management of textile waste through
                            inventory tracking, secure authentication,
                            analytics, and sustainability-driven workflows.

                        </p>

                        <div className="feature-list">

                            <div className="feature-item">

                                <FaBoxes />

                                <span>
                                    Inventory Management
                                </span>

                            </div>

                            <div className="feature-item">

                                <FaRecycle />

                                <span>
                                    Sustainable Waste Tracking
                                </span>

                            </div>

                            <div className="feature-item">

                                <FaShieldAlt />

                                <span>
                                    JWT & Google OAuth Authentication
                                </span>

                            </div>

                            <div className="feature-item">

                                <FaLeaf />

                                <span>
                                    AI Ready Platform
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* RIGHT PANEL */}

                <div className="login-right">

                    <div className="login-form-card">

                        <h2>Welcome Back</h2>

                        <p className="subtitle">

                            Sign in to continue

                        </p>

                        {location.state?.message && (

                            <div className="success-message">

                                {location.state.message}

                            </div>

                        )}

                        <form onSubmit={handleSubmit}>
                            {error && (

                                <div className="login-error">

                                    {error}

                                </div>

                            )}

                            <input

                                type="email"

                                name="email"

                                placeholder="Email Address"

                                value={formData.email}

                                onChange={handleChange}

                                required

                            />

                            <input

                                type="password"

                                name="password"

                                placeholder="Password"

                                value={formData.password}

                                onChange={handleChange}

                                required

                            />
                            

                            <button
                                type="submit"
                                className="login-btn"
                            >

                                Login

                            </button>

                            <div
                                style={{
                                    textAlign: "right",
                                    marginTop: "10px",
                                    marginBottom: "20px"
                                }}
                            >

                                <Link
                                    to="/forgot-password"
                                    style={{
                                        color: "#1565C0",
                                        textDecoration: "none",
                                        fontSize: "14px"
                                    }}
                                >

                                    Forgot Password?

                                </Link>

                            </div>

                        </form>

                        <div className="divider">

                            <span>OR</span>

                        </div>

                        <div className="google-section">

                            <GoogleLogin

                                onSuccess={handleGoogleSuccess}

                                onError={() => {

                                    alert("Google Login Failed");

                                }}

                            />

                        </div>

                        <p className="register-text">

                            Don't have an account?

                            <Link to="/register">

                                Register

                            </Link>

                        </p>

                    </div>

                </div>

            </div>

            <Footer />

        </>

    );

}

export default Login;