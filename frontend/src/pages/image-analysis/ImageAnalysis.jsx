import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useLocation } from "react-router-dom";

import {
    ScanSearch,
    Sparkles,
    RefreshCw,
} from "lucide-react";

import { Button, Card } from "../../components/ui";

import ImageUploader from "../../components/image-analysis/ImageUploader";
import ImagePreview from "../../components/image-analysis/ImagePreview";
import AIProcessingTimeline from "../../components/image-analysis/AIProcessingTimeline";
import AnalysisResult from "../../components/image-analysis/AnalysisResult";
import ConfidenceBar from "../../components/image-analysis/ConfidenceBar";
import AnalysisHistory from "../../components/image-analysis/AnalysisHistory";

import useAnalysis from "../../hooks/useAnalysis";


function ImageAnalysis() {

    // --------------------------------------------------
    // Image
    // --------------------------------------------------

    const [image, setImage] = useState(null);

    // --------------------------------------------------
    // Navigation State
    // --------------------------------------------------

    const location = useLocation();

    const selectedWaste =
        location.state?.waste;

    /*
     * Collection ID can arrive from different
     * navigation implementations.
     *
     * Supported:
     *   location.state.collectionId
     *   waste.collection_id
     *   waste.collectionId
     *   waste.collection.id
     */

    const collectionId =
        location.state?.collectionId ??
        selectedWaste?.collection_id ??
        selectedWaste?.collectionId ??
        selectedWaste?.collection?.id ??
        null;

    // --------------------------------------------------
    // Analysis Hook
    // --------------------------------------------------

    const {
        loading,
        result,
        history,
        error,
        analyzeImage,
        loadHistory,
    } = useAnalysis();

    // --------------------------------------------------
    // Load Analysis History
    // --------------------------------------------------

    useEffect(() => {
        loadHistory();
    }, []);

    // --------------------------------------------------
    // Statistics
    // --------------------------------------------------

    const stats = useMemo(() => {

        const total =
            Array.isArray(history)
                ? history.length
                : 0;

        const averageConfidence =
            total > 0
                ? Math.round(
                    history.reduce(
                        (sum, item) =>
                            sum +
                            Number(
                                item?.confidence || 0
                            ),
                        0
                    ) / total
                )
                : 0;

        const recyclable =
            history.filter(
                (item) =>
                    item?.recyclable === true
            ).length;

        const sustainable =
            history.filter(
                (item) =>
                    Number(
                        item?.sustainability_score || 0
                    ) >= 80
            ).length;

        return {
            total,
            averageConfidence,
            recyclable,
            sustainable,
        };

    }, [history]);

    // --------------------------------------------------
    // Analyze Image
    // --------------------------------------------------

    async function handleAnalyze() {

        if (!image) {
            return;
        }

        if (!collectionId) {
            return;
        }

        await analyzeImage(
            image,
            collectionId
        );
    }

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (

        <div className="space-y-8">

            {/* ================================================== */}
            {/* HERO */}
            {/* ================================================== */}

            <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-10 text-white shadow-floating">

                <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">

                    <div className="max-w-3xl">

                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">

                            <Sparkles size={16} />

                            AI Powered Textile Intelligence

                        </div>

                        <h1 className="mt-6 text-5xl font-bold">

                            Intelligent Textile Image Analysis

                        </h1>

                        <p className="mt-5 text-lg leading-8 text-blue-100">

                            Upload textile images and receive
                            comprehensive AI-powered material
                            recognition, waste classification,
                            sustainability assessment,
                            environmental impact analysis,
                            ESG evaluation and intelligent
                            recycling recommendations.

                        </p>

                    </div>


                    {/* Statistics */}

                    <div className="grid gap-5 sm:grid-cols-2">

                        <Card className="border-white/20 bg-white/10 backdrop-blur">

                            <h3 className="text-4xl font-bold text-white">
                                {stats.total}
                            </h3>

                            <p className="mt-2 text-blue-100">
                                Analyses Completed
                            </p>

                        </Card>


                        <Card className="border-white/20 bg-white/10 backdrop-blur">

                            <h3 className="text-4xl font-bold text-white">
                                {stats.averageConfidence}%
                            </h3>

                            <p className="mt-2 text-blue-100">
                                Avg. Confidence
                            </p>

                        </Card>


                        <Card className="border-white/20 bg-white/10 backdrop-blur">

                            <h3 className="text-4xl font-bold text-white">
                                {stats.recyclable}
                            </h3>

                            <p className="mt-2 text-blue-100">
                                Recyclable Items
                            </p>

                        </Card>


                        <Card className="border-white/20 bg-white/10 backdrop-blur">

                            <h3 className="text-4xl font-bold text-white">
                                {stats.sustainable}
                            </h3>

                            <p className="mt-2 text-blue-100">
                                Sustainability ≥80
                            </p>

                        </Card>

                    </div>

                </div>

            </div>


            {/* ================================================== */}
            {/* TOOLBAR */}
            {/* ================================================== */}

            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-card lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <h2 className="text-2xl font-bold text-heading">
                        AI Analysis Workspace
                    </h2>

                    <p className="mt-2 text-muted">
                        Upload, analyze and review textile
                        waste images.
                    </p>

                </div>


                <div className="flex gap-3">

                    <Button
                        variant="secondary"
                        onClick={loadHistory}
                        disabled={loading}
                    >

                        <RefreshCw size={18} />

                        Refresh History

                    </Button>


                    <Button
                        onClick={handleAnalyze}
                        disabled={
                            !image ||
                            !collectionId ||
                            loading
                        }
                        loading={loading}
                    >

                        <ScanSearch size={18} />

                        Analyze Image

                    </Button>

                </div>

            </div>


            {/* ================================================== */}
            {/* SELECTED WASTE */}
            {/* ================================================== */}

            {selectedWaste && (

                <Card
                    title="Selected Waste Batch"
                    subtitle="Inventory batch selected for AI analysis."
                >

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">


                        {/* Batch */}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                            <p className="text-sm text-muted">
                                Batch ID
                            </p>

                            <h3 className="mt-2 text-xl font-semibold">
                                {selectedWaste.batch_id ?? "—"}
                            </h3>

                        </div>


                        {/* Fabric */}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                            <p className="text-sm text-muted">
                                Fabric
                            </p>

                            <h3 className="mt-2 text-xl font-semibold">
                                {selectedWaste.fabric ?? "—"}
                            </h3>

                        </div>


                        {/* Source */}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                            <p className="text-sm text-muted">
                                Source
                            </p>

                            <h3 className="mt-2 text-xl font-semibold">
                                {selectedWaste.source ?? "—"}
                            </h3>

                        </div>


                        {/* Condition */}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                            <p className="text-sm text-muted">
                                Condition
                            </p>

                            <h3 className="mt-2 text-xl font-semibold">
                                {selectedWaste.condition ?? "—"}
                            </h3>

                        </div>


                        {/* Collection */}

                        <div
                            className={`rounded-2xl border p-5 ${
                                collectionId
                                    ? "border-emerald-200 bg-emerald-50"
                                    : "border-red-200 bg-red-50"
                            }`}
                        >

                            <p className="text-sm text-muted">
                                Collection
                            </p>

                            <h3
                                className={`mt-2 text-xl font-semibold ${
                                    collectionId
                                        ? "text-emerald-700"
                                        : "text-red-700"
                                }`}
                            >
                                {collectionId
                                    ? `#${collectionId}`
                                    : "Not linked"}
                            </h3>

                        </div>

                    </div>

                </Card>

            )}


            {/* ================================================== */}
            {/* COLLECTION WARNING */}
            {/* ================================================== */}

            {!collectionId && (

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

                    <div className="flex items-start gap-3">

                        <div className="mt-0.5 text-amber-600">
                            ⚠
                        </div>

                        <div>

                            <h3 className="font-semibold text-amber-800">
                                Collection Required
                            </h3>

                            <p className="mt-1 text-sm text-amber-700">
                                This analysis must be linked to a
                                waste collection before the image
                                can be analyzed.
                            </p>

                        </div>

                    </div>

                </div>

            )}


            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (

                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

                    <h3 className="font-semibold text-red-700">
                        Analysis Failed
                    </h3>

                    <p className="mt-2 text-red-600">
                        {error}
                    </p>

                </div>

            )}


            {/* ================================================== */}
            {/* UPLOAD + PREVIEW */}
            {/* ================================================== */}

            <div className="grid gap-8 xl:grid-cols-2">

                <ImageUploader
                    onImageSelect={(selectedImage) => {
                        setImage(selectedImage);
                    }}
                />


                <ImagePreview
                    image={image}
                />

            </div>


            {/* ================================================== */}
            {/* ANALYZE BUTTON */}
            {/* ================================================== */}

            {image && (

                <div className="flex flex-col items-center gap-3">

                    <Button
                        loading={loading}
                        onClick={handleAnalyze}
                        disabled={
                            !collectionId ||
                            loading
                        }
                        className="rounded-2xl px-10 py-4 text-lg"
                    >

                        <div className="flex items-center gap-3">

                            <ScanSearch size={22} />

                            Analyze Textile with AI

                        </div>

                    </Button>


                    {!collectionId && (

                        <p className="text-sm text-amber-600">
                            Select or open a waste batch linked
                            to a collection before analyzing.
                        </p>

                    )}

                </div>

            )}


            {/* ================================================== */}
            {/* AI PROCESSING */}
            {/* ================================================== */}

            {loading && (

                <AIProcessingTimeline />

            )}


            {/* ================================================== */}
            {/* ANALYSIS RESULTS */}
            {/* ================================================== */}

            {result && (

                <div className="space-y-8">

                    <Card
                        title="AI Prediction Confidence"
                        subtitle="Reliability of the generated prediction."
                    >

                        <ConfidenceBar
                            value={result.confidence}
                        />

                    </Card>


                    <AnalysisResult
                        result={result}
                    />

                </div>

            )}


            {/* ================================================== */}
            {/* ANALYSIS HISTORY */}
            {/* ================================================== */}

            <AnalysisHistory
                history={history}
            />

        </div>

    );
}

export default ImageAnalysis;