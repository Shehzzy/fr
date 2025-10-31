import React from "react";
import notFound from "../Assets/Images/404notFound2.png";

const NotFound = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <img
        src={notFound}
        alt="404 Not Found"
        style={{ maxWidth: "500px", width: "100%", marginBottom: "20px" }}
        className="not-found-child"
      />
      <h2 style={{ color: "#555" }}>Oops! Page not found</h2>
      <p style={{ color: "#777", maxWidth: "400px" }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
    </div>
  );
};

export default NotFound;
