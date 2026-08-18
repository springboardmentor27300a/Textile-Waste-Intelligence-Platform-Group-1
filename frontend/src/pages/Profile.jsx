import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaUserCircle,
    FaEnvelope,
    FaBuilding,
    FaUserTag,
    FaArrowLeft
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

import "./Profile.css";

function Profile() {

    const navigate = useNavigate();

    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const [user, setUser] = useState(storedUser);

    const [formData, setFormData] = useState({

        full_name: storedUser?.full_name || "",

        organization: storedUser?.organization || ""

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleUpdate = async (e) => {

        e.preventDefault();

        try {

            const token = localStorage.getItem("token");

            const response = await API.put(

                "/profile/update",

                formData,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            localStorage.setItem(

                "user",

                JSON.stringify(response.data.user)

            );

            setUser(response.data.user);

            alert("Profile Updated Successfully");

        }

        catch (error) {

            console.error(error);

            if (error.response) {

                alert(error.response.data.detail);

            }

            else {

                alert("Profile Update Failed");

            }

        }

    };

    return (

        <>

            <Navbar />

            <div className="profile-container">

                <div className="profile-header">

                    <div>

                        <h1>

                            User Profile

                        </h1>

                        <p>

                            View and manage your account information.

                        </p>

                    </div>

                    <button

                        className="dashboard-btn"

                        onClick={() => navigate("/dashboard")}

                    >

                        <FaArrowLeft />

                        Dashboard

                    </button>

                </div>

                <div className="profile-card">

                    <div className="profile-top">

                        <div className="profile-avatar">

                            {user?.full_name
                                ?.charAt(0)
                                .toUpperCase()}

                        </div>

                        <div>

                            <h2>

                                {user?.full_name}

                            </h2>

                            <span>

                                {user?.role}

                            </span>

                        </div>

                    </div>

                    <div className="info-grid">

                        <div className="info-box">

                            <FaUserCircle className="info-icon"/>

                            <div>

                                <label>Full Name</label>

                                <p>

                                    {user?.full_name}

                                </p>

                            </div>

                        </div>

                        <div className="info-box">

                            <FaEnvelope className="info-icon"/>

                            <div>

                                <label>Email</label>

                                <p>

                                    {user?.email}

                                </p>

                            </div>

                        </div>

                        <div className="info-box">

                            <FaUserTag className="info-icon"/>

                            <div>

                                <label>Role</label>

                                <p>

                                    {user?.role}

                                </p>

                            </div>

                        </div>

                        <div className="info-box">

                            <FaBuilding className="info-icon"/>

                            <div>

                                <label>Organization</label>

                                <p>

                                    {user?.organization || "Not Available"}

                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="update-section">

                        <h2>

                            Update Profile

                        </h2>

                        <form onSubmit={handleUpdate}>
                                                        <div className="form-grid">

                                <div className="form-group">

                                    <label>

                                        Full Name

                                    </label>

                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>

                                        Email

                                    </label>

                                    <input
                                        type="email"
                                        value={user?.email}
                                        disabled
                                    />

                                </div>

                                <div className="form-group">

                                    <label>

                                        Role

                                    </label>

                                    <input
                                        type="text"
                                        value={user?.role}
                                        disabled
                                    />

                                </div>

                                <div className="form-group">

                                    <label>

                                        Organization

                                    </label>

                                    <input
                                        type="text"
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                            <div className="profile-buttons">

                                <button
                                    type="submit"
                                    className="update-btn"
                                >

                                    Update Profile

                                </button>

                                <button
                                    type="button"
                                    className="back-btn"
                                    onClick={() => navigate("/dashboard")}
                                >

                                    <FaArrowLeft />

                                    Back to Dashboard

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            </div>

            <Footer />

        </>

    );

}

export default Profile;