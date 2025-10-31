// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  //   useEffect(() => {
  //     window.history.pushState(null, null, window.location.href);
  //     window.onpopstate = function () {
  //       window.history.go(1); // prevent back
  //     };
  //   }, []);
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
