import { useNavigate } from "react-router-dom";
import {
    FaChartBar,
    FaFilePdf,
    FaFileCsv,
    FaArrowLeft
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./Reports.css";

function Reports() {

    const navigate = useNavigate();

    return (
        <>
            <Navbar />

            <div className="reports-container">

                <div className="reports-header">

                    <div>
                        <h1>Reports & Analytics</h1>
                        <p>
                            View analysis statistics and export reports.
                        </p>
                    </div>

                    <button
                        className="back-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        <FaArrowLeft />
                        Back to Dashboard
                    </button>

                </div>

                <div className="reports-grid">

                    <div className="report-card">

                        <FaChartBar className="report-icon" />

                        <h3>Analysis Reports</h3>

                        <p>
                            View textile analysis statistics and trends.
                        </p>

                    </div>

                    <div className="report-card">

                        <FaFilePdf className="report-icon pdf" />

                        <h3>Export PDF</h3>

                        <p>
                            Download a professional PDF report.
                        </p>

                        <button>
                            Export PDF
                        </button>

                    </div>

                    <div className="report-card">

                        <FaFileCsv className="report-icon csv" />

                        <h3>Export CSV</h3>

                        <p>
                            Download inventory and analysis data.
                        </p>

                        <button>
                            Export CSV
                        </button>

                    </div>

                </div>

            </div>

            <Footer />
        </>
    );
}

export default Reports;