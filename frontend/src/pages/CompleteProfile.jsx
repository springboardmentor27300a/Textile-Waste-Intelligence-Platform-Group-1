import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import API from "../services/api";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./CompleteProfile.css";

function CompleteProfile() {

    const navigate = useNavigate();
    const location = useLocation();

    const googleToken = location.state?.token;
    const googleName = location.state?.full_name;
    const googleEmail = location.state?.email;

    const [formData, setFormData] = useState({
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

            const response = await API.post(
                "/auth/google/register",
                {
                    token: googleToken,
                    role: formData.role,
                    organization: formData.organization
                }
            );

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard");

        } catch (error) {

            console.error(error);

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

            <div className="register-container">

                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >

                    <h2>Complete Your Profile</h2>

                    <input
                        type="text"
                        value={googleName || ""}
                        readOnly
                    />

                    <input
                        type="email"
                        value={googleEmail || ""}
                        readOnly
                    />

                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >

                        <option value="">
                            Select Role
                        </option>

                        <option value="recycling_operator">
                            Recycling Facility Operator
                        </option>

                        <option value="sustainability_manager">
                            Sustainability Manager
                        </option>

                        <option value="manufacturer">
                            Textile Manufacturer
                        </option>

                        <option value="admin">
                            Administrator
                        </option>

                    </select>

                    <input
                        type="text"
                        name="organization"
                        placeholder="Organization"
                        value={formData.organization}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">
                        Complete Registration
                    </button>

                </form>

            </div>

            <Footer />

        </>
    );
}

export default CompleteProfile;