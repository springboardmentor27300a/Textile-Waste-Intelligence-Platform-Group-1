import {
  Building2,
  ClipboardList,
  BrainCircuit,
  Package,
  Recycle,
  RefreshCw,
  Leaf,
  Globe2,
  Gauge,
  ShieldCheck,
  Factory,
  Droplets,
  Zap,
  Trash2,
} from "lucide-react";


function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


function formatNumber(value, decimals = 0) {
  return safeNumber(value).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }
  );
}


function formatPercent(value) {
  return `${formatNumber(value, 1)}%`;
}


function getCards(role, kpis = {}) {

  /*
   * IMPORTANT:
   * These names match the actual backend KPIService response.
   *
   * Backend:
   * total_companies
   * active_companies
   * sustainability_partners
   * total_collections
   * total_analysis
   * total_inventory
   * total_waste
   * recyclable_weight
   * rejected_weight
   * recovery_percentage
   * carbon_saved
   * water_saved
   * energy_saved
   * average_confidence
   * reuse_score
   * recovery_score
   * circularity_score
   * sustainability_score
   * environmental_score
   * overall_score
   * esg_score
   * landfill_diversion
   * circular_economy_index
   * completion_percentage
   */


  const totalCompanies =
    kpis.total_companies ?? 0;

  const activeCompanies =
    kpis.active_companies ?? 0;

  // const sustainabilityPartners =
  //   kpis.sustainability_partners ?? 0;

  const totalCollections =
    kpis.total_collections ?? 0;

  const totalAnalysis =
    kpis.total_analysis ?? 0;

  const totalInventory =
    kpis.total_inventory ?? 0;

  const totalWaste =
    kpis.total_waste ?? 0;

  const recyclableWeight =
    kpis.recyclable_weight ?? 0;

  const rejectedWeight =
    kpis.rejected_weight ?? 0;

  const recoveryPercentage =
    kpis.recovery_percentage ?? 0;

  const carbonSaved =
    kpis.carbon_saved ?? 0;

  const waterSaved =
    kpis.water_saved ?? 0;

  const energySaved =
    kpis.energy_saved ?? 0;

  const averageConfidence =
    kpis.average_confidence ?? 0;

  // const reuseScore =
  //   kpis.reuse_score ?? 0;

  const recoveryScore =
    kpis.recovery_score ?? 0;

  const circularityScore =
    kpis.circularity_score ?? 0;

  const sustainabilityScore =
    kpis.sustainability_score ?? 0;

  const environmentalScore =
    kpis.environmental_score ?? 0;

  const overallScore =
    kpis.overall_score ?? 0;

  const esgScore =
    kpis.esg_score ?? 0;

  const landfillDiversion =
    kpis.landfill_diversion ?? 0;

  // const circularEconomyIndex =
  //   kpis.circular_economy_index ?? 0;

  const completionPercentage =
    kpis.completion_percentage ?? 0;


  /* ========================================================
     ADMINISTRATOR
  ======================================================== */

  if (role === "administrator") {

    return [

      {
        label: "Organizations",
        value: formatNumber(totalCompanies),
        description: `${formatNumber(activeCompanies)} active`,
        icon: Building2,
      },

      {
        label: "Collections",
        value: formatNumber(totalCollections),
        description: "Registered collections",
        icon: ClipboardList,
      },

      {
        label: "AI Analyses",
        value: formatNumber(totalAnalysis),
        description: `${formatPercent(completionPercentage)} completion`,
        icon: BrainCircuit,
      },

      {
        label: "Inventory",
        value: formatNumber(totalInventory),
        description: "Inventory records",
        icon: Package,
      },

      {
        label: "Total Waste",
        value: `${formatNumber(totalWaste, 2)} kg`,
        description: "Platform waste",
        icon: Trash2,
      },

      {
        label: "Recyclable Waste",
        value: `${formatNumber(recyclableWeight, 2)} kg`,
        description: "Estimated recyclable material",
        icon: Recycle,
      },

      {
        label: "Recovery Rate",
        value: formatPercent(recoveryPercentage),
        description: "Waste recovery",
        icon: RefreshCw,
      },

      {
        label: "Overall Score",
        value: formatPercent(overallScore),
        description: "Overall platform performance",
        icon: Gauge,
      },

    ];
  }


  /* ========================================================
     MANAGER
  ======================================================== */

  if (role === "manager") {

    return [

      {
        label: "Sustainability",
        value: formatPercent(sustainabilityScore),
        description: "Sustainability performance",
        icon: Leaf,
      },

      {
        label: "Environmental",
        value: formatPercent(environmentalScore),
        description: "Environmental performance",
        icon: Globe2,
      },

      {
        label: "ESG Score",
        value: formatNumber(esgScore, 1),
        description: "ESG performance",
        icon: ShieldCheck,
      },

      {
        label: "Circularity",
        value: formatPercent(circularityScore),
        description: "Circular economy score",
        icon: RefreshCw,
      },

      {
        label: "Carbon Saved",
        value: `${formatNumber(carbonSaved, 2)} kg`,
        description: "Estimated CO₂ savings",
        icon: Leaf,
      },

      {
        label: "Water Saved",
        value: `${formatNumber(waterSaved, 2)} L`,
        description: "Estimated water savings",
        icon: Droplets,
      },

      {
        label: "Energy Saved",
        value: `${formatNumber(energySaved, 2)} kWh`,
        description: "Estimated energy savings",
        icon: Zap,
      },

      {
        label: "Landfill Diversion",
        value: formatPercent(landfillDiversion),
        description: "Waste diverted from landfill",
        icon: Recycle,
      },

    ];
  }


  /* ========================================================
     RECYCLER
  ======================================================== */

  if (role === "recycler") {

    return [

      {
        label: "Available Waste",
        value: `${formatNumber(totalWaste, 2)} kg`,
        description: "Waste available for processing",
        icon: Package,
      },

      {
        label: "Recyclable Waste",
        value: `${formatNumber(recyclableWeight, 2)} kg`,
        description: "Estimated recyclable material",
        icon: Recycle,
      },

      {
        label: "Recovery Rate",
        value: formatPercent(recoveryPercentage),
        description: "Current recovery rate",
        icon: RefreshCw,
      },

      {
        label: "Rejected Waste",
        value: `${formatNumber(rejectedWeight, 2)} kg`,
        description: "Rejected material",
        icon: Trash2,
      },

      {
        label: "Recovery Score",
        value: formatPercent(recoveryScore),
        description: "Material recovery score",
        icon: Recycle,
      },

      {
        label: "Circularity",
        value: formatPercent(circularityScore),
        description: "Circular recovery performance",
        icon: RefreshCw,
      },

      {
        label: "AI Confidence",
        value: formatPercent(averageConfidence),
        description: "Average AI confidence",
        icon: BrainCircuit,
      },

      {
        label: "Recycling Activity",
        value: formatNumber(totalAnalysis),
        description: "AI analysis records",
        icon: ClipboardList,
      },

    ];
  }


  /* ========================================================
     MANUFACTURER
  ======================================================== */

  return [

    {
      label: "Production Waste",
      value: `${formatNumber(totalWaste, 2)} kg`,
      description: "Registered textile waste",
      icon: Factory,
    },

    {
      label: "Collections",
      value: formatNumber(totalCollections),
      description: "Waste collections",
      icon: ClipboardList,
    },

    {
      label: "AI Analyses",
      value: formatNumber(totalAnalysis),
      description: "Textile analysis records",
      icon: BrainCircuit,
    },

    {
      label: "Recyclable Waste",
      value: `${formatNumber(recyclableWeight, 2)} kg`,
      description: "Estimated recyclable material",
      icon: Recycle,
    },

    {
      label: "Recovery Rate",
      value: formatPercent(recoveryPercentage),
      description: "Waste recovery rate",
      icon: RefreshCw,
    },

    {
      label: "Recovery Score",
      value: formatPercent(recoveryScore),
      description: "Material recovery performance",
      icon: Package,
    },

    {
      label: "Circularity",
      value: formatPercent(circularityScore),
      description: "Circular economy score",
      icon: RefreshCw,
    },

    {
      label: "Sustainability",
      value: formatPercent(sustainabilityScore),
      description: "Sustainability performance",
      icon: Leaf,
    },

  ];
}


/* ============================================================
   COMPONENT
============================================================ */

function KPIGrid({
  role,
  kpis = {},
}) {

  const cards =
    getCards(
      role,
      kpis
    );


  return (

    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => {

        const Icon =
          card.icon;

        return (

          <div
            key={card.label}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <p className="truncate text-sm font-medium text-muted">
                  {card.label}
                </p>

                <h3 className="mt-3 truncate text-2xl font-bold tracking-tight text-heading">
                  {card.value}
                </h3>

                <p className="mt-2 text-xs text-muted">
                  {card.description}
                </p>

              </div>


              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">

                <Icon size={21} />

              </div>

            </div>

          </div>

        );

      })}

    </div>

  );
}


export default KPIGrid;