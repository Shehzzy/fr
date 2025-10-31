import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Sidebar from "../components/Profile/SideBar";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { BASE_URL_USER, UPDATE_PROFILE, BASE_URL_IMAGE } from "../API";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCamera } from "react-icons/fa";
import Footer from "../components/Footer";
import { Container } from "react-bootstrap";
import Loader from "../components/Loader";
import { useUser } from "../context/UserContext";

function EditProfile() {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state for submit button
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { user, fetchUserDetails } = useUser();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      image: user?.image || null,
    },
  });

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  // Update Profile Logic
  const updateProfile = async (data) => {
    if (errors.name) return;

    setIsLoading(true); // Set loading to true while updating

    try {
      const formdata = new FormData();
      formdata.append("full_name", data.full_name.trim());
      formdata.append("language", "ENGLISH");

      if (image) {
        formdata.append("image", image);
      }

      const response = await axios.post(
        BASE_URL_USER + UPDATE_PROFILE,
        formdata,
        {
          headers: {
            Token: token,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 && response.data.status === true) {
        toast.success(response.data.message, {
          style: { fontSize: "18px" },
        });
        fetchUserDetails(); // Fetch updated user details
        navigate("/profile"); // Redirect to profile page
      }
    } catch (error) {
      const errMessage = error?.response?.data?.error_description;
      toast.error(errMessage || "Failed to update profile", {
        style: { fontSize: "18px" },
      });
    } finally {
      setIsLoading(false); // Set loading to false after the request is completed
    }
  };

  return (
    <div className="comm_page_wrapper">
      <Header />
      {isLoading ? (
        <Loader isLoading={true} />
      ) : (
        <div className="comm_profile_layout">
          <Container>
            <Row className="profile_main_row">
              <Col lg={3}>
                <Sidebar />
              </Col>
              <Col lg={9}>
                <div className="profile_main_page edit-profile-amin">
                  <div className="comm_profile_heading pf_heading">
                    Edit My Profile
                  </div>

                  <Form onSubmit={handleSubmit(updateProfile)}>
                    <div className="my-profile-left d-flex employer_logo_edit">
                      <div className="upper-name-profile-all">
                        <div className="profile-pic">
                          <label className="label" htmlFor="file">
                            <span className="glyphicon glyphicon-camera">
                              <FaCamera />
                            </span>
                          </label>
                          <figure className="profile-img-edit">
                            {/* Display User Image or Initials */}
                            {!user?.image ||
                            user?.image?.toLowerCase() === "null" ? (
                              <div className="user-initial">
                                {user?.full_name?.charAt(0)?.toUpperCase() ||
                                  "X"}
                              </div>
                            ) : (
                              <img
                                src={BASE_URL_IMAGE + user?.image}
                                alt="Profile"
                                className="img-fluid"
                              />
                            )}
                          </figure>
                        </div>
                      </div>
                      {/* Image Upload */}
                      <input
                        type="file"
                        id="file"
                        name="image"
                        accept="image/png, image/jpg, image/jpeg"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />
                    </div>

                    <Row className="edit_profile_form">
                      <Col md={6}>
                        <Form.Group
                          controlId="formGridPassword"
                          className="comn-class-inputs comn-class-inputs2"
                        >
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter Name"
                            {...register("full_name", {
                              required: "Please enter your name",
                              minLength: {
                                value: 3,
                                message:
                                  "Full name must be at least 3 characters long",
                              },
                              maxLength: {
                                value: 50,
                                message: "Name cannot exceed 50 characters",
                              },
                              pattern: {
                                value: /^[A-Za-z\s]+$/, // Allows only letters and spaces
                                message: "Only letters and spaces are allowed",
                              },
                            })}
                          />
                          {errors.full_name && (
                            <div style={{ color: "red", fontSize: "14px" }}>
                              {errors.full_name.message}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group
                          controlId="formGridEmail"
                          className="comn-class-inputs comn-class-inputs2"
                        >
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            {...register("email")}
                            placeholder="Enter Your Email Address"
                            // value={user?.email || ""}  // Disabled as it's not editable
                            style={{ cursor: "not-allowed" }}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="dash-pair-btns-comn d-flex align-items-center gap-3 mt-3">
                      <button
                        className="main-btn"
                        type="submit"
                        disabled={isLoading} // Disable button while submitting
                      >
                        {isLoading ? "Updating..." : "Update Profile"}
                      </button>
                      <Link className="main-outline-btn" to="/profile">
                        Cancel
                      </Link>
                    </div>
                  </Form>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default EditProfile;
