import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaBoxes,
    FaPlus,
    FaArrowLeft,
    FaSearch,
    FaEdit,
    FaTrash,
    FaLayerGroup,
    FaWeightHanging,
    FaChartLine
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    getInventories,
    createInventory,
    updateInventory,
    deleteInventory
} from "../services/inventoryService";

import "./Inventory.css";

function Inventory() {

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [inventories, setInventories] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({

        waste_batch_id: "",

        fabric_type: "",

        source: "",

        quantity: "",

        color: "",

        condition: "",

        collection_date: ""

    });

    useEffect(() => {

        loadInventories();

    }, []);

    const loadInventories = async () => {

        try {

            const response = await getInventories();

            setInventories(response.data);

        }

        catch (error) {

            console.log(error);

            setMessage("❌ Failed to load inventory.");

            setTimeout(() => {

                setMessage("");

            }, 3000);

        }

    };

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const handleSaveInventory = async (e) => {

        e.preventDefault();

        // ==========================
        // Frontend Validations
        // ==========================

        const today = new Date();

const todayString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

if (formData.collection_date > todayString) {

    setMessage(
        "❌ Future collection dates are not allowed."
    );

    setTimeout(() => {

        setMessage("");

    }, 3000);

    return;
}

        if (Number(formData.quantity) <= 0) {

            setMessage("❌ Quantity must be greater than 0.");

            setTimeout(() => {

                setMessage("");

            }, 3000);

            return;

            return;

        }

        try {

            if (editingId) {

                await updateInventory(
                    editingId,
                    formData
                );

                setMessage("✅ Inventory updated successfully.");

                setTimeout(() => {

                    setMessage("");

                }, 3000);

            }

            else {

                await createInventory(formData);

                setMessage("✅ Inventory added successfully.");

                setTimeout(() => {

                    setMessage("");

                }, 3000);

            }

            setEditingId(null);

            setShowModal(false);

            setFormData({

                waste_batch_id: "",

                fabric_type: "",

                source: "",

                quantity: "",

                color: "",

                condition: "",

                collection_date: ""

            });

            loadInventories();

        }

        catch (error) {

            if (error.response) {

                setMessage(`❌ ${error.response.data.detail}`);

                setTimeout(() => {

                    setMessage("");

                }, 3000);

            }

            else {

                setMessage("❌ Operation failed.");

                setTimeout(() => {

                    setMessage("");

                }, 3000);

            }

        }

    };

    const handleEdit = (inventory) => {

        setEditingId(inventory.id);

        setFormData({

            waste_batch_id: inventory.waste_batch_id,

            fabric_type: inventory.fabric_type,

            source: inventory.source,

            quantity: inventory.quantity,

            color: inventory.color,

            condition: inventory.condition,

            collection_date: inventory.collection_date

        });

        setShowModal(true);

    };

    const handleDelete = async (id) => {

        if (!window.confirm("Delete this inventory?")) return;

        try {

            await deleteInventory(id);

            setMessage("✅ Inventory deleted successfully.");

            setTimeout(() => {

                setMessage("");

            }, 3000);

            loadInventories();

        }

        catch (error) {

            setMessage("❌ Delete failed.");

            setTimeout(() => {

                setMessage("");

            }, 3000);

        }

    };

    const filteredInventories = useMemo(() => {

        return inventories.filter((item) =>

            item.waste_batch_id
                .toLowerCase()
                .includes(searchTerm.toLowerCase())

            ||

            item.fabric_type
                .toLowerCase()
                .includes(searchTerm.toLowerCase())

        );

    }, [inventories, searchTerm]);

    const totalQuantity = inventories.reduce(

        (sum, item) =>

            sum + Number(item.quantity),

        0

    );

    const totalFabricTypes = [

        ...new Set(

            inventories.map(

                item => item.fabric_type

            )

        )

    ].length;

    return (

        <>

            <Navbar />

            <div className="inventory-container">

                <div className="inventory-card">

                    <div className="inventory-header">

                        <div>

                            <h2>

                                Textile Inventory Management

                            </h2>

                            <p>

                                Manage and monitor textile waste inventory efficiently.

                            </p>

                        </div>

                        <div className="header-buttons">

                            <button

                                className="dashboard-btn"

                                onClick={() => navigate("/dashboard")}

                            >

                                <FaArrowLeft />

                                Dashboard

                            </button>

                            {(user.role === "admin" ||

                                user.role === "manufacturer") && (

                                <button

                                    className="add-btn"

                                    onClick={() => {

                                        setEditingId(null);

                                        setFormData({

                                            waste_batch_id: "",

                                            fabric_type: "",

                                            source: "",

                                            quantity: "",

                                            color: "",

                                            condition: "",

                                            collection_date: ""

                                        });

                                        setShowModal(true);

                                    }}

                                >

                                    <FaPlus />

                                    Add Inventory

                                </button>

                            )}

                        </div>

                    </div>

                    <div className="inventory-stats">

                        <div className="inventory-stat-card">

                            <FaBoxes className="stat-icon"/>

                            <h3>Total Batches</h3>

                            <h2>

                                {inventories.length}

                            </h2>

                        </div>

                        <div className="inventory-stat-card">

                            <FaWeightHanging className="stat-icon"/>

                            <h3>Total Quantity</h3>

                            <h2>

                                {totalQuantity} kg

                            </h2>

                        </div>

                        <div className="inventory-stat-card">

                            <FaLayerGroup className="stat-icon"/>

                            <h3>Fabric Types</h3>

                            <h2>

                                {totalFabricTypes}

                            </h2>

                        </div>

                    </div>

                    <div className="inventory-tools">

                        <div className="search-box">

                            <FaSearch />

                            <input

                                type="text"

                                placeholder="Search Batch ID or Fabric..."

                                value={searchTerm}

                                onChange={(e) =>

                                    setSearchTerm(e.target.value)

                                }

                            />

                        </div>
                        

                    </div>
                    {!showModal && message && (

                        <div
                            className={
                                message.startsWith("❌")
                                    ? "error-message"
                                    : "success-message"
                            }
                        >

                            {message}

                        </div>

                    )}

                    <table className="inventory-table">

                        <thead>

                            <tr>

                                <th>Batch ID</th>

                                <th>Fabric</th>

                                <th>Source</th>

                                <th>Quantity</th>

                                <th>Color</th>

                                <th>Condition</th>

                                <th>Date</th>

                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredInventories.length === 0 ? (

                                <tr>

                                    <td

                                        colSpan="8"

                                        className="no-data"

                                    >

                                        No Inventory Found

                                    </td>

                                </tr>

                            ) : (

                                filteredInventories.map((item) => (

                                    <tr key={item.id}>

                                        <td>{item.waste_batch_id}</td>

                                        <td>{item.fabric_type}</td>

                                        <td>{item.source}</td>

                                        <td>{item.quantity} kg</td>

                                        <td>{item.color}</td>

                                <td>

                                    <span
                                        className={`status-badge ${(item.condition || "pending").toLowerCase()}`}
                                    >
                                        {item.condition || "N/A"}
                                    </span>

                                </td>

                                <td>{item.collection_date}</td>

                                <td>

                                    {(user.role === "admin" ||

                                        user.role === "manufacturer" ||

                                        user.role === "recycling_operator") && (

                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(item)}
                                        >

                                            <FaEdit />

                                            Edit

                                        </button>

                                        

                                    )}
                                    
                                    <button
                                        className="analyze-btn"
                                        onClick={() => navigate(`/inventory-analysis?inventory_id=${item.id}`)}
                                    >
                                        <FaChartLine />
                                        Analyze
                                    </button>

                                    {user.role === "admin" && (

                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(item.id)}
                                        >

                                            <FaTrash />

                                            Delete

                                        </button>

                                    )}

                                </td>

                                </tr>

                                ))

                                )}

                                </tbody>

                                </table>

                                </div>

                                </div>

                                            {showModal && (

                <div className="modal-overlay">

                    <div className="modal-box">

                        <h2>

                            {editingId
                                ? "Update Textile Waste"
                                : "Add Textile Waste"}

                        </h2>

                        {message && (

                            <div
                                className={
                                    message.startsWith("❌")
                                        ? "modal-error-message"
                                        : "modal-success-message"
                                }
                            >

                                {message}

                            </div>

                        )}

                        <form onSubmit={handleSaveInventory}>
                            <div className="form-grid">

                                <input
                                    type="text"
                                    name="waste_batch_id"
                                    placeholder="Waste Batch ID"
                                    value={formData.waste_batch_id}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="fabric_type"
                                    placeholder="Fabric Type"
                                    value={formData.fabric_type}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="source"
                                    placeholder="Source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantity (kg)"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    type="text"
                                    name="color"
                                    placeholder="Color"
                                    value={formData.color}
                                    onChange={handleChange}
                                />

                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select Condition
                                    </option>

                                    <option value="Good">
                                        Good
                                    </option>

                                    <option value="Recyclable">
                                        Recyclable
                                    </option>

                                    <option value="Damaged">
                                        Damaged
                                    </option>

                                </select>

                                <input
                                    type="date"
                                    name="collection_date"
                                    value={formData.collection_date}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="modal-buttons">

                                <button
                                    type="submit"
                                    className="save-btn"
                                >

                                    {editingId
                                        ? "Update Inventory"
                                        : "Save Inventory"}

                                </button>

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {

                                        setShowModal(false);

                                        setEditingId(null);

                                    }}
                                >

                                    Cancel

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            <Footer />

        </>

    );

}

export default Inventory;