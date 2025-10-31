import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Table, Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Loader from "../../components/Loader";
import { BASE_URL_ADMIN, DELETE_COUPON, GET_COUPON } from "../../API";
import moment from "moment";
import Delete1 from "../../Assets/Images/delete1.svg";
import Delt from "../../Assets/Images/del.svg";

const CouponList = () => {
  const token = localStorage.getItem("token");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    getCoupons();
  }, []);

  const getCoupons = async () => {
    setIsLoading(true);
    try {
      const headers = { token: token };
      const response = await axios.get(BASE_URL_ADMIN + GET_COUPON, {
        headers,
      });
      console.log(response);
      if (response.status === 200 && response.data.status === true) {
        setCoupons(response.data.data);
      }
    } catch (error) {
      toast.error("Error fetching coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const headers = { token: token };
    const data = { coupon_id: selectedCoupon.id };

    console.log(selectedCoupon);
    try {
      const response = await axios.post(BASE_URL_ADMIN + DELETE_COUPON, data, {
        headers,
      });
      if (response?.data?.code === 200) {
        toast.success(response?.data?.message);
        setShowModal(false);
        getCoupons();
      }
    } catch (error) {
      const errMessage = error?.response?.data?.error_description;
      toast.error(errMessage || "Error deleting coupon");
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const formattedDate = (date) => moment(date).format("DD-MM-YYYY | HH:mm");

  return (
    <>
      <Loader isLoading={isLoading} />
      <div className="container-fluid">
        <Header />
        <div className="row">
          <Sidebar />
          <div className="col-9 main-dash-left">
            <section className="back-dashboard-sec comn-dashboard-page">
              <div className="main-notification-messege">
                <div className="notifi-list d-flex">
                  <h6>Coupon Management</h6>
                  <div className="dropdowns-inner-list d-flex">
                    <Link
                      to="/admin/create-coupon"
                      className="add-notification-btn"
                    >
                      Create Promo Code
                    </Link>
                  </div>
                </div>
                <div className="notification-table pt-0">
                  <Table responsive>
                    <thead>
                      <tr className="head-class-td">
                        <th>Sr. No.</th>
                        <th>Coupon ID</th>
                        <th>Coupon Name</th>
                        <th>Coupon Type</th>

                        <th>Max Redemptions</th>
                        <th>Redeemed</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.length > 0 ? (
                        coupons.map((coupon, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{coupon.id}</td>
                            <td>{coupon.name}</td>
                            <td>{coupon.duration.toUpperCase() ?? "-"}</td>

                            <td>{coupon.max_redemptions}</td>
                            <td>{coupon.times_redeemed}</td>
                            <td>
                              <div className="d-flex table_action_btn_group">
                                <div
                                  className="view-icon delete"
                                  onClick={() => {
                                    setShowModal(true);
                                    setSelectedCoupon(coupon);
                                  }}
                                >
                                  <img
                                    src={Delete1}
                                    alt="Delete"
                                    className="img-fluid"
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center">
                            No coupons found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className="comm_modal cst_inner_wid_modal"
      >
        <Modal.Body className="p-0">
          <div className="inner-body">
            <div className="img-modal">
              <figure>
                <img src={Delt} alt="Delete" />
              </figure>
            </div>
            <h4 className="heading">Do you want to delete this coupon?</h4>
            <div className="upper-btns-modal-pair">
              <Button className="comn-modal-btns-blue" onClick={handleDelete}>
                Yes, Delete
              </Button>
              <Button
                className="comn-modal-btns-transparent"
                onClick={handleCloseModal}
              >
                No, Leave
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CouponList;
