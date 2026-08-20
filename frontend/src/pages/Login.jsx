import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import "../styles/Login.css";
import API from "../services/api";

function Login() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({

        email: "",
        password: "",

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,
            [e.target.name]: e.target.value,

        });

    };

    const handleLogin = async () => {

        if (!formData.email || !formData.password) {

            toast.warning("Please fill all fields");
            return;

        }

        setLoading(true);

        try {

            const response = await API.post("/login", formData);

            if (response.data.success) {

                toast.success(response.data.message);

                setTimeout(() => {

                    navigate("/dashboard");

                }, 1000);

            }

            else {

                toast.error(response.data.message);

            }

        }

        catch (error) {

            console.log(error);

            toast.error("Login Failed");

        }

        setLoading(false);

    };

    return (

        <>

            <Navbar />

            <div className="login-container">

                <div className="login-card">

                    <h2 className="login-title">
                        Welcome Back 👋
                    </h2>

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

                    <button
                        className="login-btn"
                        onClick={handleLogin}
                        disabled={loading}
                    >

                        {loading ? "Logging In..." : "Login"}

                    </button>

                    <p className="register-text">

                        Don't have an account?{" "}

                        <Link to="/register">

                            Register

                        </Link>

                    </p>

                </div>

            </div>

        </>

    );

}

export default Login;