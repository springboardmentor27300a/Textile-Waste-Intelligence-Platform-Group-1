import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import "../styles/Login.css";
import API from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({

        name: "",
        email: "",
        password: "",
        confirmPassword: "",

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,
            [e.target.name]: e.target.value,

        });

    };

    const handleRegister = async () => {

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {

            toast.warning("Please fill all fields");
            return;

        }

        if (formData.password !== formData.confirmPassword) {

            toast.error("Passwords do not match");
            return;

        }

        setLoading(true);

        try {

            const response = await API.post("/register", {

                name: formData.name,
                email: formData.email,
                password: formData.password,

            });

            if (response.data.success) {

                toast.success(response.data.message);

                setTimeout(() => {

                    navigate("/login");

                }, 1200);

            }

            else {

                toast.error(response.data.message);

            }

        }

        catch (error) {

            console.log(error);

            toast.error("Registration Failed");

        }

        setLoading(false);

    };

    return (

        <>

            <Navbar />

            <div className="login-container">

                <div className="login-card">

                    <h2 className="login-title">
                        Create Account 🚀
                    </h2>

                    <div className="input-group">

                        <label>Full Name</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="input-group">

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="input-group">

                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="input-group">

                        <label>Confirm Password</label>

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />

                    </div>

                    <button
                        className="login-btn"
                        onClick={handleRegister}
                        disabled={loading}
                    >

                        {loading ? "Creating Account..." : "Register"}

                    </button>

                    <p className="register-text">

                        Already have an account?{" "}

                        <Link to="/login">

                            Login

                        </Link>

                    </p>

                </div>

            </div>

        </>

    );

}

export default Register;