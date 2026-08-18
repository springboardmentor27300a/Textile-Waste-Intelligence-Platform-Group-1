import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // User is not logged in
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If no role restriction is provided,
    // allow any authenticated user
    if (!allowedRoles || allowedRoles.length === 0) {
        return children;
    }

    let user;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error("Invalid user data:", error);
        return <Navigate to="/login" replace />;
    }

    const userRole = user?.role;

    // User does not have the required role
    if (!userRole || !allowedRoles.includes(userRole)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;