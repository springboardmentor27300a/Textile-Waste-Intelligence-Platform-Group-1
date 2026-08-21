/* Chart.js wrappers, themed once here so every page matches. */
import {
  ArcElement, BarElement, CategoryScale, Chart, Filler, Legend, LineElement,
  LinearScale, PointElement, RadialLinearScale, Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line, PolarArea } from "react-chartjs-2";

Chart.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LineElement,
  LinearScale, PointElement, RadialLinearScale, Tooltip);

Chart.defaults.color = "#8A9BB4";
Chart.defaults.font.family = "Inter, system-ui, sans-serif";
Chart.defaults.font.size = 11;

// Green-family ramp with cool neutrals. Red is reserved for hazards and errors,
// so it never appears as a category colour — a material shaded red reads as an
// alert it isn't.
export const PALETTE = ["#10B981", "#5EEAD4", "#34D399", "#60A5FA", "#0E9F6E",
                        "#A7F3D0", "#7C9CBF", "#3F6212"];

const grid = { color: "rgba(34,48,74,0.75)", drawTicks: false };
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0B1220", borderColor: "#22304A", borderWidth: 1,
      titleColor: "#E8EEF7", bodyColor: "#C7D3E5", padding: 10, displayColors: true,
    },
  },
};

export function Frame({ title, subtitle, right, height = 260, children }) {
  return (
    <section className="card p-5">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-[15px] font-bold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {right}
      </header>
      <div style={{ height }}>{children}</div>
    </section>
  );
}

export function BarChart({ labels, datasets, stacked = false, horizontal = false }) {
  return (
    <Bar
      data={{
        labels,
        datasets: datasets.map((d, i) => ({
          borderRadius: 6, borderSkipped: false, barPercentage: 0.72, categoryPercentage: 0.7,
          backgroundColor: d.color || PALETTE[i % PALETTE.length], ...d,
        })),
      }}
      options={{
        ...baseOptions,
        indexAxis: horizontal ? "y" : "x",
        plugins: { ...baseOptions.plugins, legend: { display: datasets.length > 1, position: "bottom" } },
        scales: {
          x: { stacked, grid: horizontal ? grid : { display: false }, border: { display: false } },
          y: { stacked, grid: horizontal ? { display: false } : grid, border: { display: false },
               beginAtZero: true },
        },
      }}
    />
  );
}

export function LineChart({ labels, datasets }) {
  return (
    <Line
      data={{
        labels,
        datasets: datasets.map((d, i) => {
          const colour = d.color || PALETTE[i % PALETTE.length];
          return {
            tension: 0.35, borderWidth: 2, pointRadius: 3, pointHoverRadius: 5,
            borderColor: colour, backgroundColor: `${colour}22`, pointBackgroundColor: colour,
            fill: true, ...d,
          };
        }),
      }}
      options={{
        ...baseOptions,
        interaction: { mode: "index", intersect: false },
        plugins: { ...baseOptions.plugins, legend: { display: datasets.length > 1, position: "bottom" } },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: { grid, border: { display: false }, beginAtZero: true },
        },
      }}
    />
  );
}

export function DoughnutChart({ labels, values, cutout = "68%" }) {
  return (
    <Doughnut
      data={{
        labels,
        datasets: [{
          data: values, backgroundColor: PALETTE, borderColor: "#141F33", borderWidth: 2,
          hoverOffset: 6,
        }],
      }}
      options={{
        ...baseOptions, cutout,
        plugins: {
          ...baseOptions.plugins,
          legend: { display: true, position: "right", labels: { boxWidth: 10, boxHeight: 10, padding: 12 } },
        },
      }}
    />
  );
}

export function PolarChart({ labels, values }) {
  return (
    <PolarArea
      data={{
        labels,
        datasets: [{ data: values, backgroundColor: PALETTE.map((c) => `${c}CC`), borderWidth: 0 }],
      }}
      options={{
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: { display: true, position: "right", labels: { boxWidth: 10, boxHeight: 10, padding: 10 } },
        },
        scales: {
          r: { grid: { color: "rgba(34,48,74,0.8)" }, angleLines: { color: "rgba(34,48,74,0.8)" },
               ticks: { display: false } },
        },
      }}
    />
  );
}

export function ScoreBar({ label, value, weight }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm">{label}</span>
        <span className="font-mono text-xs tnum text-muted">
          {value.toFixed(0)}{weight ? ` · ${Math.round(weight * 100)}%` : ""}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-panel-2">
        <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
