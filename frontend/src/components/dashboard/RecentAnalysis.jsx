import { FaEye, FaFilePdf, FaFileCsv } from "react-icons/fa";
import "./RecentAnalysis.css";

function RecentAnalysis({
    history,
    onView,
    onPdf,
    onCsv
}) {

    return (
        <div className="analysis-card">

            <div className="analysis-header">
                <h2>Analysis History</h2>
            </div>

            <table className="analysis-table">

                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Material</th>
                        <th>Damage</th>
                        <th>Quality</th>
                        <th>Recommendation</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>

                    {history.length === 0 ? (

                        <tr>
                            <td colSpan="7">
                                No AI Analysis Available
                            </td>
                        </tr>

                    ) : (

                        history.map((item) => (

                            <tr key={item.id}>

                                <td>{item.image_name}</td>

                                <td>
                                    <span className="badge blue">
                                        <span>{item.material}</span>
                                    </span>
                                </td>

                                <td>
                                    <span
                                        className={`badge ${
                                            item.damage === "Clean"
                                                ? "green"
                                                : "red"
                                        }`}
                                    >
                                        <span>{item.damage}</span>
                                    </span>
                                </td>

                                <td>
                                    <span className="badge orange">
                                        <span>{item.quality_grade}</span>
                                    </span>
                                </td>

                                <td>
                                    <span className="badge purple">
                                        <span>{item.recommended_action}</span>
                                    </span>
                                </td>

                                <td>
                                    {new Date(item.analyzed_at).toLocaleDateString()}
                                </td>

                                <td>

                                    <div className="action-buttons">

                                        <button
                                            className="view-btn"
                                            onClick={() => onView(item)}
                                            title="View Details"
                                        >
                                            <FaEye />
                                            <span>View</span>
                                        </button>

                                        <button
                                            className="pdf-btn"
                                            onClick={() => onPdf(item)}
                                            title="Download PDF"
                                        >
                                            <FaFilePdf />
                                            <span>PDF</span>
                                        </button>

                                        <button
                                            className="csv-btn"
                                            onClick={() => onCsv(item)}
                                            title="Export CSV"
                                        >
                                            <FaFileCsv />
                                            <span>CSV</span>
                                        </button>

                                    </div>

                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>

        </div>
    );
}

export default RecentAnalysis;