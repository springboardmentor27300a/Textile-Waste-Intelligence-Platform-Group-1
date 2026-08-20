import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "../styles/Dataset.css";

function Dataset() {

    const [datasets, setDatasets] = useState([]);
    const [fabricType, setFabricType] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const loadDatasets = async () => {

        try {

            const res = await API.get("/dataset");
            setDatasets(res.data);

        }

        catch (err) {

            console.log(err);
            toast.error("Failed to load datasets");

        }

    };

    useEffect(() => {

        loadDatasets();

    }, []);

    const uploadDataset = async () => {

        if (!selectedFile || !fabricType) {

            toast.warning("Please select file and fabric type.");
            return;

        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg"
        ];

        if (!allowedTypes.includes(selectedFile.type)) {

            toast.warning("Only JPG and PNG images are allowed.");
            return;

        }

        const formData = new FormData();

        formData.append("file", selectedFile);
        formData.append("fabric_type", fabricType);

        setLoading(true);

        try {

            await API.post("/dataset", formData);

            toast.success("Dataset Uploaded Successfully");

            setSelectedFile(null);
            setFabricType("");

            document.getElementById("datasetFile").value = "";

            loadDatasets();

        }

        catch (err) {

            console.log(err);
            toast.error("Upload Failed");

        }

        setLoading(false);

    };

    const filteredDatasets = datasets.filter((item) =>
        item.filename.toLowerCase().includes(search.toLowerCase()) ||
        item.fabric_type.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <>

            <Navbar />

            <div className="dataset-container">

                <h1 className="dataset-title">
                    📂 Dataset Management
                </h1>

                <div className="dataset-summary">

                    <div className="dataset-card">
                        <h2>{datasets.length}</h2>
                        <p>Total Files</p>
                    </div>

                    <div className="dataset-card">
                        <h2>{datasets.length}</h2>
                        <p>Uploaded Files</p>
                    </div>

                    <div className="dataset-card">
                        <h2>PostgreSQL</h2>
                        <p>Database</p>
                    </div>

                </div>

                <div className="upload-card">

                    <h2>⬆ Upload New Dataset</h2>

                    <input
                        id="datasetFile"
                        type="file"
                        onChange={(e) =>
                            setSelectedFile(e.target.files[0])
                        }
                    />

                    <input
                        type="text"
                        placeholder="Fabric Type"
                        value={fabricType}
                        onChange={(e) =>
                            setFabricType(e.target.value)
                        }
                    />

                    <button
                        className="upload-btn"
                        onClick={uploadDataset}
                        disabled={loading}
                    >
                        {loading ? "Uploading..." : "Upload Dataset"}
                    </button>

                </div>

                <input
                    className="search-dataset"
                    type="text"
                    placeholder="🔍 Search Dataset..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <div className="dataset-table-card">

                    <table className="dataset-table">

                        <thead>

                            <tr>

                                <th>ID</th>
                                <th>File Name</th>
                                <th>Fabric Type</th>
                                <th>Status</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                filteredDatasets.length === 0 ?

                                    (

                                        <tr>

                                            <td
                                                colSpan="4"
                                                style={{
                                                    padding: "30px"
                                                }}
                                            >

                                                No Dataset Found

                                            </td>

                                        </tr>

                                    )

                                    :

                                    (

                                        filteredDatasets.map((item) => (

                                            <tr key={item.id}>

                                                <td>{item.id}</td>

                                                <td>{item.filename}</td>

                                                <td>

                                                    <span className="fabric-badge">

                                                        {item.fabric_type}

                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="status-uploaded">

                                                        {item.status}

                                                    </span>

                                                </td>

                                            </tr>

                                        ))

                                    )

                            }

                        </tbody>

                    </table>

                </div>

            </div>

        </>

    );

}

export default Dataset;