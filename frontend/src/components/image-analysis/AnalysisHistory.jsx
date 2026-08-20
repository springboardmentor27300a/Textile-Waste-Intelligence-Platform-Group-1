import {
  History,
  Brain,
  Calendar,
  Recycle,
  Leaf,
  ArrowRight,
} from "lucide-react";

function badgeColor(score) {
  if (score >= 90)
    return "bg-green-100 text-green-700";

  if (score >= 75)
    return "bg-blue-100 text-blue-700";

  if (score >= 60)
    return "bg-yellow-100 text-yellow-700";

  return "bg-red-100 text-red-700";
}

function AnalysisHistory({ history = [] }) {

  if (!history.length) {

    return (

      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-card">

        <div className="flex flex-col items-center">

          <History
            size={52}
            className="text-slate-400"
          />

          <h2 className="mt-5 text-2xl font-bold text-heading">

            No Analysis History

          </h2>

          <p className="mt-3 max-w-lg text-center text-muted">

            Your completed AI textile analyses will
            appear here.

          </p>

        </div>

      </div>

    );

  }

  return (

    <div className="rounded-3xl border border-slate-200 bg-white shadow-card">

      <div className="border-b border-slate-100 p-6">

        <div className="flex items-center gap-3">

          <History
            size={26}
            className="text-blue-600"
          />

          <div>

            <h2 className="text-2xl font-bold text-heading">

              Analysis History

            </h2>

            <p className="text-muted">

              Previously analyzed textile images

            </p>

          </div>

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-50">

            <tr>

              <th className="px-6 py-4 text-left">

                Material

              </th>

              <th className="px-6 py-4 text-left">

                Waste

              </th>

              <th className="px-6 py-4 text-left">

                Confidence

              </th>

              <th className="px-6 py-4 text-left">

                Overall

              </th>

              <th className="px-6 py-4 text-left">

                Sustainability

              </th>

              <th className="px-6 py-4 text-left">

                Date

              </th>

            </tr>

          </thead>

          <tbody>

            {history.map((item) => (

              <tr
                key={item.id}
                className="border-t hover:bg-slate-50"
              >

                <td className="px-6 py-5">

                  <div className="flex items-center gap-3">

                    <Brain
                      size={20}
                      className="text-blue-600"
                    />

                    <div>

                      <h4 className="font-semibold">

                        {item.material}

                      </h4>

                      <p className="text-sm text-muted">

                        {item.primary_material}

                      </p>

                    </div>

                  </div>

                </td>

                <td className="px-6 py-5">

                  <div className="flex items-center gap-2">

                    <Recycle
                      size={18}
                      className="text-green-600"
                    />

                    {item.waste_category}

                  </div>

                </td>

                <td className="px-6 py-5">

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${badgeColor(item.confidence)}`}
                  >

                    {item.confidence}%

                  </span>

                </td>

                <td className="px-6 py-5 font-semibold">

                  {item.overall_score}/100

                </td>

                <td className="px-6 py-5">

                  <div className="flex items-center gap-2">

                    <Leaf
                      size={18}
                      className="text-green-600"
                    />

                    {item.sustainability_rating}

                  </div>

                </td>

                <td className="px-6 py-5">

                  <div className="flex items-center gap-2">

                    <Calendar size={16} />

                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="flex items-center justify-between border-t border-slate-100 p-6">

        <p className="text-sm text-muted">

          Showing {history.length} analysis record(s)

        </p>

        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700">

          View All

          <ArrowRight size={18} />

        </button>

      </div>

    </div>

  );

}

export default AnalysisHistory;