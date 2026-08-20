import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "../styles/Dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
function Dashboard() {

  const [stats, setStats] = useState({
    users: 0,
    inventory: 0,
    datasets: 0,
    predictions: 0,
    high_recyclable: 0,
    low_impact: 0,
    average_circular_score: 0,
    sustainability_grade: "-",
  });

  const [sustainability, setSustainability] = useState({
    total_predictions: 0,
    average_confidence: 0,
    average_circular_score: 0,
    total_co2_saved: 0,
    total_water_saved: 0,
    high_recyclable: 0,
    low_impact: 0,
  });

  useEffect(() => {
    loadDashboard();
    loadSustainability();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await API.get("/dashboard");
      setStats(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const loadSustainability = async () => {
    try {
      const res = await API.get("/sustainability-dashboard");
      setSustainability(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard">

        <div className="dashboard-title">
          <h1>📊 Sustainability Dashboard</h1>
          <p>
            AI Powered Textile Waste Intelligence Platform
          </p>
        </div>

        <div className="dashboard-cards">

          {/* ================= Dashboard Cards ================= */}

          <div className="dashboard-card">
            <h2>🧵</h2>
            <p>Inventory Items</p>
            <h3>{stats.inventory}</h3>
          </div>

          <div className="dashboard-card">
            <h2>📂</h2>
            <p>Datasets</p>
            <h3>{stats.datasets}</h3>
          </div>

          <div className="dashboard-card">
            <h2>👤</h2>
            <p>Registered Users</p>
            <h3>{stats.users}</h3>
          </div>

          <div className="dashboard-card">
            <h2>📈</h2>
            <p>Total Predictions</p>
            <h3>{stats.predictions}</h3>
          </div>

          <div className="dashboard-card">
            <h2>♻️</h2>
            <p>High Recyclable Materials</p>
            <h3>{stats.high_recyclable}</h3>
          </div>

          <div className="dashboard-card">
            <h2>🌱</h2>
            <p>Low Environmental Impact</p>
            <h3>{stats.low_impact}</h3>
          </div>

          <div className="dashboard-card">

            <h2>🌍</h2>

            <p>Average Circular Score</p>

            <div className="dashboard-progress">

              <div
                className="dashboard-progress-fill"
                style={{
                  width: `${stats.average_circular_score || 0}%`
                }}
              >
                {stats.average_circular_score || 0}%
              </div>

            </div>

            <h2>🏆</h2>

            <p>Sustainability Grade</p>

            <h3>{stats.sustainability_grade}</h3>

          </div>

          <div className="dashboard-card">
            <h2>🗄️</h2>
            <p>Database</p>
            <h3>PostgreSQL</h3>
          </div>

          <div className="dashboard-card">
            <h2>🧠</h2>
            <p>AI Model</p>
            <h3>MobileNetV2</h3>
          </div>

          <div className="dashboard-card">
            <h2>✅</h2>
            <p>System Status</p>
            <h3 className="status-online">Operational</h3>
          </div>

        </div>


        {/* ================= Sustainability Analytics ================= */}

        <div className="analytics-section">

          <h2>🌱 Sustainability Analytics</h2>

          <div className="analytics-cards">

            <div className="analytics-card">
              <h3>🤖 AI Confidence</h3>
              <strong>
                {sustainability.average_confidence}%
              </strong>
              <p>Average prediction confidence</p>
            </div>

            <div className="analytics-card">
              <h3>♻️ Recyclable Materials</h3>
              <strong>
                {sustainability.high_recyclable}
              </strong>
              <p>High recyclability predictions</p>
            </div>

            <div className="analytics-card">
              <h3>🌱 Low Impact</h3>
              <strong>
                {sustainability.low_impact}
              </strong>
              <p>Low environmental impact</p>
            </div>

            <div className="analytics-card">
              <h3>🌍 CO₂ Saved</h3>
              <strong>
                {sustainability.total_co2_saved} kg
              </strong>
              <p>Total estimated CO₂ saving</p>
            </div>

            <div className="analytics-card">
              <h3>💧 Water Saved</h3>
              <strong>
                {sustainability.total_water_saved} L
              </strong>
              <p>Total estimated water saving</p>
            </div>

            <div className="analytics-card">
              <h3>🔄 Circular Score</h3>
              <strong>
                {sustainability.average_circular_score}%
              </strong>
              <p>Average circular economy score</p>
            </div>

          </div>

        </div>


        {/* ================= Sustainability Chart ================= */}

        <div className="analytics-section">

          <h2>📊 Sustainability Overview</h2>

          <div className="chart-container">

            <ResponsiveContainer width="100%" height={350}>

              <BarChart
                data={[
                  {
                    name: "AI Confidence",
                    value: sustainability.average_confidence,
                  },
                  {
                    name: "Circular Score",
                    value: sustainability.average_circular_score,
                  },
                ]}
              >

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis domain={[0, 100]} />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>
    </>
  );
}

export default Dashboard;