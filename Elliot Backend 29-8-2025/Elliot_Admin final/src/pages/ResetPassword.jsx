import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import loginimg from "../Assets/Images/Phrase_box_Logo.jpg";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL_ADMIN } from "../API";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const securityCode = searchParams.get("security_code") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const newPassword = watch("newPassword");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLinkValid, setIsLinkValid] = useState(false);
  const [loading, setLoading] = useState(true);

  // Validate link on mount
  useEffect(() => {
    if (!securityCode.trim()) {
      setIsLinkValid(false);
      setLoading(false);
    } else {
      validateResetLink();
    }
  }, [securityCode]);

  const validateResetLink = async () => {
    try {
      const res = await axios.post(BASE_URL_ADMIN + "/validate-reset-link", {
        security_code: securityCode,
        language: "ENGLISH",
      });
      setIsLinkValid(res.status === 200);
    } catch {
      setIsLinkValid(false);
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = async (data) => {
    try {
      const formData = new FormData();
      formData.append("password", data.newPassword);
      formData.append("security_code", securityCode);
      formData.append("language", "ENGLISH");

      const res = await axios.post(
        BASE_URL_ADMIN + "/set-new-password",
        formData
      );
      toast.success(res?.data?.data || "Password reset successful");
      navigate("/login");
    } catch (error) {
      const msg =
        error?.response?.data?.error_description || "Something went wrong";
      toast.error(msg);
    }
  };

  return (
    <section className="login-section">
      <div className="container-fluid g-0">
        <Row className="row-min-h">
          <Col lg={6} className="img-n">
            <div className="upper-fig-main-login">
              <figure className="login-img-main">
                <img src={loginimg} alt="Login" />
              </figure>
            </div>
          </Col>

          <Col lg={6}>
            <div className="inner-login-mian">
              <div className="loginupper-right">
                <h2>Reset Password</h2>

                {loading ? (
                  <p>Validating your link...</p>
                ) : isLinkValid ? (
                  <Form onSubmit={handleSubmit(submitHandler)}>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="comn-class-inputs">
                          <Form.Label>New Password</Form.Label>
                          <div className="cstPassGroup">
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter New Password"
                              onKeyDown={(e) =>
                                e.key === " " && e.preventDefault()
                              }
                              {...register("newPassword", {
                                required: "This field is required",
                                pattern: {
                                  value: PASSWORD_REGEX,
                                  message:
                                    "Min 8 characters with upper, lower, number & special character",
                                },
                                maxLength: {
                                  value: 25,
                                  message: "Max 25 characters allowed",
                                },
                              })}
                            />
                            <div
                              onClick={() => setShowPassword(!showPassword)}
                              className="eyeToggleBtn"
                            >
                              {showPassword ? (
                                <AiOutlineEyeInvisible />
                              ) : (
                                <AiOutlineEye />
                              )}
                            </div>
                          </div>
                          {errors.newPassword && (
                            <p className="error">
                              {errors.newPassword.message}
                            </p>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group className="comn-class-inputs">
                          <Form.Label>Confirm New Password</Form.Label>
                          <div className="cstPassGroup">
                            <Form.Control
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm New Password"
                              onKeyDown={(e) =>
                                e.key === " " && e.preventDefault()
                              }
                              {...register("confirmPassword", {
                                required: "This field is required",
                                validate: (value) =>
                                  value === newPassword ||
                                  "Passwords do not match",
                              })}
                            />
                            <div
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="eyeToggleBtn"
                            >
                              {showConfirmPassword ? (
                                <AiOutlineEyeInvisible />
                              ) : (
                                <AiOutlineEye />
                              )}
                            </div>
                          </div>
                          {errors.confirmPassword && (
                            <p className="error">
                              {errors.confirmPassword.message}
                            </p>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button className="login-btn" type="submit">
                      Reset Password
                    </Button>
                  </Form>
                ) : (
                  <>
                    <h4 className="text-danger">
                      Your password reset link is invalid or expired.
                    </h4>
                    <p className="mt-3 fs-5">
                      You can request a new one{" "}
                      <Link to="/forgotpassword">here</Link>.
                    </p>
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}

export default ResetPassword;
