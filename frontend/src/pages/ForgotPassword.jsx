import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

import "./ForgotPassword.css";

function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            await API.post(
                "/auth/forgot-password",
                {
                    email
                }
            );

            // Navigate to Reset Password page
            navigate("/reset-password", {
                state: {
                    email
                }
            });

        } catch (err) {

            if (err.response) {

                setError(err.response.data.detail);

            } else {

                setError("Something went wrong.");

            }

        }

    };

    return (

        <div className="forgot-container">

            <div className="forgot-card">

                <h2>Forgot Password</h2>

                <p>
                    Enter your registered email address.
                </p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Verify Email
                    </button>

                </form>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                <Link
                    to="/login"
                    className="back-login-btn"
                >
                    Back to Login
                </Link>

            </div>

        </div>

    );

}

export default ForgotPassword;