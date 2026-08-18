import { useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import Hero from "../components/analysis/Hero";
import UploadCard from "../components/analysis/UploadCard";
import ImagePreview from "../components/analysis/ImagePreview";
import ResultCard from "../components/analysis/ResultCard";
import RecommendationCard from "../components/analysis/RecommendationCard";
import QualityCard from "../components/analysis/QualityCard";
import MaterialCard from "../components/analysis/MaterialCard";
import ReportButtons from "../components/analysis/ReportButtons";
import WasteClassificationCard from "../components/analysis/WasteClassificationCard";
import RecyclingCard from "../components/analysis/RecyclingCard";
import MaterialDetailsCard from "../components/analysis/MaterialDetailsCard";
import SustainabilityCard from "../components/analysis/SustainabilityCard";
import EnvironmentalAnalyticsCard from "../components/analysis/EnvironmentalAnalyticsCard";
import WasteScoringCard from "../components/analysis/WasteScoringCard";
import CircularEconomyCard from "../components/analysis/CircularEconomyCard";
import BenchmarkCard from "../components/analysis/BenchmarkCard";

import { generateCSV } from "../utils/csvGenerator";
import { generatePDF } from "../utils/pdfGenerator";

import { FaShieldAlt } from "react-icons/fa";

import { analyzeTextile } from "../services/analysisService";

import "./Analyze.css";

function Analyze() {

    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleAnalyze = async () => {

        if (!selectedImage) {
            setError("Please select an image.");
            return;
        }

        try {

            setLoading(true);
            setError("");
            setResult(null);

            const response = await analyzeTextile(selectedImage);
            console.log(response.data);
            setResult(response.data);

        } catch (err) {

            console.error(err);

            setError("Analysis failed. Please try again.");

        } finally {

            setLoading(false);

        }

    };
    const handleCSVDownload = () => {

    generateCSV(result);

};

const handlePDFDownload = async () => {

    await generatePDF(
        result,
        selectedImage
    );

};

    return (

        <>
            <Navbar />

            <div className="analyze-container">

                <Hero />

                <div className="upload-section">

                    <UploadCard
                        selectedImage={selectedImage}
                        onImageSelect={setSelectedImage}
                        onAnalyze={handleAnalyze}
                        loading={loading}
                    />

                    {selectedImage && (
                        <ImagePreview image={selectedImage} />
                    )}

                </div>

                {error && (
                    <div className="analysis-error">
                        {error}
                    </div>
                )}

                {result && (

                    <div className="analysis-result">

                        <h2 className="result-title">
                            AI Analysis Result
                        </h2>

                        <div className="summary-section">

                            <div className="summary-image">

                                {selectedImage && (
                                    <ImagePreview image={selectedImage} />
                                )}

                            </div>

                            <div className="summary-info">

                                <h3>Analysis Summary</h3>

                                <div className="summary-item">
                                    <span>Material</span>
                                    <strong>{result.material.label}</strong>
                                </div>

                                <div className="summary-item">
                                    <span>Damage</span>
                                    <strong>{result.damage.label}</strong>
                                </div>

                                <div className="summary-item">
                                    <span>Quality Grade</span>
                                    <strong>{result.quality.quality_grade}</strong>
                                </div>

                                <div className="summary-item">
                                    <span>Recommendation</span>
                                    <strong>
                                        {result.recommendation?.recommended_action || "N/A"}
                                    </strong>
                                </div>

                            </div>

                        </div>

                        <hr className="analysis-divider" />

                    <div className="dashboard-grid">

    <MaterialCard
        material={result.material}
    />

    <ResultCard
        title="Damage"
        value={result.damage.label}
        confidence={result.damage.confidence}
        icon={FaShieldAlt}
        color="green"
    />

    <MaterialDetailsCard
        details={result.material_classification}
    />

    <QualityCard
        quality={result.quality}
    />

    <RecommendationCard
        recommendation={result.recommendation}
    />

</div>

<h2 className="advanced-title">
    Advanced AI Insights
</h2>

<p className="advanced-subtitle">
    AI-powered textile waste classification and recycling recommendations, and sustainability analysis.
</p>

<div className="advanced-grid">

    <WasteClassificationCard
        waste={result.waste_classification}
    />

    <RecyclingCard
        recycle={result.recycling_engine}
    />

</div>

<SustainabilityCard
    sustainability={result.sustainability}
/>
<EnvironmentalAnalyticsCard
    environmental={result.environmental_analytics}
/>

<WasteScoringCard
    scoring={result.waste_scoring}
/>

<CircularEconomyCard
    data={result.circular_economy}
/>

<BenchmarkCard
    benchmark={result.benchmark}
/>

<ReportButtons
    onPDF={handlePDFDownload}
    onCSV={handleCSVDownload}
/>
                    </div>

                )}

            </div>

            <Footer />

        </>

    );

}

export default Analyze;