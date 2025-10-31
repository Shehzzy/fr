import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { Modal } from "react-bootstrap";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BASE_URL_PAYMENT } from "../API";
import { FaRegCreditCard } from "react-icons/fa"; 

function PaymentStatus() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const sessionId = new URLSearchParams(window.location.search).get(
    "session_id"
  );

  useEffect(() => {
    if (sessionId) {
      const verifyPayment = async () => {
        try {
          const response = await axios.post(
            `${BASE_URL_PAYMENT}/verify-payment`,
            { session_id: sessionId }
          );

          if (response.data.status === "paid") {
            setShowSuccessModal(true);
          } else {
            setShowCancelModal(true);
          }
        } catch (err) {
          setError("Failed to verify payment status.");
          toast.error("Failed to verify payment status.");
        } finally {
          setLoading(false);
        }
      };

      verifyPayment();
    }
  }, [sessionId]);

  const handleRedirect = () => {
    navigate("/subscription");
  };

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        navigate("/subscription");
      }, 3000); // 3 seconds auto redirect

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, navigate]);

  return (
    <div className="payment-status-page">
      {loading && <div>Loading...</div>}

      {/* Success Modal */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
        className="modal-delete-logout checkout_modal"
      >
        <Modal.Body className="p-0 text-center">
          <div className="inner-body-delete-logout">
            <div className="img-modal">
              <figure>
                <FaRegCreditCard size={40} />
              </figure>
            </div>
            <h4 className="heading">Payment Successful!</h4>
            <p>Your payment was successful. Thank you for subscribing.</p>
            <button className="main-btn mt-3 mx-auto" onClick={handleRedirect}>
              Go to Dashboard
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
        className="modal-delete-logout checkout_modal"
      >
        <Modal.Body className="p-0 text-center">
          <div className="inner-body-delete-logout">
            <div className="img-modal">
              <figure>
                <FaRegCreditCard size={40} />
              </figure>
            </div>
            <h4 className="heading">Payment Canceled</h4>
            <p>Your payment was not completed. Please try again.</p>
            <button className="main-btn mt-3 mx-auto" onClick={handleRedirect}>
              Try Again
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Error Toast */}
      <ToastContainer />
    </div>
  );
}

export default PaymentStatus;
