import React, { useEffect, useState } from "react";
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
import { BASE_URL_USER, REGISTER } from "../API";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function Registration() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      language: "ENGLISH",
    },
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("email_user");
    const storedPassword = localStorage.getItem("password_user");
    setValue("email_user", storedEmail);
    setValue("password_user", storedPassword);
  }, [setValue]);

  const submitHandler = async (data) => {
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true); // Set submitting to true to prevent multiple clicks

    localStorage.setItem("email_user", data.email);
    const apiUrl = BASE_URL_USER + REGISTER;

    try {
      const response = await axios.post(apiUrl, data);

      if (response.status === 200) {
        toast.success("Registration Success", {
          style: {
            fontSize: "18px",
          },
        });
        navigate("/otp-verification");
      }
    } catch (error) {
      const errMessage = error?.response?.data?.error_description;

      toast.error(errMessage, {
        style: {
          fontSize: "18px",
        },
      });
    } finally {
      setIsSubmitting(false); // Reset submitting state after the request is completed
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
                <h2>Register</h2>
                <Form onSubmit={handleSubmit(submitHandler)}>
                  <Row>
                    <Col md={12}>
                      <Form.Group
                        controlId="formGridName"
                        className="comn-class-inputs"
                      >
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Your Name"
                          {...register("full_name", {
                            required: "Please enter your name",
                            minLength: {
                              value: 3,
                              message:
                                "Name must be at least 3 characters long",
                            },
                            maxLength: {
                              value: 50,
                              message: "Name cannot exceed 50 characters",
                            },
                            pattern: {
                              value: /^[A-Za-z\s]+$/, // Only letters and spaces
                              message: "Only letters and spaces are allowed",
                            },
                          })}
                        />
                        {errors.full_name && (
                          <span className="error">
                            {errors.full_name.message}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group
                        controlId="formGridEmail"
                        className="comn-class-inputs"
                      >
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter Your Email Address"
                          {...register("email", {
                            required: "Please enter email address.",
                            pattern: {
                              value:
                                /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                              message: "Please enter a valid email address.",
                            },
                          })}
                        />
                        {errors.email && (
                          <span className="error">{errors.email.message}</span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group
                        controlId="formGridPassword"
                        className="comn-class-inputs"
                      >
                        <Form.Label>Password</Form.Label>
                        <div className="cstPassGroup">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Your Password"
                            {...register("password", {
                              required: "Please enter password.",
                              minLength: {
                                value: 8,
                                message:
                                  "Password must be at least 8 characters long",
                              },
                              pattern: {
                                value:
                                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                                message:
                                  "Password must include uppercase, lowercase, a number, and a special character.",
                              },
                            })}
                          />
                          <div
                            onClick={togglePasswordVisibility}
                            className="eyeToggleBtn"
                          >
                            {showPassword ? (
                              <AiOutlineEye />
                            ) : (
                              <AiOutlineEyeInvisible />
                            )}
                          </div>
                        </div>
                        {errors.password && (
                          <span className="error">
                            {errors.password.message}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    className="login-btn"
                    type="submit"
                    disabled={isSubmitting} // Disable button while submitting
                  >
                    {isSubmitting ? "Registering..." : "Register"}
                  </Button>
                </Form>
                <div className="auth-bottom-link-sec">
                  <p>
                    Already have an account? <Link to="/login">Login</Link>
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

export default Registration;
