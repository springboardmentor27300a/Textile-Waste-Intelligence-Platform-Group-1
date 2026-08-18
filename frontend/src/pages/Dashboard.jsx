import AdminDashboard from "./dashboards/AdminDashboard";
import ManufacturerDashboard from "./dashboards/ManufacturerDashboard";
import SustainabilityManagerDashboard from "./dashboards/SustainabilityManagerDashboard";
import RecyclingFacilityDashboard from "./dashboards/RecyclingFacilityDashboard";

const getStoredUser = () => {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {

        return JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Invalid user data in localStorage",
            error
        );

        return null;
    }
};


function Dashboard() {

    const user = getStoredUser();

    const role = user?.role;


    // ==========================================
    // ADMIN
    // ==========================================

    if (role === "admin") {

        return <AdminDashboard />;

    }


    // ==========================================
    // MANUFACTURER
    // ==========================================

    if (role === "manufacturer") {

        return <ManufacturerDashboard />;

    }


    // ==========================================
    // SUSTAINABILITY MANAGER
    // ==========================================

    if (role === "sustainability_manager") {

        return <SustainabilityManagerDashboard />;

    }


    // ==========================================
    // RECYCLING OPERATOR
    // ==========================================

    if (role === "recycling_operator") {

        return <RecyclingFacilityDashboard />;

    }


    // ==========================================
    // INVALID ROLE
    // ==========================================

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "Arial, sans-serif"
            }}
        >

            <div
                style={{
                    textAlign: "center",
                    padding: "40px"
                }}
            >

                <h2>
                    Dashboard Access Unavailable
                </h2>

                <p>
                    Your account does not have a valid dashboard role.
                </p>

            </div>

        </div>

    );

}


export default Dashboard;