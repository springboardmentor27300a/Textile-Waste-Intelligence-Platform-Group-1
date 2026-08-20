import {
  Building2,
  BriefcaseBusiness,
  PhoneCall,
  Building,
} from "lucide-react";

function OrganizationCard({ data, onChange }) {
  const handleInput = (field, value) => {
    onChange("organization", field, value);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}

      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
        <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
          <Building2 size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-heading">
            Organization Information
          </h2>

          <p className="text-sm text-muted">
            Manage your organization details and business information.
          </p>
        </div>
      </div>

      {/* Body */}

      <div className="grid gap-6 p-6 md:grid-cols-2">
        {/* Organization Name */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Organization Name
          </label>

          <div className="relative">
            <Building2
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={data.organization_name}
              onChange={(e) =>
                handleInput(
                  "organization_name",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-primary"
            />
          </div>
        </div>

        {/* Organization Type */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Organization Type
          </label>

          <div className="relative">
            <Building
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={data.organization_type}
              onChange={(e) =>
                handleInput(
                  "organization_type",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-primary"
            >
              <option value="">
                Select Organization Type
              </option>

              <option value="Private">
                Private
              </option>

              <option value="Public">
                Public
              </option>

              <option value="Government">
                Government
              </option>

              <option value="NGO">
                NGO
              </option>
            </select>
          </div>
        </div>

        {/* Business Category */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Business Category
          </label>

          <div className="relative">
            <BriefcaseBusiness
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={data.business_category}
              onChange={(e) =>
                handleInput(
                  "business_category",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-primary"
            >
              <option value="">
                Select Business Category
              </option>

              <option value="apparel">
                Apparel Manufacturing
              </option>

              <option value="garments">
                Garment Production
              </option>

              <option value="recycling">
                Textile Recycling
              </option>

              <option value="fashion">
                Fashion & Retail
              </option>

              <option value="research">
                Research & Innovation
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>
        </div>

        {/* Organization Contact */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Organization Contact
          </label>

          <div className="relative">
            <PhoneCall
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={data.organization_contact}
              onChange={(e) =>
                handleInput(
                  "organization_contact",
                  e.target.value
                )
              }
              placeholder="+94 XX XXX XXXX"
              className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationCard;