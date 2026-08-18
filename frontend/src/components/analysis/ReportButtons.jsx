import "./ReportButtons.css";

function ReportButtons({ onPDF, onCSV }) {
    return (
        <div className="report-buttons">

            <button
                className="report-btn pdf-btn"
                onClick={onPDF}
            >
                📄 <span>Download PDF</span>
            </button>

            <button
                className="report-btn csv-btn"
                onClick={onCSV}
            >
                📊 <span>Download CSV</span>
            </button>

        </div>
    );
}

export default ReportButtons;