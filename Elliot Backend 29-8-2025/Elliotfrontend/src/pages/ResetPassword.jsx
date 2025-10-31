import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Container } from "react-bootstrap";
import Footer from "../components/Footer";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BASE_URL_USER, RESET_PASSWORD } from "../API";
import axios from "axios";
import { toast } from "react-toastify";

function ResetPassword() {
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const securityCode = searchParams.get("security_code");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      language: "ENGLISH",
    },
  });

  const newPassword = watch("newPassword");

  const togglePasswordVisibility1 = () => {
    setShowPassword1(!showPassword1);
  };

  const togglePasswordVisibility2 = () => {
    setShowPassword2(!showPassword2);
  };

  const handleUpdate = async (data) => {
    try {
      await axios.post(`${BASE_URL_USER}${RESET_PASSWORD}`, {
        security_code: securityCode,
        password: data.newPassword,
      });

      toast.success("Password reset successfully.", {
        style: {
          fontSize: "18px",
        },
      });
      navigate("/login");
    } catch (error) {
      const errMessage = error?.response?.data?.error_description;
      toast.error(errMessage, {
        style: {
          fontSize: "18px",
        },
      });
    }
  };

  const strongPasswordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?])[^\s]{8,}$/;

  return (
    <div className="comm_page_wrapper">
      {/* <Header /> */}
      <div className="comm_profile_layout">
        <Container>
          <div className="comm_border_box">
            <Row className="profile_main_row">
              <Col lg={9}>
                <div className="profile_main_page edit-profile-amin">
                  <div className="comm_profile_heading pf_heading">
                    Reset Password
                  </div>

                  <Form
                    className="change_password_form"
                    onSubmit={handleSubmit(handleUpdate)}
                  >
                    <Row>
                      <Col md={6}>
                        <Form.Group
                          controlId="formNewPassword"
                          className="comn-class-inputs comn-class-inputs2"
                        >
                          <Form.Label>New Password</Form.Label>
                          <div className="cstPassGroup">
                            <Form.Control
                              type={showPassword1 ? "text" : "password"}
                              placeholder="Enter Your New Password"
                              {...register("newPassword", {
                                required: "Please enter new password.",
                                pattern: {
                                  value: strongPasswordPattern,
                                  message:
                                    "New password must be at least 8 characters long with uppercase, lowercase, number, special character, and no spaces.",
                                },
                              })}
                            />
                            <div
                              onClick={togglePasswordVisibility1}
                              className="eyeToggleBtn"
                            >
                              {showPassword1 ? (
                                <AiOutlineEyeInvisible />
                              ) : (
                                <AiOutlineEye />
                              )}
                            </div>
                          </div>
                          {errors.newPassword && (
                            <small className="text-danger">
                              {errors.newPassword.message}
                            </small>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group
                          controlId="formConfirmPassword"
                          className="comn-class-inputs comn-class-inputs2"
                        >
                          <Form.Label>Confirm New Password</Form.Label>
                          <div className="cstPassGroup">
                            <Form.Control
                              type={showPassword2 ? "text" : "password"}
                              placeholder="Enter Your Confirm Password"
                              {...register("confirmPassword", {
                                required: "Please enter confirm new password.",
                                validate: (value) =>
                                  value === newPassword ||
                                  "New password and confirm new password does not match.",
                              })}
                            />
                            <div
                              onClick={togglePasswordVisibility2}
                              className="eyeToggleBtn"
                            >
                              {showPassword2 ? (
                                <AiOutlineEyeInvisible />
                              ) : (
                                <AiOutlineEye />
                              )}
                            </div>
                          </div>
                          {errors.confirmPassword && (
                            <small className="text-danger">
                              {errors.confirmPassword.message}
                            </small>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex align-items-center gap-3 mt-3">
                      <button className="main-btn comm_btn_width" type="submit">
                        Update
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
  );
}

export default ResetPassword;
