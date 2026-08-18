import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
    FaUser,
    FaBuilding,
    FaUserShield,
    FaLeaf
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

import "./Register.css";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "",
        organization: ""
    });

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await API.post("/auth/register", formData);

            navigate("/login", {
                state: {
                    message: "Registration successful! Please login."
                }
            });

        } catch (error) {

            if (error.response) {

                alert(error.response.data.detail);

            } else {

                alert("Registration Failed");

            }

        }

    };

    return (

        <>

            <Navbar />

            <div className="register-page">

                {/* LEFT PANEL */}

                <div className="register-left">

                    <div className="brand-card">

                        <h1>

                            Join the
                            <br />
                            Textile Waste
                            <br />
                            Intelligence Platform

                        </h1>

                        <p>

                            Create your account and become part of a platform
                            designed to improve textile waste management,
                            sustainability, and intelligent inventory tracking.

                        </p>

                        <div className="feature-list">

                            <div className="feature-item">

                                <FaUser />

                                <span>
                                    Multiple User Roles
                                </span>

                            </div>

                            <div className="feature-item">

                                <FaBuilding />

                                <span>
                                    Organization Based Access
                                </span>

                            </div>

                            <div className="feature-item">

                                <FaUserShield />

                                <span>
                                    Secure JWT Authentication
                                </span>

                            </div>

                            <div className="feature-item">

                                <FaLeaf />

                                <span>
                                    Sustainability Focused Platform
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

                {/* RIGHT PANEL */}

                <div className="register-right">

                    <div className="register-form-card">

                        <h2>Create Account</h2>

                        <p className="subtitle">

                            Register to access the platform

                        </p>

                        <form onSubmit={handleSubmit}>

                            <input

                                type="text"

                                name="full_name"

                                placeholder="Full Name"

                                onChange={handleChange}

                                required

                            />

                            <input

                                type="email"

                                name="email"

                                placeholder="Email Address"

                                onChange={handleChange}

                                required

                            />

                            <input

                                type="password"

                                name="password"

                                placeholder="Password"

                                onChange={handleChange}

                                required

                            />

                            <select
                                name="role"
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Role</option>

                                <option value="recycling_operator">
                                    Recycling Facility Operator
                                </option>

                                <option value="manufacturer">
                                    Textile Manufacturer
                                </option>

                                <option value="sustainability_manager">
                                    Sustainability Manager
                                </option>

                                <option value="admin">
                                    Administrator
                                </option>

                            </select>

                            <input

                                type="text"

                                name="organization"

                                placeholder="Organization"

                                onChange={handleChange}

                            />

                            <button
                                type="submit"
                                className="register-btn"
                            >

                                Create Account

                            </button>

                        </form>

                        <p className="login-text">

                            Already have an account?

                            <Link to="/login">

                                Login

                            </Link>

                        </p>

                    </div>

                </div>

            </div>

            <Footer />

        </>

    );

}

export default Register;