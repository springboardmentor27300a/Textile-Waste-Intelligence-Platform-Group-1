import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {

    return (

        <nav className="navbar">

            <div className="logo">

                🧵 TextileAI

            </div>

            <div className="nav-links">

                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive ? "nav-link active-link" : "nav-link"
                    }
                >
                    Home
                </NavLink>

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-link active-link" : "nav-link"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/inventory"
                    className={({ isActive }) =>
                        isActive ? "nav-link active-link" : "nav-link"
                    }
                >
                    Inventory
                </NavLink>

                <NavLink
                    to="/material-recognition"
                    className={({ isActive }) =>
                        isActive ? "nav-link active-link" : "nav-link"
                    }
                >
                    AI Recognition
                </NavLink>

                <NavLink
                    to="/dataset"
                    className={({ isActive }) =>
                        isActive ? "nav-link active-link" : "nav-link"
                    }
                >
                    Dataset
                </NavLink>

                <NavLink
                    to="/login"
                    className={({ isActive }) =>
                        isActive ? "nav-link active-link" : "nav-link"
                    }
                >
                    Login
                </NavLink>

                <NavLink
                    to="/register"
                    className={({ isActive }) =>
                        isActive ? "nav-link active-link" : "nav-link"
                    }
                >
                    Register
                </NavLink>

            </div>

        </nav>

    );

}

export default Navbar;