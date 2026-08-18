import "./AnalyzeButton.css";

function AnalyzeButton({ loading, onAnalyze }) {

    return (

        <button
            className="analyze-btn"
            onClick={onAnalyze}
            disabled={loading}
        >

            {loading ? "Analyzing..." : "Analyze Textile"}

        </button>

    );

}

export default AnalyzeButton;