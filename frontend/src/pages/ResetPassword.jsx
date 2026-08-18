import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import API from "../services/api";

import "./ResetPassword.css";

function ResetPassword() {

    const location = useLocation();

    const navigate = useNavigate();

    const email = location.state?.email;

    const [newPassword, setNewPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");

        setError("");

        if (!email) {

            setError("Invalid request.");

            return;

        }

        if (newPassword !== confirmPassword) {

            setError("Passwords do not match.");

            return;

        }

        try {

            const response = await API.post(
                "/auth/reset-password",
                {
                    email: email,
                    new_password: newPassword
                }
            );

            setMessage(response.data.message);

            setTimeout(() => {

                navigate("/login", {
                    state: {
                        message: "Password updated successfully. Please login."
                    }
                });

            }, 1500);

        }

        catch (err) {

            if (err.response) {

                setError(err.response.data.detail);

            }

            else {

                setError("Something went wrong.");

            }

        }

    };

    return (

        <div className="reset-container">

            <div className="reset-card">

                <h2>Reset Password</h2>

                <p>{email}</p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) =>
                            setNewPassword(e.target.value)
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        required
                    />

                    <button type="submit">

                        Update Password

                    </button>

                </form>

                {message && (

                    <p className="success">

                        {message}

                    </p>

                )}

                {error && (

                    <p className="error">

                        {error}

                    </p>

                )}

            </div>

        </div>

    );

}

export default ResetPassword;