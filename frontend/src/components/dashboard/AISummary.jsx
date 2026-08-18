import {
    FaBrain,
    FaRecycle,
    FaCheckCircle,
    FaExclamationTriangle
} from "react-icons/fa";

import SummaryCard from "./SummaryCard";

function AISummary({ summary }) {

    return (

        <>

            <div className="section-title">
                <h2>AI Analysis Overview</h2>
                <p>Real-time textile intelligence insights</p>
            </div>

            <div className="summary-grid">

                <SummaryCard
                    title="Total Analyses"
                    value={summary.total_analyses}
                    icon={FaBrain}
                    color="blue"
                />

                <SummaryCard
                    title="Reusable"
                    value={summary.reusable_items}
                    icon={FaCheckCircle}
                    color="green"
                />

                <SummaryCard
                    title="Recyclable"
                    value={summary.recyclable_items}
                    icon={FaRecycle}
                    color="orange"
                />

                <SummaryCard
                    title="Defective"
                    value={summary.defective_items}
                    icon={FaExclamationTriangle}
                    color="red"
                />

            </div>

        </>

    );

}

export default AISummary;