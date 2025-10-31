import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Profile/SideBar";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Footer from "../components/Footer";
import { Container, Modal } from "react-bootstrap";
import Loader from "../components/Loader";
import RenderHTMLList from "../components/RenderHTMLList";
import Crown from "../Assets/Images/crown.svg";
import { FaRegCreditCard } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import {
  BASE_URL_PAYMENT,
  CANCEL_SUBSCRIPTION,
  CREATE_PAYMENT,
  GET_PLANS,
} from "../API";
import { useUser } from "../context/UserContext";
import "react-toastify/dist/ReactToastify.css";

function Subscription() {
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [plan, setPlan] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState(null);
  const { homeData, setLoading, loading, user } = useUser();
  const token = localStorage.getItem("token");

  const isActive = user?.subscription_status === "active";

  // Fetch subscription plan
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axios.get(`${BASE_URL_PAYMENT}${GET_PLANS}`);
        if (response.data.status) {
          setPlan(response.data.data);
        } else {
          setCouponError("Failed to fetch payment plan");
        }
      } catch (err) {
        setCouponError("Failed to fetch payment plan");
      }
    };
    fetchPlan();
  }, []);

  const handleSubscribe = async () => {
    if (!plan) {
      toast.error("No plan available to subscribe.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL_PAYMENT}${CREATE_PAYMENT}`,
        { plan_id: plan.id, coupon_code: couponCode },
        { headers: { Token: token, "Content-Type": "application/json" } }
      );

      const { url, message } = res.data;

      if (url) {
        window.location.href = url;
      } else {
        toast.error(message || "Failed to create checkout session.");
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error_description?.code === "coupon_expired") {
        setCouponError(
          "The coupon code is expired. Please use a valid coupon or proceed without one."
        );
      } else if (err.response?.data?.message) {
        setCouponError(err.response.data.message);
      } else {
        setCouponError("Something went wrong while creating checkout session.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL_PAYMENT}${CANCEL_SUBSCRIPTION}`,
        { subscriptionId: user.stripeSubscriptionId },
        { headers: { Token: token, "Content-Type": "application/json" } }
      );
      if (response.data.status) {
        toast.success("Subscription canceled successfully");
        setShowCancelModal(false);
      } else {
        toast.error("Error while canceling subscription");
      }
    } catch (err) {
      toast.error("Error while canceling subscription");
    }
  };

  return (
    <div className="comm_page_wrapper">
      <Header />
      {loading ? (
        <Loader isLoading={true} />
      ) : (
        <div className="comm_profile_layout">
          <Container>
            <div className="comm_border_box">
              <Row className="profile_main_row">
                <Col lg={3}>
                  <Sidebar />
                </Col>
                <Col lg={9}>
                  <div className="profile_main_page edit-profile-amin">
                    <div className="comm_profile_heading pf_heading">
                      Subscription
                    </div>
                    <section className="subscription_sec subscription_sec_profile">
                      <Container>
                        <Row className="row-gap-5">
                          <Col md={6}>
                            <div
                              className={`subscription_plan_box casual_plan ${
                                !isActive ? "active" : ""
                              }`}
                            >
                              {!isActive && (
                                <div className="active_label_wrap">
                                  <span className="active-label">Active</span>
                                </div>
                              )}
                              <h6 className="heading">
                                {homeData?.home2CardHeading1}
                              </h6>
                              <RenderHTMLList
                                htmlString={homeData?.home2CardDesc1}
                                heading={homeData?.home2CardSubHeading1}
                              />
                            </div>
                          </Col>
                          <Col md={6}>
                            <div
                              className={`subscription_plan_box pro_plan ${
                                isActive ? "active" : ""
                              }`}
                            >
                              {isActive && (
                                <span className="active-label">Active</span>
                              )}
                              <h6 className="heading">
                                <img
                                  src={Crown}
                                  className="img-fluid"
                                  alt="Crown"
                                />{" "}
                                {homeData?.home3CardHeading1}
                              </h6>
                              <RenderHTMLList
                                htmlString={homeData?.home3CardDesc1}
                                heading={homeData?.home3CardSubHeaing1}
                              />
                              <div className="upgrade_content">
                                <h4>
                                  {homeData?.home2CardSubHeading2}{" "}
                                  <span>
                                    {homeData?.home2CardSubHeading2Green}
                                  </span>
                                </h4>
                                {isActive ? (
                                  <button
                                    className="comm_btn_width mx-auto main-btn"
                                    onClick={() => setShowCancelModal(true)}
                                  >
                                    Cancel
                                  </button>
                                ) : (
                                  <button
                                    className="comm_btn_width mx-auto main-btn"
                                    onClick={() => {
                                      setCouponError(null); // Clear any previous errors
                                      setShowModal(true);
                                    }}
                                  >
                                    Subscribe Now
                                  </button>
                                )}
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Container>
                    </section>
                  </div>
                </Col>
              </Row>
            </div>
          </Container>
        </div>
      )}

      <Footer />

      {/* Checkout Modal */}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setCouponError(null); // Clear error when closing modal
          setCouponCode(""); // Clear coupon code when closing modal
        }}
        centered
        className="modal-delete-logout checkout_modal"
      >
        <Modal.Body className="p-4 text-center">
          <div className="inner-body-delete-logout">
            <div className="img-modal">
              <figure>
                <FaRegCreditCard size={40} />
              </figure>
            </div>
            <h4 className="heading">Proceed to Payment</h4>
            <div class="comn-class-inputs">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError(null); // Clear error when user types
                }}
                placeholder="Enter Coupon Code (Optional)"
                className={`form-control mb-3 ${
                  couponError ? "is-invalid" : ""
                }`}
              />
              {couponError && (
                <div className="invalid-feedback d-block">{couponError}</div>
              )}
            </div>

            <button
              className="main-btn mt-3 mx-auto"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
        className="modal-delete-logout"
      >
        <Modal.Body className="p-0">
          <div className="inner-body-delete-logout">
            <h4>Are you sure you want to cancel your subscription?</h4>
            <div className="logout_modal_btns">
              <button
                className="main-outline-btn"
                onClick={() => setShowCancelModal(false)}
              >
                No
              </button>
              <button className="main-btn" onClick={handleCancelSubscription}>
                Yes
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </div>
  );
}

export default Subscription;
