// src/pages/CancelPage.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegCreditCard } from "react-icons/fa";

const CancelPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/subscription"); // redirect after 2 seconds
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="cancel-page"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}
    >
      <div
        className="inner-body-delete-logout text-center"
        style={{
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <div className="img-modal" style={{ marginBottom: "20px" }}>
          <figure>
            <FaRegCreditCard size={40} color="#f44336" />
          </figure>
        </div>
        <h4 className="heading" style={{ marginBottom: "15px" }}>
          Payment Canceled
        </h4>
        <p style={{ marginBottom: "20px" }}>
          Your payment was not completed. You will be redirected shortly...
        </p>
        <button
          className="main-btn"
          style={{
            backgroundColor: "#f44336",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/subscription")}
        >
          Go to Subscription
        </button>
      </div>
    </div>
  );
};

export default CancelPage;
