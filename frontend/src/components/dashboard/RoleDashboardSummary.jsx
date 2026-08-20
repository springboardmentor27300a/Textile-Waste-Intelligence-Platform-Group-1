import {
  Leaf,
  Recycle,
  Factory,
  ShieldCheck,
  Package,
  Activity,
  TrendingUp,
  Droplets,
  Zap,
} from "lucide-react";


function number(value) {

  const result =
    Number(value);

  return Number.isFinite(result)
    ? result
    : 0;
}


function percent(value) {

  return `${number(value).toFixed(1)}%`;
}


/* ============================================================
   ADMINISTRATOR
============================================================ */

function AdministratorSummary({
  kpis,
}) {

  return (

    <div className="grid gap-6 lg:grid-cols-3">

      <SummaryCard
        icon={ShieldCheck}
        title="Platform Governance"
        text={`The platform currently contains ${number(
          kpis.total_companies
        ).toLocaleString()} organizations and ${
          number(kpis.active_companies)
        } active organizations.`}
      />

      <SummaryCard
        icon={Activity}
        title="Operational Activity"
        text={`${number(
          kpis.total_collections
        ).toLocaleString()} collections and ${
          number(kpis.total_analysis)
        }.toLocaleString()} AI analysis records are available.`}
      />

      <SummaryCard
        icon={TrendingUp}
        title="Platform Performance"
        text={`Overall performance is ${
          number(kpis.overall_score).toFixed(1)
        }%, with a sustainability score of ${
          number(kpis.sustainability_score).toFixed(1)
        }%.`}
      />

    </div>

  );
}


/* ============================================================
   MANAGER
============================================================ */

function ManagerSummary({
  kpis,
}) {

  return (

    <div className="grid gap-6 lg:grid-cols-3">

      <MetricInsight
        icon={Leaf}
        title="Sustainability"
        value={percent(kpis.sustainability_score)}
        description="Current sustainability performance."
      />

      <MetricInsight
        icon={Recycle}
        title="Circularity"
        value={percent(kpis.circularity_score)}
        description="Circular economy performance."
      />

      <MetricInsight
        icon={ShieldCheck}
        title="ESG"
        value={number(kpis.esg_score).toFixed(1)}
        description="ESG performance score."
      />

      <MetricInsight
        icon={Leaf}
        title="Carbon Saved"
        value={`${number(kpis.carbon_saved).toFixed(2)} kg`}
        description="Estimated carbon savings."
      />

      <MetricInsight
        icon={Droplets}
        title="Water Saved"
        value={`${number(kpis.water_saved).toFixed(2)} L`}
        description="Estimated water savings."
      />

      <MetricInsight
        icon={Zap}
        title="Energy Saved"
        value={`${number(kpis.energy_saved).toFixed(2)} kWh`}
        description="Estimated energy savings."
      />

    </div>

  );
}


/* ============================================================
   MANUFACTURER
============================================================ */

function ManufacturerSummary({
  kpis,
}) {

  return (

    <div className="grid gap-6 lg:grid-cols-3">

      <MetricInsight
        icon={Factory}
        title="Production Waste"
        value={`${number(kpis.total_waste).toFixed(2)} kg`}
        description="Registered textile waste."
      />

      <MetricInsight
        icon={Recycle}
        title="Recyclable Waste"
        value={`${number(kpis.recyclable_weight).toFixed(2)} kg`}
        description="Estimated recyclable material."
      />

      <MetricInsight
        icon={TrendingUp}
        title="Recovery Rate"
        value={percent(kpis.recovery_percentage)}
        description="Current waste recovery rate."
      />

      <MetricInsight
        icon={Package}
        title="Recovery Score"
        value={percent(kpis.recovery_score)}
        description="Material recovery performance."
      />

      <MetricInsight
        icon={Recycle}
        title="Circularity"
        value={percent(kpis.circularity_score)}
        description="Circular economy performance."
      />

      <MetricInsight
        icon={Leaf}
        title="Sustainability"
        value={percent(kpis.sustainability_score)}
        description="Sustainability performance."
      />

    </div>

  );
}


/* ============================================================
   RECYCLER
============================================================ */

function RecyclerSummary({
  kpis,
}) {

  return (

    <div className="grid gap-6 lg:grid-cols-4">

      <MetricInsight
        icon={Package}
        title="Available Waste"
        value={`${number(kpis.total_waste).toFixed(2)} kg`}
        description="Waste available for processing."
      />

      <MetricInsight
        icon={Recycle}
        title="Recyclable Waste"
        value={`${number(kpis.recyclable_weight).toFixed(2)} kg`}
        description="Estimated recyclable material."
      />

      <MetricInsight
        icon={TrendingUp}
        title="Recovery Rate"
        value={percent(kpis.recovery_percentage)}
        description="Current recovery rate."
      />

      <MetricInsight
        icon={Activity}
        title="Recovery Score"
        value={percent(kpis.recovery_score)}
        description="Material recovery score."
      />

    </div>

  );
}


/* ============================================================
   COMPONENT
============================================================ */

function RoleDashboardSummary({
  role,
  kpis = {},
}) {

  if (role === "administrator") {
    return (
      <AdministratorSummary
        kpis={kpis}
      />
    );
  }


  if (role === "manager") {
    return (
      <ManagerSummary
        kpis={kpis}
      />
    );
  }


  if (role === "recycler") {
    return (
      <RecyclerSummary
        kpis={kpis}
      />
    );
  }


  return (
    <ManufacturerSummary
      kpis={kpis}
    />
  );
}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon: Icon,
  title,
  text,
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

        <Icon size={21} />

      </div>

      <h3 className="mt-5 text-lg font-bold text-heading">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted">
        {text}
      </p>

    </div>

  );
}


/* ============================================================
   METRIC CARD
============================================================ */

function MetricInsight({
  icon: Icon,
  title,
  value,
  description,
}) {

  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-muted">
            {title}
          </p>

          <h3 className="mt-3 text-2xl font-bold text-heading">
            {value}
          </h3>

        </div>


        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

          <Icon size={21} />

        </div>

      </div>


      <p className="mt-4 text-xs leading-5 text-muted">
        {description}
      </p>

    </div>

  );
}


export default RoleDashboardSummary;