import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import API from "../services/api";
import "../styles/Inventory.css";

function Inventory() {

    const [inventory, setInventory] = useState([]);
    const [fabric, setFabric] = useState("");
    const [weight, setWeight] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchInventory = async () => {

        try {

            const response = await API.get("/inventory");
            setInventory(response.data);

        }

        catch (error) {

            console.log(error);
            toast.error("Failed to load inventory");

        }

    };

    useEffect(() => {

        fetchInventory();

    }, []);

    const addFabric = async () => {

        if (!fabric || !weight) {

            toast.warning("Please fill all fields");
            return;

        }

        if (Number(weight) <= 0) {

            toast.warning("Weight must be greater than 0");
            return;

        }

        setLoading(true);

        try {

            const response = await API.post("/inventory", {

                fabric,
                weight

            });

            toast.success(response.data.message);

            setFabric("");
            setWeight("");

            fetchInventory();

        }

        catch (error) {

            console.log(error);
            toast.error("Failed to add fabric");

        }

        setLoading(false);

    };

    const filteredInventory = inventory.filter((item) =>
        item.fabric.toLowerCase().includes(search.toLowerCase())
    );

    const totalWeight = inventory.reduce(
        (sum, item) => sum + Number(item.weight),
        0
    );

    return (

        <>

            <Navbar />

            <div className="inventory-container">

                <h1 className="inventory-title">
                    📦 Inventory Management
                </h1>

                <div className="summary-cards">

                    <div className="summary-card">
                        <h2>{inventory.length}</h2>
                        <p>Total Fabrics</p>
                    </div>

                    <div className="summary-card">
                        <h2>{totalWeight} kg</h2>
                        <p>Total Weight</p>
                    </div>

                    <div className="summary-card">
                        <h2>
                            {
                                inventory.filter(
                                    (item) => item.status === "Available"
                                ).length
                            }
                        </h2>
                        <p>Available</p>
                    </div>

                </div>

                <div className="form-card">

                    <input
                        type="text"
                        placeholder="Fabric Name"
                        value={fabric}
                        onChange={(e) => setFabric(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Weight (kg)"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                    />

                    <button
                        className="add-btn"
                        onClick={addFabric}
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "➕ Add Fabric"}
                    </button>

                </div>

                <input
                    className="search-box"
                    type="text"
                    placeholder="🔍 Search Fabric..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="table-card">

                    <table className="inventory-table">

                        <thead>

                            <tr>

                                <th>ID</th>
                                <th>Fabric</th>
                                <th>Weight</th>
                                <th>Status</th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredInventory.length === 0 ? (

                                <tr>

                                    <td colSpan="4">
                                        No Fabric Found
                                    </td>

                                </tr>

                            ) : (

                                filteredInventory.map((item) => (

                                    <tr key={item.id}>

                                        <td>{item.id}</td>

                                        <td>{item.fabric}</td>

                                        <td>{item.weight} kg</td>

                                        <td>

                                            <span
                                                className={`status-badge ${
                                                    item.status === "Available"
                                                        ? "status-active"
                                                        : item.status === "Pending"
                                                        ? "status-pending"
                                                        : "status-low"
                                                }`}
                                            >
                                                {item.status}
                                            </span>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </>

    );

}

export default Inventory;