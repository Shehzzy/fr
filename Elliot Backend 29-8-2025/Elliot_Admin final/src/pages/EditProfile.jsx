import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Form from "react-bootstrap/Form";
import Sidebar from "../components/Sidebar";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { BASE_URL_ADMIN,UPDATE_PROFILE, IMAGE_URL } from "../API";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

function EditProfile() {
  const location = useLocation();
  const userDetail = location.state;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [name, setName] = useState(userDetail?.name || "");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = async () => {
    if (error !== "") return;

    if (name.trim().length < 3) {
      setError("Full name must be at least 3 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const headers = { token };
      const formdata = new FormData();
      formdata.append("name", name.trim());

      if (image) {
        formdata.append("image", image);
      }

      const response = await axios.post(
        BASE_URL_ADMIN + UPDATE_PROFILE,
        formdata,
        { headers }
      );

      if (response.status === 200 && response.data.status === true) {
        toast.success(response.data.message);
        navigate("/profile");
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.error_description || "An error occurred";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    if (!value.trim()) {
      setError("Please enter full name.");
    } else if (value.length > 50) {
      setError("Value cannot exceed 50 characters.");
    } else if (/^\s|\s$/.test(value) || /\s{2,}/.test(value)) {
      setError("No leading, trailing, or multiple spaces allowed.");
    } else if (value.trim().length < 3) {
      setError("Full name must be at least 3 characters long.");
    } else {
      setError("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
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
            <Breadcrumb
              className="cstm_bredcrumb"
              listProps={{ className: "breadcrumb-custom-separator" }}
            >
              <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/profile" }}>
                My Profile
              </Breadcrumb.Item>
              <Breadcrumb.Item active>Edit Profile</Breadcrumb.Item>
            </Breadcrumb>
            <section>
              <div className="comn-back-white">
                <h3 className="heading-view-med">Update Profile</h3>
                <div className="comm_form_border_box mt-4">
                  <section className="back-comn-img">
                    <div className="custm-container">
                      <div className="edit-profile-amin">
                        {/* Profile Picture Display */}
                        <div className="profile-picture-preview">
                          <label
                            htmlFor="file"
                            className="profile-img-edit-label"
                          >
                            <div className="profile-img-edit">
                              {!userDetail?.image ||
                              userDetail?.image?.toLowerCase() === "null" ? (
                                <div className="user-initial-circle-profile">
                                  {userDetail?.name?.charAt(0)?.toUpperCase() ||
                                    "X"}
                                </div>
                              ) : (
                                <img
                                  src={`${IMAGE_URL}/${userDetail.image}`}
                                  alt="Profile"
                                  className="img-fluid profile-img-preview"
                                />
                              )}
                            </div>
                          </label>

                          {/* Hidden File Input */}
                          <Form.Control
                            id="file"
                            type="file"
                            name="image"
                            accept="image/png, image/jpg, image/jpeg"
                            onChange={handleImageChange}
                            className="m-2 d-block"
                          />
                        </div>

                        {/* Form */}
                        <Form>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="comn-class-inputs">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Enter Your Full Name"
                                  value={name}
                                  onChange={handleNameChange}
                                />
                                {error && (
                                  <div
                                    style={{ color: "red", fontSize: "14px" }}
                                  >
                                    {error}
                                  </div>
                                )}
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="comn-class-inputs">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                  type="email"
                                  placeholder="Enter Your Email Address"
                                  defaultValue={userDetail?.email}
                                  disabled
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <div className="pair-btns-comn d-flex align-items-center gap-3 mt-3">
                            <Button
                              className="comn-btn-pair"
                              onClick={updateProfile}
                            >
                              Update Profile
                            </Button>
                            <Button
                              className="comn-btn-pair back-white-btn"
                              onClick={() => navigate("/profile")}
                            >
                              Discard
                            </Button>
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

export default EditProfile;
