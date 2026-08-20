import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../styles/Dashboard.css";
import "../styles/MaterialRecognition.css";

function MaterialRecognition() {

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [report, setReport] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {

        loadPredictionHistory();

    }, []);

    const loadPredictionHistory = async () => {

        try {

            const response = await api.get("/prediction-history");

            setHistory(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };
    const [analysis, setAnalysis] = useState(null);

    const handleFileChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setReport(null);

    };

    const predictFabric = async () => {

        if (!selectedFile) {

            alert("Please select an image.");
            return;

        }

        const formData = new FormData();

        formData.append("file", selectedFile);

        setLoading(true);

        try {

            const response = await api.post("/predict", formData, {

                headers: {
                    "Content-Type": "multipart/form-data",
                },

            });

            const prediction = response.data.prediction;
            setAnalysis(prediction);

            setResult(prediction);

            const reportResponse = await api.get("/report");

            setReport(reportResponse.data);

            await loadPredictionHistory();

        }

        catch (error) {

            console.log(error);

            alert("Prediction Failed");

        }

        setLoading(false);

    };
    const downloadReport = async () => {

        try {

            const response = await api.get("/download-report", {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;
            link.download = "Textile_AI_Report.pdf";

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        }

        catch (error) {

            console.log(error);

            alert("Failed to download report.");

        }

    };

    return (

        <>

            <Navbar />

            <div className="dashboard">

                <h1>🧵 Material Recognition</h1>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <br /><br />

                {preview && (

                    <img
                        src={preview}
                        alt="Preview"
                        className="preview-image"
                    />

                )}

                <br /><br />

                <button
                    className="predict-btn"
                    onClick={predictFabric}
                >
                    🚀 Predict Fabric
                </button>
                <br /><br />

                {result && (

                    <button
                        className="predict-btn"
                        onClick={downloadReport}
                    >
                        📥 Download AI Report
                    </button>

                )}

                {loading && (

                    <div className="loading">

                        🤖 AI is analyzing image...

                    </div>

                )}

                {(result || report) && (

                    <div className="result-container">

                        {result && (

                            <div className="result-card">

                                <h2>🧵 Prediction Result</h2>
                                <hr />

                                <p>
                                    <b>Fiber Composition :</b>

                                    <span className="badge blue">

                                        {analysis?.fiber_composition}

                                    </span>

                                </p>

                                <p>
                                    <b>Reuse Potential :</b>

                                    <span className="badge green">
                                        {analysis?.reuse_potential_score}%
                                    </span>
                                </p>

                                <p>

                                    <b>Texture :</b>

                                    <span className="badge yellow">

                                        {analysis?.texture}

                                    </span>

                                </p>

                                <p>

                                    <b>Pattern :</b>

                                    <span className="badge blue">

                                        {analysis?.pattern}

                                    </span>

                                </p>

                                <p>

                                    <b>Color :</b>

                                    <span className="badge green">

                                        {analysis?.color_type}

                                    </span>

                                </p>

                                <p><b>Fabric</b></p>

                                <h3>{result.fabric}</h3>
                                <p>

                                    <b>AI Confidence Level</b>

                                </p>

                                <div className="progress-bar">

                                    <div
                                        className="progress-fill"
                                        style={{ width: `${result.confidence}%` }}
                                    >

                                        {result.confidence}%

                                    </div>

                                </div>



                                <p>

                                    <b>Category :</b>

                                    <span className="badge blue">

                                        {result.category}

                                    </span>

                                </p>

                                <p>
                                    <b>Recyclability :</b>

                                    <span className="badge green">
                                        {analysis?.recyclability_score}%
                                    </span>
                                </p>

                                <p>

                                    <b>Recommendation :</b>

                                    <span className="badge yellow">

                                        {result.recommendation}

                                    </span>

                                </p>
                                <p>

                                    <b>Damage :</b>

                                    <span className="badge red">

                                        {analysis?.damage}

                                    </span>

                                </p>

                                <p>

                                    <b>Contamination :</b>

                                    <span className="badge yellow">

                                        {analysis?.contamination}

                                    </span>

                                </p>

                            </div>

                        )}

                        {report && (

                            <div className="result-card">

                                <h2>📄 AI Report</h2>

                                <p><b>Project :</b> {report.project}</p>

                                <p><b>Status :</b> <span className="badge green">{report.status}</span></p>

                                <p><b>Model :</b> {report.model}</p>

                                <p>✔ Material Recognition Completed</p>

                                <p>✔ Waste Classification Completed</p>

                                <p>✔ Recyclability Analysis Completed</p>

                                <p><b>Accuracy :</b> {report.accuracy}</p>

                                <p><b>Recommendation :</b></p>

                                <span className="badge yellow">

                                    {report.recommendation}

                                </span>

                            </div>

                        )}

                        {result && (

                            <div className="result-card">

                                <h2>🧠 AI Insights</h2>
                                <hr />
                                <h3>♻ Recycling Recommendation</h3>

                                <p>

                                    <b>Reuse Potential :</b>

                                    <span className="badge green">

                                        {analysis?.reuse_potential}

                                    </span>

                                </p>

                                <p>

                                    <b>Disposal :</b>

                                    <span className="badge red">

                                        {analysis?.disposal}

                                    </span>

                                </p>

                                <p>

                                    <b>Recycling Method :</b>

                                    <span className="badge yellow">

                                        {analysis?.recycling_method}

                                    </span>

                                </p>
                                <hr />

                                <p>
                                    <b>Blend Identification :</b>

                                    <span className="badge blue">
                                        {analysis?.blend_identification}
                                    </span>
                                </p>

                                <p>
                                    <b>Waste Category :</b>

                                    <span className="badge red">
                                        {analysis?.waste_category}
                                    </span>
                                </p>

                                <p><b>Recycling Options :</b></p>

                                <ul>
                                    {analysis?.recycling_options?.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>

                                <p><b>Waste Reduction Tips :</b></p>

                                <ul>
                                    {analysis?.waste_reduction?.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>

                                <hr />

                                <h3>🌱 Sustainability Intelligence</h3>

                                <p>
                                    <b>Environmental Impact :</b>

                                    <span className="badge blue">
                                        {analysis?.environmental_impact_score}%
                                    </span>
                                </p>

                                <p>

                                    <b>CO₂ Saving :</b>

                                    <span className="badge green">

                                        {analysis?.co2_saving}

                                    </span>

                                </p>

                                <p>

                                    <b>Water Saving :</b>

                                    <span className="badge blue">

                                        {analysis?.water_saving}

                                    </span>

                                </p>

                                <p>

                                    <b>Circular Economy Score :</b>

                                </p>

                                <div className="progress-bar">

                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: analysis?.circular_score || "0%"
                                        }}
                                    >

                                        {analysis?.circular_score}

                                    </div>

                                </div>

                                <p>✅ Material Successfully Identified</p>

                                <p>🧵 Fabric Type : <b>{result.fabric}</b></p>

                                <p>♻ Category : <b>{result.category}</b></p>

                                <p>
                                    🌍 Recyclability : <b>{analysis?.recyclability_score}%</b>
                                </p>



                                <hr />

                                <p>

                                    📈 AI Confidence Score :

                                    <b> {result.confidence}%</b>

                                </p>

                                <p>
                                    🌱 Environmental Impact :

                                    <span className="badge blue">
                                        {analysis?.environmental_impact_score}%
                                    </span>
                                </p>
                                <hr />

                                <h3>✅ Sustainability Summary</h3>

                                <p>
                                    ✔ Material Classification Completed
                                </p>

                                <p>
                                    ✔ Waste Classification Completed
                                </p>

                                <p>
                                    ✔ Sustainability Assessment Completed
                                </p>

                                <p>
                                    ✔ Recycling Recommendation Generated
                                </p>

                                <p>
                                    ✔ Circular Economy Analytics Generated
                                </p>


                            </div>

                        )}

                    </div>

                )}

                {history.length > 0 && (

                    <div className="history-card">

                        <h2>📜 Prediction History</h2>

                        <table>

                            <thead>

                                <tr>

                                    <th>Time</th>
                                    <th>Fabric</th>
                                    <th>Confidence</th>
                                    <th>Category</th>
                                    <th>Recyclability</th>
                                    <th>Impact</th>
                                    <th>CO₂ Saved</th>
                                    <th>Water Saved</th>
                                    <th>Circular Score</th>

                                </tr>

                            </thead>

                            <tbody>

                                {history.map((item, index) => (

                                    <tr key={index}>

                                        <td>{item.created_at}</td>

                                        <td>{item.fabric}</td>

                                        <td>
                                            <span className="badge blue">
                                                {item.confidence}%
                                            </span>
                                        </td>

                                        <td>{item.category}</td>

                                        <td>
                                            <span className="badge green">
                                                {item.recyclability}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="badge blue">
                                                {item.environmental_impact}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="badge green">
                                                {item.co2_saving}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="badge blue">
                                                {item.water_saving}
                                            </span>
                                        </td>

                                        <td>
                                            <span className="badge yellow">
                                                {item.circular_score}
                                            </span>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </>

    );

}

export default MaterialRecognition;