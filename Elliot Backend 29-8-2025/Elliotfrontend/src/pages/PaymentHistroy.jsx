import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Profile/SideBar";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Footer from "../components/Footer";
import { Container, Modal } from "react-bootstrap";
import Loader from "../components/Loader";
import axios from "axios";
import { BASE_URL_PAYMENT, GET_HISTORY } from "../API";
import CouponShower from "../components/CouponShower";

function PaymentHistory() {
  const [isLoading, setIsLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = (payment) => {
    setSelectedPayment(payment);
    setShow(true);
  };

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const response = await axios.get(`${BASE_URL_PAYMENT}${GET_HISTORY}`, {
          headers: {
            Token: token,
          },
        });
        console.log(response);

        // Assuming the response contains the data in the format { data: [...] }
        setPaymentHistory(response.data.data || []);
      } catch (error) {
        console.error("Error fetching payment history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [token]);

  const convertDate = (inputDate) => {
    const date = new Date(inputDate * 1000); // Convert Unix timestamp to milliseconds
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
  };

  return (
    <div className="comm_page_wrapper">
      <Header />
      <CouponShower />
      {isLoading ? (
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
                      Payment History
                    </div>
                    <div className="table-responsive">
                      <div className="table-main-listng payment_history_table">
                        <table>
                          <thead>
                            <tr>
                              <th>Status</th>
                              <th>Date</th>
                              <th>Price</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentHistory.length > 0 ? (
                              paymentHistory.map((payment, index) => (
                                <tr key={index}>
                                  <td
                                    className={
                                      payment.status === "paid"
                                        ? "completed"
                                        : "in-progress"
                                    }
                                  >
                                    {payment.status === "paid"
                                      ? "Completed"
                                      : "In Progress"}
                                  </td>
                                  <td>{convertDate(payment.created)}</td>
                                  <td>
                                    {payment.amount_paid
                                      ? `$${payment.amount_paid / 100}`
                                      : "N/A"}
                                  </td>
                                  <td className="view-detail-link">
                                    <Link onClick={() => handleShow(payment)}>
                                      View Details{" "}
                                      <i className="fa-solid fa-arrow-right"></i>
                                    </Link>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5">
                                  No payment history available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </Container>
        </div>
      )}

      <Footer />

      {/* Modal for Payment Detail */}
      <Modal
        show={show}
        onHide={handleClose}
        centered
        className="payment_detail_modal comm_modal"
      >
        <Modal.Body>
          {selectedPayment && (
            <div>
              <h4 className="modal_inner_heading">Payment Detail</h4>
              <div className="table-main-listng payment_detail_listing">
                <table>
                  <tbody>
                    <tr>
                      <th>Order ID</th>
                      <td>{selectedPayment.id}</td>
                    </tr>
                    <tr>
                      <th>Status</th>
                      <td>
                        {selectedPayment.status === "paid"
                          ? "Completed"
                          : "Pending"}
                      </td>
                    </tr>
                    <tr>
                      <th>Date</th>
                      <td>{convertDate(selectedPayment.created)}</td>
                    </tr>
                    <tr>
                      <th>Amount</th>
                      <td>
                        {selectedPayment.amount_paid
                          ? `$${selectedPayment.amount_paid / 100}`
                          : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <th>Invoice Number</th>
                      <td>{selectedPayment.number}</td>
                    </tr>
                    {/* <tr>
                      <th>Invoice PDF</th>
                      <td>
                        <a
                          href={selectedPayment.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download PDF
                        </a>
                      </td>
                    </tr> */}
                    <tr>
                      <th>Created Date</th>
                      <td>{convertDate(selectedPayment.created)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="logout_modal_btns">
                <button className="main-outline-btn" onClick={handleClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PaymentHistory;
