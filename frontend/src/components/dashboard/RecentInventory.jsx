import "./RecentInventory.css";

function RecentInventory({ inventory }) {

    return (
        <div className="recent-card">

            <h2>Recent Inventory</h2>

            <table className="inventory-table">

                <thead>
                    <tr>
                        <th>Batch ID</th>
                        <th>Fabric Type</th>
                        <th>Quantity</th>
                    </tr>
                </thead>

                <tbody>

                    {inventory.length === 0 ? (

                        <tr>
                            <td colSpan="3">
                                No Inventory Available
                            </td>
                        </tr>

                    ) : (

                        inventory.map((item) => (

                            <tr key={item.id}>

                                <td>{item.waste_batch_id}</td>

                                <td>
                                    <span className="fabric-badge">
                                        {item.fabric_type}
                                    </span>
                                </td>

                                <td>{item.quantity} kg</td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>

        </div>
    );
}

export default RecentInventory;