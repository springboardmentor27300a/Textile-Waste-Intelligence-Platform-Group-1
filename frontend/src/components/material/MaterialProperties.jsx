import {
  Layers,
  Palette,
  Grid2X2,
  Waves,
  ShieldCheck,
  Percent,
} from "lucide-react";

function Card({ icon: Icon, title, value, color }) {
  return (
    <div className="rounded-2xl border bg-white p-5 transition hover:shadow-card">

      <div className="flex items-center gap-3">

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={22} />
        </div>

        <div>

          <p className="text-sm text-muted">
            {title}
          </p>

          <h3 className="mt-1 font-semibold text-heading">
            {value || "Not Available"}
          </h3>

        </div>

      </div>

    </div>
  );
}

function MaterialProperties({ material }) {

  let composition = "Not Available";

  if (material.composition) {
    if (typeof material.composition === "string") {
      composition = material.composition;
    } else if (Array.isArray(material.composition)) {
      composition = material.composition.join(", ");
    } else if (typeof material.composition === "object") {
      composition = Object.entries(material.composition)
        .map(([k, v]) => `${k} ${v}%`)
        .join(", ");
    }
  }

  const cards = [

    {
      title: "Fabric Type",
      value: material.name || "Unknown",
      icon: Layers,
      color: "bg-blue-100 text-blue-700",
    },

    {
      title: "Fiber Composition",
      value: composition,
      icon: Percent,
      color: "bg-purple-100 text-purple-700",
    },

    {
      title: "Material Quality",
      value: material.quality || "Not Available",
      icon: ShieldCheck,
      color: "bg-green-100 text-green-700",
    },

    {
      title: "Detected Color",
      value: material.color || "Not Available",
      icon: Palette,
      color: "bg-pink-100 text-pink-700",
    },

    {
      title: "Pattern",
      value: material.pattern,
      icon: Grid2X2,
      color: "bg-orange-100 text-orange-700",
    },

    {
      title: "Texture",
      value: material.texture,
      icon: Waves,
      color: "bg-cyan-100 text-cyan-700",
    },

  ];

  return (

    <div className="rounded-2xl bg-white p-8 shadow-card">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-heading">
          Material Properties
        </h2>

        <p className="mt-2 text-muted">
          AI-generated material characteristics.
        </p>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {cards.map((item) => (

          <Card
            key={item.title}
            {...item}
          />

        ))}

      </div>

    </div>

  );

}

export default MaterialProperties;