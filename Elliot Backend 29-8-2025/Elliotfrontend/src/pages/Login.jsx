import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import loginimg from "../Assets/Images/login.png";
import logo from "../Assets/Images/site_logo.png";
import { useForm } from "react-hook-form";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL_USER, LOGIN } from "../API";
import { useUser } from "../context/UserContext";
import GoogleLoginButton from "../components/GoogleLoginButton";

function Login() {
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
  const { fetchUserDetails } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission status
  const navigate = useNavigate();

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

    setIsSubmitting(true); // Set submitting to true

    const apiUrl = BASE_URL_USER + LOGIN;

    try {
      const response = await axios.post(apiUrl, data);
      if (response.status === 200 && response.data?.data?.access_token) {
        const { access_token, _id, full_name, otp_verified, email } =
          response.data.data;

        localStorage.setItem("token", access_token);
        localStorage.setItem("user_id", _id);
        localStorage.setItem("user_name", full_name);
        localStorage.setItem("user_email", email);

        await fetchUserDetails(access_token);
        // Check if user is verified
        if (otp_verified) {
          toast.success("Login successful!", {
            style: {
              fontSize: "18px",
            },
          });
          navigate("/");
        }
      } else {
        toast.error("Something went wrong. Please try again.", {
          style: {
            fontSize: "18px",
          },
        });
      }
    } catch (error) {
      if (error.response.status === 400) {
        if (error.response.data.error === "OTP_NOT_VERIFIED") {
          toast.info("Please verify your OTP to continue.", {
            style: {
              fontSize: "18px",
            },
          });
          navigate("/otp-verification");
        } else {
          const errMessage =
            error?.response?.data?.error_description ||
            "An error occurred. Please try again.";
          toast.error(errMessage, {
            style: {
              fontSize: "18px",
            },
          });
        }
      }
    } finally {
      setIsSubmitting(false); // Reset submitting status after the request
    }
  };

  return (
    <section className="login-section">
      <div className="container-fluid g-0">
        <Row className="row-min-h">
          <Col xl={6} lg={12} className="img-n">
            <div className="upper-fig-main-login">
              <figure className="login-img-main">
                <img src={loginimg} alt="" />
              </figure>
            </div>
          </Col>
          <Col xl={6} lg={12}>
            <div className="inner-login-mian">
              <div className="loginupper-right">
                <Link to="/">
                  <figure className="creden_page_logo">
                    <img src={logo} alt="" className="img-fluid" />
                  </figure>
                </Link>
                <h2>Login to your account</h2>

                  {/* Google Login Button */}
                <div className="mb-4">
                  <GoogleLoginButton 
                    isSubmitting={isSubmitting}
                    setIsSubmitting={setIsSubmitting}
                    classN="comn-class-inputs"
                    buttonText="continue_with"
                  />
                </div>
                
                <div className="divider">
                  <span>OR</span>
                </div>


                <Form onSubmit={handleSubmit(submitHandler)}>
                  <Row>
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
                                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                              message: "Please enter a valid email address",
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
                            })}
                          />
                          <div
                            onClick={togglePasswordVisibility}
                            className="eyeToggleBtn"
                          >
                            {showPassword ? <RiEyeLine /> : <RiEyeOffLine />}
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
                  <div className="login_remeber_row d-flex">
                    <Link className="forgot-link" to={"/forgotpassword"}>
                      Forgot Password?
                    </Link>
                  </div>
                  <Button
                    className="login-btn"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </Form>
                <div className="auth-bottom-link-sec">
                  <p>
                    Don’t have an account?{" "}
                    <Link to="/registration">Register</Link>
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

export default Login;
