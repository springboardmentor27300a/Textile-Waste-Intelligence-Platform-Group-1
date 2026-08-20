import {
  Award,
  Building2,
  CheckCircle2,
} from "lucide-react";

import { Card } from "../ui";

function CompanyRankingCard({
  companies = [],
  summary = {},
}) {
  return (
    <Card
      title="Company Sustainability Ranking"
      subtitle="Top performing waste source organizations"
    >
      <div className="mb-8 grid gap-4 md:grid-cols-3">

        <div className="rounded-xl bg-blue-50 p-5">

          <p className="text-sm text-muted">
            Total Companies
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {summary?.total_companies ?? 0}
          </h2>

        </div>

        <div className="rounded-xl bg-green-50 p-5">

          <p className="text-sm text-muted">
            Average Score
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {summary?.average_score ?? 0}
          </h2>

        </div>

        <div className="rounded-xl bg-yellow-50 p-5">

          <p className="text-sm text-muted">
            Best Company
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {summary?.best_company?.organization_name ??
              "-"}
          </h2>

        </div>

      </div>

      <div className="overflow-hidden rounded-xl border">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="px-5 py-4 text-left">
                Rank
              </th>

              <th className="px-5 py-4 text-left">
                Company
              </th>

              <th className="px-5 py-4 text-left">
                Score
              </th>

              <th className="px-5 py-4 text-left">
                Recycling %
              </th>

              <th className="px-5 py-4 text-left">
                Verified
              </th>

            </tr>

          </thead>

          <tbody>

            {companies.length === 0 && (

              <tr>

                <td
                  colSpan={5}
                  className="py-12 text-center text-muted"
                >
                  No companies available.
                </td>

              </tr>

            )}

            {companies.map((company) => (

              <tr
                key={company.company_id}
                className="border-t hover:bg-slate-50"
              >

                <td className="px-5 py-4">

                  <div className="flex items-center gap-2">

                    <Award
                      size={18}
                      className="text-yellow-500"
                    />

                    #{company.rank}

                  </div>

                </td>

                <td className="px-5 py-4">

                  <div className="flex items-center gap-2">

                    <Building2
                      size={18}
                      className="text-blue-600"
                    />

                    {company.organization_name}

                  </div>

                </td>

                <td className="px-5 py-4 font-semibold">

                  {company.sustainability_score}

                </td>

                <td className="px-5 py-4">

                  {company.recycling_rate}%

                </td>

                <td className="px-5 py-4">

                  {company.verified ? (

                    <CheckCircle2
                      className="text-green-600"
                      size={20}
                    />

                  ) : (

                    "-"

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </Card>
  );
}

export default CompanyRankingCard;