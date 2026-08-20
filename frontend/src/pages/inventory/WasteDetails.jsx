import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ArrowLeft,
    Pencil,
    Brain,
    Package,
    Factory,
    Calendar,
    Weight,
    Palette,
    FileText,
    Image as ImageIcon,
    Archive,
    MapPin,
    Hash,
} from "lucide-react";

import {
    Button,
    Card,
} from "../../components/ui";

import useInventory from "../../hooks/useInventory";

function WasteDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        getInventoryById,
    } = useInventory();

    const [waste, setWaste] = useState(null);
    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const loadWaste = async () => {
            try {
                const data =
                    await getInventoryById(id);

                setWaste(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadWaste();
    }, [id, getInventoryById]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                Loading...
            </div>
        );
    }

    if (!waste) {
        return (
            <div className="rounded-2xl bg-white p-10 text-center shadow-card">

                <h2 className="text-2xl font-bold text-heading">
                    Waste Batch Not Found
                </h2>

                <p className="mt-3 text-muted">
                    The selected textile waste batch
                    does not exist.
                </p>

                <Link
                    to="/inventory"
                    className="mt-6 inline-block"
                >
                    <Button>
                        Back to Inventory
                    </Button>
                </Link>

            </div>
        );
    }

    const conditionColor = {
        Excellent:
            "bg-green-100 text-green-700",
        Good:
            "bg-blue-100 text-blue-700",
        Fair:
            "bg-yellow-100 text-yellow-700",
        Poor:
            "bg-red-100 text-red-700",
    };

    const statusColor = {
        Available:
            "bg-green-100 text-green-700",
        Reserved:
            "bg-yellow-100 text-yellow-700",
        Processed:
            "bg-slate-200 text-slate-700",
    };

    return (
        <div className="space-y-8">

            {/* Header */}

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <Link
                        to="/inventory"
                        className="mb-4 inline-flex items-center gap-2 text-sm text-accent hover:underline"
                    >
                        <ArrowLeft size={18} />

                        Back to Inventory

                    </Link>

                    <h1 className="text-3xl font-bold text-heading">
                        Textile Waste Details
                    </h1>

                    <p className="mt-2 text-muted">

                        Complete information for

                        <span className="ml-2 font-semibold">

                            {waste.batch_id}

                        </span>

                    </p>

                </div>

                <div className="flex gap-3">

                    <Link
                        to={`/inventory/edit/${waste.id}`}
                    >

                        <Button variant="secondary">

                            <div className="flex items-center gap-2">

                                <Pencil size={18} />

                                Edit Waste

                            </div>

                        </Button>

                    </Link>

                    <Button
                        onClick={() =>
                            navigate("/image-analysis", {
                                state: {
                                    waste,
                                    collectionId: waste.collection_id,
                                },
                            })
                        }
                    >

                        <div className="flex items-center gap-2">

                            <Brain size={18} />

                            Analyze Waste

                        </div>

                    </Button>

                </div>

            </div>

            {/* Information */}

            <div className="grid gap-8 lg:grid-cols-2">
                  <Card
                    title="Batch Information"
                    subtitle="General textile waste information."
                >
                    <div className="space-y-5">

                        <InfoRow
                            icon={Package}
                            label="Batch ID"
                            value={waste.batch_id}
                        />

                        <InfoRow
                            icon={Factory}
                            label="Source"
                            value={waste.source}
                        />

                        <InfoRow
                            icon={Weight}
                            label="Quantity"
                            value={`${Number(
                                waste.quantity
                            ).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                            })} kg`}
                        />

                        <InfoRow
                            icon={Calendar}
                            label="Collection Date"
                            value={new Date(
                                waste.collection_date
                            ).toLocaleDateString()}
                        />

                    </div>

                </Card>

                <Card
                    title="Material Information"
                    subtitle="Material composition and condition."
                >

                    <div className="space-y-5">

                        <InfoRow
                            icon={Palette}
                            label="Fabric"
                            value={waste.fabric}
                        />

                        <InfoRow
                            icon={Palette}
                            label="Color"
                            value={waste.color || "-"}
                        />

                        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">

                            <span className="font-medium text-heading">
                                Condition
                            </span>

                            <span
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                                    conditionColor[
                                        waste.condition
                                    ] ||
                                    "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {waste.condition}
                            </span>

                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">

                            <span className="font-medium text-heading">
                                Status
                            </span>

                            <span
                                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                                    statusColor[
                                        waste.status
                                    ] ||
                                    "bg-gray-100 text-gray-700"
                                }`}
                            >
                                {waste.status}
                            </span>

                        </div>

                    </div>

                </Card>

                <Card
                    title="Storage Information"
                    subtitle="Warehouse storage details."
                >

                    <div className="space-y-5">

                        <InfoRow
                            icon={MapPin}
                            label="Storage Location"
                            value={
                                waste.storage_location ||
                                "-"
                            }
                        />

                        <InfoRow
                            icon={Hash}
                            label="Rack Number"
                            value={
                                waste.rack_number ||
                                "-"
                            }
                        />

                        <InfoRow
                            icon={Archive}
                            label="Inventory Status"
                            value={
                                waste.status ||
                                "-"
                            }
                        />

                    </div>

                </Card>

            </div>

            <Card
                title="Additional Notes"
                subtitle="Remarks recorded during waste registration."
            >

                <div className="flex gap-4">

                    <FileText
                        className="mt-1 text-accent"
                        size={22}
                    />

                    <p className="leading-8 text-muted">

                        {waste.notes
                            ? waste.notes
                            : "No additional notes available."}

                    </p>

                </div>

            </Card>

            <Card
                title="Waste Image"
                subtitle="Uploaded textile image for AI analysis."
            >

                <div className="flex h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">

                    <ImageIcon
                        size={60}
                        className="text-gray-400"
                    />

                    <p className="mt-5 font-medium text-gray-500">
                        No image uploaded
                    </p>

                    <p className="mt-2 text-sm text-gray-400">
                        Images can be uploaded during AI
                        analysis.
                    </p>

                </div>

            </Card>

        </div>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">

            <div className="flex items-center gap-3">

                <div className="rounded-lg bg-blue-50 p-2">

                    <Icon
                        size={18}
                        className="text-accent"
                    />

                </div>

                <span className="font-medium text-heading">
                    {label}
                </span>

            </div>

            <span className="font-semibold text-muted">
                {value}
            </span>

        </div>
    );
}

export default WasteDetails;