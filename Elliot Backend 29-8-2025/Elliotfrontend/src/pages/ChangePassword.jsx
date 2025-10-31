import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";

import Header from "../components/Header";
import SideBar from "../components/Profile/SideBar";
import Footer from "../components/Footer";

import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Container } from "react-bootstrap";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BASE_URL_USER, CHANGE_PASSWORD } from "../API";

function ChangePassword() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched", // Enable validation on blur
  });

  const toggleShowCurrent = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleShowNew = () => setShowNewPassword(!showNewPassword);
  const toggleShowConfirm = () => setShowConfirmPassword(!showConfirmPassword);

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    if (isSubmitting) return; // Prevent multiple form submissions

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${BASE_URL_USER}${CHANGE_PASSWORD}`,
        {
          old_password: data.old_password,
          new_password: data.newPassword,
          confirm_password: data.confirmPassword,
        },
        {
          headers: {
            Token: token,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Password changed successfully!", {
        style: { fontSize: "18px" },
      });
      navigate("/profile");
    } catch (error) {
      const errMessage = error?.response?.data?.error_description;
      toast.error(errMessage, {
        style: { fontSize: "18px" },
      });
    }
  };

  return (
    <>
      <div className="comm_page_wrapper">
        <Header />
        <div className="comm_profile_layout">
          <Container>
            <div className="comm_border_box">
              <Row className="profile_main_row">
                <Col lg={3}>
                  <SideBar />
                </Col>
                <Col lg={9}>
                  <div className="profile_main_page edit-profile-amin">
                    <div className="comm_profile_heading pf_heading">
                      Change Password
                    </div>

                    <Form
                      className="change_password_form"
                      onSubmit={handleSubmit(onSubmit)}
                      noValidate
                    >
                      <Row>
                        {/* Current Password */}
                        <Col md={6}>
                          <Form.Group
                            controlId="formCurrentPassword"
                            className="comn-class-inputs comn-class-inputs2"
                          >
                            <Form.Label>Current Password</Form.Label>
                            <div className="cstPassGroup">
                              <Form.Control
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter Your Current Password"
                                {...register("old_password", {
                                  required:
                                    "Please enter your current password",
                                })}
                              />
                              <div
                                onClick={toggleShowCurrent}
                                className="eyeToggleBtn"
                              >
                                {showCurrentPassword ? (
                                  <AiOutlineEye />
                                ) : (
                                  <AiOutlineEyeInvisible />
                                )}
                              </div>
                            </div>
                            {errors.old_password && (
                              <div style={{ color: "red", fontSize: "14px" }}>
                                {errors.old_password.message}
                              </div>
                            )}
                          </Form.Group>
                        </Col>

                        {/* New Password */}
                        <Col md={6}>
                          <Form.Group
                            controlId="formNewPassword"
                            className="comn-class-inputs comn-class-inputs2"
                          >
                            <Form.Label>New Password</Form.Label>
                            <div className="cstPassGroup">
                              <Form.Control
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter Your New Password"
                                {...register("newPassword", {
                                  required: "Please enter your new password",
                                  minLength: {
                                    value: 8,
                                    message:
                                      "New password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character",
                                  },
                                  pattern: {
                                    value:
                                      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                                    message:
                                      "New password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
                                  },
                                })}
                              />
                              <div
                                onClick={toggleShowNew}
                                className="eyeToggleBtn"
                              >
                                {showNewPassword ? (
                                  <AiOutlineEye />
                                ) : (
                                  <AiOutlineEyeInvisible />
                                )}
                              </div>
                            </div>
                            {errors.newPassword && (
                              <div style={{ color: "red", fontSize: "14px" }}>
                                {errors.newPassword.message}
                              </div>
                            )}
                          </Form.Group>
                        </Col>

                        {/* Confirm Password */}
                        <Col md={6}>
                          <Form.Group
                            controlId="formConfirmPassword"
                            className="comn-class-inputs comn-class-inputs2"
                          >
                            <Form.Label>Confirm New Password</Form.Label>
                            <div className="cstPassGroup">
                              <Form.Control
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Your New Password"
                                {...register("confirmPassword", {
                                  required:
                                    "Please enter your confirm new password",
                                  validate: (value) =>
                                    value === newPassword ||
                                    "Password and confirm password must be the same.",
                                })}
                              />
                              <div
                                onClick={toggleShowConfirm}
                                className="eyeToggleBtn"
                              >
                                {showConfirmPassword ? (
                                  <AiOutlineEye />
                                ) : (
                                  <AiOutlineEyeInvisible />
                                )}
                              </div>
                            </div>
                            {errors.confirmPassword && (
                              <div style={{ color: "red", fontSize: "14px" }}>
                                {errors.confirmPassword.message}
                              </div>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>

                      <div className="d-flex align-items-center gap-3 mt-3">
                        <button
                          className="main-btn comm_btn_width"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </Form>
                  </div>
                </Col>
              </Row>
            </div>
          </Container>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default ChangePassword;
