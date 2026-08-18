import {
    FaAward,
    FaGlobe,
    FaChartLine,
    FaMedal,
    FaLightbulb
} from "react-icons/fa";

import "./BenchmarkCard.css";

function BenchmarkCard({ benchmark }) {

    if (!benchmark) return null;

    return (

        <div className="benchmark-card">

            <h3>
                <FaAward />
                Sustainability Benchmark
            </h3>

            <div className="benchmark-grid">

                <div className="benchmark-item">
                    <span>Overall Score</span>
                    <strong>{benchmark.overall_score}%</strong>
                </div>

                <div className="benchmark-item">
                    <span>Sustainability Grade</span>
                    <strong>{benchmark.sustainability_grade}</strong>
                </div>

                <div className="benchmark-item">
                    <span>ESG Rating</span>
                    <strong>{benchmark.esg_rating}</strong>
                </div>

                <div className="benchmark-item">
                    <span>Industry Percentile</span>
                    <strong>{benchmark.industry_percentile}%</strong>
                </div>

            </div>

            <div className="performance-box">

                <FaChartLine />

                <div>

                    <h4>Performance</h4>

                    <p>{benchmark.performance}</p>

                </div>

            </div>

            <div className="suggestion-box">

                <FaLightbulb />

                <div>

                    <h4>Improvement Suggestions</h4>

                    <ul>

                        {benchmark.improvement_suggestions.map(
                            (item, index) => (

                                <li key={index}>{item}</li>

                            )
                        )}

                    </ul>

                </div>

            </div>

        </div>

    );

}

export default BenchmarkCard;