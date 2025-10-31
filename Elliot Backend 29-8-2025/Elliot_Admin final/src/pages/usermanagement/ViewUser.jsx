import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Button from "react-bootstrap/Button";
import Delt from "../../Assets/Images/del.svg";
import { Modal } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL_ADMIN, DELETE_USER } from "../../API";
import Loader from "../../components/Loader";
import moment from "moment";

function ViewUser() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state;
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const headers = { token };
      const data = { _id: user._id };
      const response = await axios.post(BASE_URL_ADMIN + DELETE_USER, data, {
        headers,
      });

      if (response?.status === 200) {
        toast.success(response?.data?.message || "User deleted");
        setShow(false);
        navigate("/user-management");
      }
    } catch (error) {
      const errMessage =
        error?.response?.data?.error_description || "Failed to delete user";
      toast.error(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Loader isLoading={isLoading} />
      <div className="container-fluid">
        <Header />
        <div className="row">
          <Sidebar />
          <div className="col-9 main-dash-left">
            <section>
              <div className="row">
                <div className="comn-back-white">
                  <h3 className="heading-view-med">View User</h3>
                  <div className="patient-age-name cst_user_view d-flex">
                    <div className="patient-anme-view">
                      <h5>Full Name:</h5>
                      <p>{user?.full_name}</p>
                    </div>
                    <div className="patient-anme-view">
                      <h5>Email Address:</h5>
                      <p>{user?.email}</p>
                    </div>
                    {user?.created_at && (
                      <div className="patient-anme-view">
                        <h5>Account Created:</h5>
                        <p>
                          {moment(user.created_at).format("DD-MM-YYYY | HH:mm")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pair-btns-comn d-flex align-items-center gap-3">
                    <Button
                      className="comn-btn-pair"
                      type="button"
                      onClick={() => setShow(true)}
                    >
                      Delete User
                    </Button>
                    <Link
                      className="comn-btn-pair transparent"
                      to="/user-management"
                    >
                      Back to List
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        show={show}
        onHide={() => setShow(false)}
        centered
        className="comm_modal cst_inner_wid_modal"
      >
        <Modal.Body className="p-0">
          <div className="inner-body">
            <div className="img-modal">
              <figure>
                <img src={Delt} alt="Delete Icon" />
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
                onClick={() => setShow(false)}
              >
                No, Leave
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ViewUser;
