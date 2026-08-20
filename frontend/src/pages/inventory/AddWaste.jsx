import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Package, Calendar, Factory, Palette, Weight, FileText } from "lucide-react";

import { Button, Input, Select } from "../../components/ui";
import useInventory from "../../hooks/useInventory";
import useCollections from "../../hooks/useCollections";

const fabricTypes = [
  "Cotton", "Polyester", "Wool", "Silk", "Linen", "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabric",
].map((value) => ({ value, label: value }));

const conditions = ["Excellent", "Good", "Fair", "Poor"].map((value) => ({ value, label: value }));

function AddWaste() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { inventory = [], loading, createInventory, updateInventory, getInventoryById } = useInventory();
  const { collections = [], loading: collectionsLoading } = useCollections();

  const [existingWaste, setExistingWaste] = useState(null);
  const [formData, setFormData] = useState({
    collection_id: "",
    source: "",
    collectionDate: "",
    quantity: "",
    fabric: "",
    color: "",
    condition: "",
    notes: "",
  });
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    let active = true;

    getInventoryById(id)
      .then((data) => {
        if (!active) return;
        setExistingWaste(data);
        setFormData({
          collection_id: data.collection_id ?? "",
          source: data.source || "",
          collectionDate: data.collection_date || "",
          quantity: data.quantity || "",
          fabric: data.fabric || "",
          color: data.color || "",
          condition: data.condition || "",
          notes: data.notes || "",
        });
      })
      .catch((error) => {
        console.error(error);
        if (active) setSaveError("Unable to load this inventory batch.");
      });

    return () => { active = false; };
  }, [id, isEditing, getInventoryById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "collection_id") {
      const selected = collections.find((item) => String(item.id) === String(value));
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          collection_id: value,
          source: selected.waste_source?.organization_name || selected.organization_name || prev.source,
          collectionDate: selected.collection_date || prev.collectionDate,
        }));
      }
    }
  };

  const handleSave = async () => {
    setSaveError("");

    if (!formData.collection_id) {
      setSaveError("Select a collection before saving this waste batch.");
      return;
    }

    if (!formData.source || !formData.collectionDate || !formData.quantity || !formData.fabric || !formData.color || !formData.condition) {
      setSaveError("Please fill in all required fields.");
      return;
    }

    const wasteData = {
      collection_id: Number(formData.collection_id),
      source: formData.source,
      collection_date: formData.collectionDate,
      quantity: Number(formData.quantity),
      fabric: formData.fabric,
      color: formData.color,
      condition: formData.condition,
      notes: formData.notes || null,
    };

    try {
      if (isEditing) await updateInventory(id, wasteData);
      else await createInventory(wasteData);
      navigate("/inventory", { replace: true });
    } catch (error) {
      console.error(error);
      setSaveError(error?.response?.data?.detail || "Failed to save inventory batch.");
    }
  };

  if (loading && isEditing) {
    return <div className="flex justify-center py-20">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-heading">{isEditing ? "Edit Textile Waste" : "Register Textile Waste"}</h1>
          <p className="mt-2 text-muted">{isEditing ? "Update the selected textile waste batch." : "Create a textile waste batch linked to a collection for AI analysis."}</p>
        </div>
        <Link to="/inventory"><Button variant="secondary"><span className="flex items-center gap-2"><ArrowLeft size={18} />Back</span></Button></Link>
      </div>

      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {saveError}
        </div>
      )}

      <div className="grid gap-8">
        <div className="rounded-2xl bg-white p-8 shadow-card">
          <div className="mb-6 flex items-center gap-3"><Package className="text-accent" /><h2 className="text-xl font-semibold text-heading">Batch Information</h2></div>
          <div className="grid gap-6 md:grid-cols-2">
            <Input label="Waste Batch ID" value={isEditing ? existingWaste?.batch_id || "" : `WB-${1000 + inventory.length + 1}`} disabled />

            <div>
              <label className="mb-2 block text-sm font-medium text-heading">Collection <span className="text-red-500">*</span></label>
              <select
                name="collection_id"
                value={formData.collection_id}
                onChange={handleChange}
                disabled={collectionsLoading || isEditing}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-accent focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100"
              >
                <option value="">{collectionsLoading ? "Loading collections..." : "Select Collection"}</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.collection_code || collection.id} — {collection.waste_source?.organization_name || collection.organization_name || `Collection #${collection.id}`}
                  </option>
                ))}
              </select>
            </div>

            <Input label="Waste Source" name="source" value={formData.source} onChange={handleChange} placeholder="Factory / Warehouse" icon={Factory} required />
            <Input label="Collection Date" name="collectionDate" type="date" value={formData.collectionDate} onChange={handleChange} icon={Calendar} required />
            <Input label="Quantity (kg)" name="quantity" type="number" value={formData.quantity} onChange={handleChange} placeholder="Enter quantity" icon={Weight} required />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-card">
          <div className="mb-6 flex items-center gap-3"><Palette className="text-accent" /><h2 className="text-xl font-semibold text-heading">Material Information</h2></div>
          <div className="grid gap-6 md:grid-cols-2">
            <Select label="Fabric Type" name="fabric" value={formData.fabric} onChange={handleChange} options={fabricTypes} required />
            <Input label="Fabric Color" name="color" value={formData.color} onChange={handleChange} placeholder="Blue" required />
            <Select label="Condition" name="condition" value={formData.condition} onChange={handleChange} options={conditions} required />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-card">
          <div className="mb-6 flex items-center gap-3"><FileText className="text-accent" /><h2 className="text-xl font-semibold text-heading">Additional Notes</h2></div>
          <textarea rows={5} name="notes" value={formData.notes} onChange={handleChange} placeholder="Enter additional remarks..." className="w-full rounded-xl border border-gray-300 p-4 outline-none transition focus:border-accent focus:ring-4 focus:ring-blue-100" />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link to="/inventory"><Button variant="secondary">Cancel</Button></Link>
        <Button onClick={handleSave} disabled={loading || collectionsLoading}>
          <span className="flex items-center gap-2"><Save size={18} />{loading ? "Saving..." : isEditing ? "Update Waste Batch" : "Save Waste Batch"}</span>
        </Button>
      </div>
    </div>
  );
}

export default AddWaste;
