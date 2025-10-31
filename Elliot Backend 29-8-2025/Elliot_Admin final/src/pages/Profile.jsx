import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Form from "react-bootstrap/Form";
import Sidebar from "../components/Sidebar";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { IMAGE_URL, BASE_URL_ADMIN, ADMIN_DETAILS } from "../API";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { setUser } from "../redux/slices/AdminDetails";
import Loader from "../components/Loader";

function Profile() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userDetail, setUserDetail] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    getUserDetail();
  }, []);

  const getUserDetail = async () => {
    setIsLoading(true);
    try {
      const headers = { token };
      const response = await axios.get(BASE_URL_ADMIN + ADMIN_DETAILS, { headers });

      if (response.status === 200 && response.data.status === true) {
        const userDetail = response.data.data[0];
        setUserDetail(userDetail);
        dispatch(setUser(userDetail));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error_description || "An error occurred";
      toast.error(errorMessage);
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
              <div className="comn-back-white">
                <h3 className="heading-view-med">My Profile</h3>
                <div className="comm_form_border_box mt-4">
                  <section className="back-comn-img">
                    <div className="custm-container">
                      <div className="profile_main_page edit-profile-amin">
                        <Form>
                          <div className="my-profile-left d-flex employer_logo_edit">
                            <div className="profile-pic">
                              <figure className="profile-img-edit">
                                {!userDetail?.image ||
                                userDetail?.image?.toLowerCase() === "null" ? (
                                  <div className="user-initial-circle-profile">
                                    {userDetail?.name?.charAt(0)?.toUpperCase() || "X"}
                                  </div>
                                ) : (
                                  <img
                                    src={`${IMAGE_URL}/${userDetail.image}`}
                                    alt="Profile"
                                    className="img-fluid"
                                  />
                                )}
                              </figure>
                            </div>
                            <div className="pair-btns-comn d-flex align-items-center gap-3">
                              <Link
                                className="comn-btn-pair btn btn-primary"
                                to="/edit-profile"
                                state={{ ...userDetail }}
                              >
                                Edit Profile
                              </Link>
                            </div>
                          </div>

                          <Row>
                            <Col md={12}>
                              <Form.Group controlId="formGridName" className="comn-class-inputs">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Enter Your Full Name"
                                  value={userDetail?.name || ""}
                                  disabled
                                />
                              </Form.Group>
                            </Col>
                            <Col md={12}>
                              <Form.Group controlId="formGridEmail" className="comn-class-inputs">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                  type="email"
                                  placeholder="Enter Your Email Address"
                                  value={userDetail?.email || ""}
                                  disabled
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <div className="profile_main_btm_sec">
                            <div className="d-flex cmm_prf_btm_row profile_auto_pay_row">
                              <h6>Do you want to update your password?</h6>
                              <Link className="comn-btn-pair btn btn-primary" to="/change-password">
                                Change Password
                              </Link>
                            </div>
                          </div>
                        </Form>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
