import React, { useState } from "react";
import axios from "axios";

const AdminCreatePromoCode = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("percent_off");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim()) {
      setMessage("Promo code name is required");
      return;
    }

    let couponData = { duration: "once" };

    if (type === "percent_off") {
      couponData.percent_off = 20; // fixed 20% off
    } else if (type === "amount_off") {
      couponData.amount_off = 1000; // $10 off in cents
      couponData.currency = "usd";
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "/admin/create-promo-code",
        {
          promoCode: name.trim(),
          couponData,
        },
        {
          headers: {
            Token: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.status) {
        setMessage("Promo code created successfully!");
        setName("");
      } else {
        setMessage("Failed to create promo code.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error creating promo code.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "20px auto", padding: 20, border: "1px solid #ddd", borderRadius: 4 }}>
      <h2>Create Promo Code</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>Promo Code Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            required
            style={{ width: "100%", padding: 8, marginTop: 5 }}
            placeholder="e.g. SUMMER2025"
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 5 }}
          >
            <option value="percent_off">Percent Off</option>
            <option value="amount_off">Amount Off</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creating..." : "Create Promo Code"}
        </button>
      </form>
      {message && <p style={{ marginTop: 15, color: "green" }}>{message}</p>}
    </div>
  );
};

export default AdminCreatePromoCode;
