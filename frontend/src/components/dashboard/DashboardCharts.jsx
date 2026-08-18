import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

import "./DashboardCharts.css";

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

function DashboardCharts({

    materials,

    quality

}) {

    const materialChart = {

        labels: Object.keys(materials),

        datasets: [

            {

                label: "Materials",

                data: Object.values(materials),

                backgroundColor: [

                    "#2563EB",

                    "#16A34A",

                    "#F59E0B",

                    "#EF4444"

                ]

            }

        ]

    };

    const qualityChart = {

        labels: Object.keys(quality),

        datasets: [

            {

                label: "Quality Grades",

                data: Object.values(quality),

                backgroundColor: "#2563EB"

            }

        ]

    };

    return (

        <div className="chart-grid">

            <div className="chart-card">

                <h3>Material Distribution</h3>

                <Pie
    data={materialChart}
    height={220}
    options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom"
            }
        }
    }}
/>

            </div>

            <div className="chart-card">

                <h3>Quality Distribution</h3>

                <Bar
    data={qualityChart}
    height={220}
    options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        }
    }}
/>

            </div>

        </div>

    );

}

export default DashboardCharts;