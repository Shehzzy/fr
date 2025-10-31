import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL_PAYMENT, CREATE_PAYMENT, GET_PLANS } from "../API";
import { toast } from "react-toastify";

const PaymentForm = ({ setShow }) => {
  const [plan, setPlan] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch subscription plan
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL_PAYMENT}${GET_PLANS}`);
        if (data.status && data.data) setPlan(data.data);
        else setError("Failed to fetch payment plan.");
      } catch (err) {
        console.error("Error fetching plan:", err);
        setError("Something went wrong while fetching plan.");
      }
    };
    fetchPlan();
  }, []);

  const handleSubscribe = async () => {
    if (!plan) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1️⃣ Call backend to create Checkout Session
      const res = await axios.post(
        `${BASE_URL_PAYMENT}${CREATE_PAYMENT}`,
        {
          plan_id: plan.id,
          promo_code: promoCode.trim() || undefined,
        },
        {
          headers: { "Content-Type": "application/json", Token: token },
        }
      );

      const { url } = res.data; // backend returns session URL
      if (!url) {
        setError("Failed to create checkout session.");
        setIsProcessing(false);
        return;
      }

      // 2️⃣ Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error("Error creating checkout session:", err);
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-form">
      {plan ? (
        <div className="plan-box mb-3 p-3 border rounded">
          <h5 className="mb-1">{plan.productName}</h5>
          <p className="mb-1">
            <strong>
              {plan.currency?.toUpperCase()}{" "}
              {(plan.unit_amount / 100).toFixed(2)}
            </strong>{" "}
            / {plan.interval}
          </p>
          {plan.description && <p className="mb-0">{plan.description}</p>}
        </div>
      ) : (
        <p>Loading plan...</p>
      )}

      <div className="mb-3">
        <label htmlFor="promoCode" className="form-label">
          Promo Code (optional)
        </label>
        <input
          type="text"
          id="promoCode"
          className="form-control"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Enter promo code"
          disabled={isProcessing}
        />
      </div>

      {error && <div className="text-danger mb-3">{error}</div>}

      <button
        type="button"
        className="main-btn mt-3 w-100"
        disabled={isProcessing || !plan}
        onClick={handleSubscribe}
      >
        {isProcessing ? "Processing..." : "Subscribe Now"}
      </button>
    </div>
  );
};

export default PaymentForm;
