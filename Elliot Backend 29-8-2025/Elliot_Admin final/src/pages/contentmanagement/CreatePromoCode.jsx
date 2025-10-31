import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Loader from "../../components/Loader";
import { BASE_URL_ADMIN } from "../../API";
import { useNavigate } from "react-router-dom";

const CreatePromoCode = () => {
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [percentOff, setPercentOff] = useState("");
  const [amountOff, setAmountOff] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [duration, setDuration] = useState("once");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        BASE_URL_ADMIN + "/create-coupon",
        {
          name,
          percent_off: discountType === "percent" ? percentOff : undefined,
          amount_off: discountType === "amount" ? amountOff : undefined,
          currency: "gbp", // 🔒 fixed to GBP only
          max_redemptions: maxRedemptions,
          duration,
        },
        {
          headers: {
            Token: localStorage.getItem("token"),
          },
        }
      );
      setMessage("Coupon Created Successfully!");
      toast.success("Coupon created successfully!");
      setShowModal(true);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
      toast.error("Error creating coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/coupons");
  };

  return (
    <>
      <Loader isLoading={loading} />
      <div className="container-fluid">
        <Header />
        <div className="row">
          <Sidebar />
          <div className="col-9 main-dash-left">
            <section className="back-dashboard-sec comn-dashboard-page">
              <div className="main-notification-messege">
                <div className="notifi-list d-flex">
                  <h6>Create Coupon</h6>
                </div>
                <Form onSubmit={handleSubmit} className="create-promo-form">
                  <div className="form-group">
                    <label>Coupon Name</label>
                    <Form.Control
                      type="text"
                      placeholder="Enter coupon name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Discount Type</label>
                    <Form.Control
                      as="select"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                    >
                      <option value="percent">Percent Off</option>
                      <option value="amount">Amount Off</option>
                    </Form.Control>
                  </div>

                  {discountType === "percent" && (
                    <div className="form-group">
                      <label>Percent Off</label>
                      <Form.Control
                        type="number"
                        placeholder="Enter discount percentage"
                        value={percentOff}
                        onChange={(e) => setPercentOff(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {discountType === "amount" && (
                    <div className="form-group">
                      <label>Amount Off</label>
                      <Form.Control
                        type="number"
                        placeholder="Enter discount amount"
                        value={amountOff}
                        onChange={(e) => setAmountOff(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* 🔒 Currency fixed to GBP, no UI shown */}

                  <div className="form-group">
                    <label>Max Redemptions</label>
                    <Form.Control
                      type="number"
                      placeholder="Max redemptions"
                      value={maxRedemptions}
                      onChange={(e) => setMaxRedemptions(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration</label>
                    <Form.Control
                      as="select"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      <option value="once">Once</option>
                      <option value="forever">Forever</option>
                      <option value="repeating">Repeating</option>
                    </Form.Control>
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="login-btn cstm_width"
                  >
                    {loading ? "Creating..." : "Create Coupon"}
                  </Button>
                </Form>

                <Modal show={showModal} onHide={handleModalClose} centered>
                  <Modal.Body>
                    <div className="modal-content">
                      <h4>Coupon Created Successfully!</h4>
                      <div className="d-flex justify-content-center">
                        <Button onClick={handleModalClose}>OK</Button>
                      </div>
                    </div>
                  </Modal.Body>
                </Modal>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePromoCode;
