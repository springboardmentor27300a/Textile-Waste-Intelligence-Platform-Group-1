import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  getStoredAuth,
} from "../context/useAuth";


function ProtectedRoute({
  children,
  roles = [],
}) {

  const location = useLocation();

  const {
    token,
    user,
  } = getStoredAuth();


  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }


  if (
    roles.length > 0 &&
    !roles.includes(user?.role)
  ) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  return children;
}


export default ProtectedRoute;