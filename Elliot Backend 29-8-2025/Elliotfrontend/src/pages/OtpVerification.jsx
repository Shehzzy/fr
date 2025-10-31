import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import loginimg from "../Assets/Images/login.png";
import logo from "../Assets/Images/site_logo.png";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL_USER, USER_CHECK_OTP, RESEND_OTP } from "../API";

function OtpVerification() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email_user");

  if (!email) {
    toast.error("Email not found, please register again.");
    navigate("/registration");
  }

  const language = "ENGLISH";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: email,
      language: language,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false); // New state for OTP resend

  // OTP Verification Handler
  const submitHandler = async (data) => {
    setIsSubmitting(true); // Disable button while submitting

    const apiUrl = BASE_URL_USER + USER_CHECK_OTP;

    try {
      const response = await axios.post(apiUrl, data);

      if (response.data && response.data.status) {
        toast.success("OTP Verified Successfully", {
          style: {
            fontSize: "18px",
          },
        });
        navigate("/login");
      } else {
        toast.error("Invalid OTP. Please try again.", {
          style: {
            fontSize: "18px",
          },
        });
      }
    } catch (error) {
      const errMessage = error?.response?.data?.error_description;
      toast.error(errMessage || "An error occurred while verifying OTP.", {
        style: {
          fontSize: "18px",
        },
      });
    } finally {
      setIsSubmitting(false); // Re-enable button after submission completes
    }
  };

  // Resend OTP Handler
  const resendOtpHandler = async () => {
    if (isResending) return; // Prevent multiple resend OTP requests

    setIsResending(true); // Disable resend while the request is being made

    const apiUrl = BASE_URL_USER + RESEND_OTP;

    try {
      const response = await axios.post(apiUrl, {
        email: email,
        language: language,
      });

      if (response.data && response.data.status) {
        toast.success("OTP Resent Successfully. Please check your email.", {
          style: {
            fontSize: "18px",
          },
        });
      } else {
        toast.error("Unable to resend OTP. Please try again.", {
          style: {
            fontSize: "18px",
          },
        });
      }
    } catch (error) {
      const errMessage = error?.response?.data?.error_description;
      toast.error(errMessage || "An error occurred while resending OTP.", {
        style: {
          fontSize: "18px",
        },
      });
    } finally {
      setIsResending(false); // Re-enable resend button after OTP is resent
    }
  };

  return (
    <section className="login-section">
      <div className="container-fluid g-0">
        <Row className="row-min-h">
          <Col xl={6} className="img-n">
            <div className="upper-fig-main-login">
              <figure className="login-img-main">
                <img src={loginimg} alt="" />
              </figure>
            </div>
          </Col>
          <Col xl={6}>
            <div className="inner-login-mian">
              <div className="loginupper-right">
                <Link to="/">
                  <figure className="creden_page_logo">
                    <img src={logo} alt="" className="img-fluid" />
                  </figure>
                </Link>
                <h2>Verify OTP</h2>
                <Form onSubmit={handleSubmit(submitHandler)}>
                  <Row>
                    <Col md={12}>
                      <Form.Group
                        controlId="formGridOtp"
                        className="comn-class-inputs"
                      >
                        <Form.Label>Enter OTP</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter OTP"
                          {...register("otp", { required: true, maxLength: 6 })}
                        />
                        {errors.otp && (
                          <span className="error">Please enter OTP. </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    className="login-btn"
                    type="submit"
                    disabled={isSubmitting} // Disable button during submission
                  >
                    {isSubmitting ? "Verifying..." : "Verify OTP"}
                  </Button>
                </Form>
                <div className="auth-bottom-link-sec">
                  <p>
                    Didn't receive an OTP?{" "}
                    <Link
                      to="#"
                      onClick={resendOtpHandler}
                      disabled={isResending} // Disable resend while it's being processed
                    >
                      {isResending ? "Resending..." : "Resend OTP"}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}

export default OtpVerification;
