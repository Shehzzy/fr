import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Sidebar from "../components/Sidebar";
import card2 from "../Assets/Images/admin_card1.svg";
import HalfEye from "../Assets/Images/half_eye.svg";
import Delete1 from "../Assets/Images/delete1.svg";
import Delt from "../Assets/Images/del.svg";
import { BASE_URL_ADMIN, DELETE_USER, GET_DASHBOARD_DETAILS } from "../API";
import { toast } from "react-toastify";
import axios from "axios";
import moment from "moment";
import Loader from "../components/Loader";
import Breadcrumb from "react-bootstrap/Breadcrumb";

function Dashboard() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [dashboardDetails, setDashboardDetails] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedData, setSelectedData] = useState(null);

  const handleClose = () => setShow(false);

  const formattedDate = (date) => moment(date).format("DD-MM-YYYY | HH:mm");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    getDashboardDetails();
  }, []);

  const getDashboardDetails = async () => {
    setIsLoading(true);
    try {
      const headers = { token };
      const response = await axios.get(BASE_URL_ADMIN + GET_DASHBOARD_DETAILS, {
        headers,
      });

      if (response.status === 200 && response.data.success === true) {
        const userData = response.data.users;
        setDashboardDetails(userData);
        setUsers(userData.slice(0, 4));
      }
    } catch (error) {
      // ✅ Handle token expiration
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (error.response?.data?.error_description) {
        toast.error(error.response.data.error_description);
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const headers = { Token: token };
      const data = { _id: selectedData._id };

      const response = await axios.delete(
        BASE_URL_ADMIN + DELETE_USER(selectedData._id),
        {
          headers,
        }
      );

      if (response.status === 200) {
        toast.success(response?.data?.message);
        setShow(false);
        getDashboardDetails();
      }
    } catch (error) {
      const errMessage =
        error?.response?.data?.error_description || "Failed to delete user";
      toast.error(errMessage);
    }
  };

  function formatNumber(value) {
    return value >= 1000 ? (value / 1000).toFixed(2) + " K" : value?.toFixed(1);
  }

  return (
    <>
      <Loader isLoading={isLoading} />
      <div className="container-fluid">
        <Header />
        <div className="row">
          <Sidebar />
          <div className="col-9 main-dash-left">
            <Breadcrumb className="cstm_bredcrumb">
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            </Breadcrumb>

            <section className="back-dashboard-sec comn-dashboard-page">
              <div className="cards-dashboard">
                <div className="row row-gap-3">
                  <div className="col-lg-3 col-md-6">
                    <div className="inner-dashboard-card">
                      <div className="ing-sec-acrd-dash d-flex">
                        <figure>
                          <img src={card2} alt="Total Users" />
                        </figure>
                        <div className="text-disc-card">
                          <p>Total Users</p>
                          <h4>{dashboardDetails.length}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="main-notification-messege">
                <div className="notifi-list d-flex">
                  <h6>User Management</h6>
                  <div className="dropdowns-inner-list d-flex">
                    <Link
                      className="add-notification-btn"
                      to="/user-management"
                    >
                      View All
                    </Link>
                  </div>
                </div>

                <div className="notification-table pt-0">
                  <Table>
                    <thead>
                      <tr className="head-class-td">
                        <th>Sr. no.</th>
                        <th>Name</th>
                        <th>Email Address</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((user, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{user?.full_name}</td>
                            <td>{user?.email}</td>
                            <td>
                              <div className="d-flex table_action_btn_group">
                                {/* <div
                                  onClick={() =>
                                    navigate("/view-management", {
                                      state: { data: user },
                                    })
                                  }
                                >
                                  <Link className="view-icon">
                                    <img
                                      src={HalfEye}
                                      alt="View"
                                      className="img-fluid"
                                    />
                                  </Link>
                                </div> */}
                                <Link
                                  className="view-icon delete"
                                  onClick={() => {
                                    setShow(true);
                                    setSelectedData(user);
                                  }}
                                >
                                  <img
                                    src={Delete1}
                                    alt="Delete"
                                    className="img-fluid"
                                  />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center">
                            No data found
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

        {/* Delete Confirmation Modal */}
        <Modal
          show={show}
          onHide={handleClose}
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
              <h4 className="heading">
                Do you want to delete this user’s account?
              </h4>
              <div className="upper-btns-modal-pair">
                <Button className="comn-modal-btns-blue" onClick={handleDelete}>
                  Yes, Delete
                </Button>
                <Button
                  className="comn-modal-btns-transparent"
                  onClick={handleClose}
                >
                  No, Leave
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}

export default Dashboard;
