import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { Card } from "../ui";


/* ============================================================
   HELPERS
============================================================ */

function toNumber(value) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


/* ============================================================
   EXTRACT MONTHLY ARRAY
============================================================ */

function getArray(source) {

  if (!Array.isArray(source)) {
    return [];
  }

  return source;
}


/* ============================================================
   CONVERT BACKEND TREND OBJECT
   INTO RECHARTS ROWS
============================================================ */

function normalizeTrends(trends) {

  if (
    !trends ||
    typeof trends !== "object"
  ) {
    return [];
  }


  /*
   * Backend returns:
   *
   * trends = {
   *   collections: [
   *     { month: "January", collections: 10 }
   *   ],
   *
   *   waste: [
   *     { month: "January", waste: 100 }
   *   ],
   *
   *   recycling: [
   *     { month: "January", recycling: 50 }
   *   ],
   *
   *   recovery: [...]
   * }
   */


  const collections =
    getArray(
      trends.collections
    );

  const waste =
    getArray(
      trends.waste
    );

  const carbon =
    getArray(
      trends.carbon
    );

  const water =
    getArray(
      trends.water
    );

  const energy =
    getArray(
      trends.energy
    );

  const recovery =
    getArray(
      trends.recovery
    );

  const sustainability =
    getArray(
      trends.sustainability
    );

  const recycling =
    getArray(
      trends.recycling
    );

  const rejected =
    getArray(
      trends.rejected
    );

  const companyGrowth =
    getArray(
      trends.company_growth
    );


  /*
   * Use the largest available
   * monthly dataset as the base.
   */

  const length =
    Math.max(
      collections.length,
      waste.length,
      carbon.length,
      water.length,
      energy.length,
      recovery.length,
      sustainability.length,
      recycling.length,
      rejected.length,
      companyGrowth.length
    );


  if (length === 0) {
    return [];
  }


  return Array.from(
    {
      length,
    },
    (_, index) => {

      const collection =
        collections[index] || {};

      const wasteItem =
        waste[index] || {};

      const carbonItem =
        carbon[index] || {};

      const waterItem =
        water[index] || {};

      const energyItem =
        energy[index] || {};

      const recoveryItem =
        recovery[index] || {};

      const sustainabilityItem =
        sustainability[index] || {};

      const recyclingItem =
        recycling[index] || {};

      const rejectedItem =
        rejected[index] || {};

      const companyItem =
        companyGrowth[index] || {};


      return {

        month:
          collection.month ??
          wasteItem.month ??
          carbonItem.month ??
          recoveryItem.month ??
          sustainabilityItem.month ??
          recyclingItem.month ??
          rejectedItem.month ??
          companyItem.month ??
          `Month ${index + 1}`,


        collections:
          toNumber(
            collection.collections
          ),


        waste:
          toNumber(
            wasteItem.waste
          ),


        carbon:
          toNumber(
            carbonItem.carbon_saved
          ),


        water:
          toNumber(
            waterItem.water_saved
          ),


        energy:
          toNumber(
            energyItem.energy_saved
          ),


        recovery:
          toNumber(
            recoveryItem.recovery
          ),


        sustainability:
          toNumber(
            sustainabilityItem.sustainability
          ),


        recycling:
          toNumber(
            recyclingItem.recycling
          ),


        rejected:
          toNumber(
            rejectedItem.rejected
          ),


        companies:
          toNumber(
            companyItem.companies
          ),

      };

    }
  );
}


/* ============================================================
   ROLE CONFIGURATION
============================================================ */

function getConfiguration(role) {

  if (role === "administrator") {

    return {

      title:
        "Platform Activity Trends",

      subtitle:
        "Monthly collection, waste and recycling activity across the platform.",

      lines: [

        {
          key: "collections",
          name: "Collections",
          stroke: "#2563EB",
        },

        {
          key: "waste",
          name: "Waste",
          stroke: "#F59E0B",
        },

        {
          key: "recycling",
          name: "Recycling",
          stroke: "#10B981",
        },

      ],

    };

  }


  if (role === "manager") {

    return {

      title:
        "Sustainability & Environmental Trends",

      subtitle:
        "Monthly sustainability, recovery and carbon-saving performance.",

      lines: [

        {
          key: "sustainability",
          name: "Sustainability",
          stroke: "#16A34A",
        },

        {
          key: "recovery",
          name: "Recovery",
          stroke: "#2563EB",
        },

        {
          key: "carbon",
          name: "Carbon Saved",
          stroke: "#8B5CF6",
        },

      ],

    };

  }


  if (role === "recycler") {

    return {

      title:
        "Recycling & Recovery Trends",

      subtitle:
        "Monthly waste, recycling and recovery performance.",

      lines: [

        {
          key: "waste",
          name: "Waste",
          stroke: "#F59E0B",
        },

        {
          key: "recycling",
          name: "Recycling",
          stroke: "#10B981",
        },

        {
          key: "recovery",
          name: "Recovery",
          stroke: "#2563EB",
        },

      ],

    };

  }


  return {

    title:
      "Production Waste & Recovery Trends",

    subtitle:
      "Monthly production waste, recycling and recovery performance.",

    lines: [

      {
        key: "waste",
        name: "Production Waste",
        stroke: "#F59E0B",
      },

      {
        key: "recycling",
        name: "Recycling",
        stroke: "#10B981",
      },

      {
        key: "recovery",
        name: "Recovery",
        stroke: "#2563EB",
      },

    ],

  };
}


/* ============================================================
   COMPONENT
============================================================ */

function MonthlyTrendChart({
  role = "manufacturer",
  trends = {},
}) {

  const configuration =
    getConfiguration(
      role
    );


  const data =
    normalizeTrends(
      trends
    );


  return (

    <Card
      title={
        configuration.title
      }
      subtitle={
        configuration.subtitle
      }
    >

      {data.length === 0 ? (

        <div className="flex h-80 items-center justify-center">

          <div className="text-center">

            <p className="text-sm font-medium text-slate-600">
              No trend data available
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Trend data will appear after collection or analysis records are available.
            </p>

          </div>

        </div>

      ) : (

        <div className="h-80 w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis
                tick={{
                  fontSize: 12,
                }}
              />

              <Tooltip />

              <Legend />

              {configuration.lines.map(
                (line) => (

                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    name={line.name}
                    stroke={line.stroke}
                    strokeWidth={2.5}
                    dot={{
                      r: 3,
                    }}
                    activeDot={{
                      r: 5,
                    }}
                  />

                )
              )}

            </LineChart>

          </ResponsiveContainer>

        </div>

      )}

    </Card>

  );
}


export default MonthlyTrendChart;