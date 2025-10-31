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
import { BASE_URL_USER, FORGOT_PASSWORD } from "../API";
import { useState } from "react";

function ForgetPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      language: "ENGLISH",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);  // State to track if the form is submitting
  const navigate = useNavigate();

  const submitHandler = async (data) => {
    if (isSubmitting) return;  // Prevent multiple submissions

    setIsSubmitting(true);  // Mark form as submitting

    try {
      const response = await axios.put(BASE_URL_USER + FORGOT_PASSWORD, data);

      if (response.status === 200) {
        toast.success("A password reset link has been sent to your email.", {
          style: {
            fontSize: "18px",
          },
        });
        navigate("/login");
      }
    } catch (error) {
      const errMessage = error?.response?.data?.error_description;

      toast.error(errMessage, {
        style: {
          fontSize: "18px",
        },
      });
    } finally {
      setIsSubmitting(false);  // Reset submitting state after the request is completed
    }
  };

  return (
    <section className="login-section">
      <div className="container-fluid g-0">
        <Row className="row-min-h">
          <Col xl={6} className="img-n">
            <div className="upper-fig-main-login">
              <figure className="login-img-main">
                <img src={loginimg} alt="Login Visual" />
              </figure>
            </div>
          </Col>
          <Col xl={6}>
            <div className="inner-login-mian">
              <div className="loginupper-right forgot">
                <Link to="/">
                  <figure className="creden_page_logo">
                    <img src={logo} alt="Site Logo" className="img-fluid" />
                  </figure>
                </Link>
                <h2>Forgot Password</h2>
                <p className="auth_page_sub_heading">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
                <Form onSubmit={handleSubmit(submitHandler)}>
                  <Row>
                    <Col md={12}>
                      <Form.Group
                        controlId="formGridEmail"
                        className="comn-class-inputs mb-0"
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
                              message: "Please enter valid email address.",
                            },
                          })}
                        />
                        {errors.email && (
                          <span className="error">{errors.email.message}</span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button 
                    className="login-btn" 
                    type="submit" 
                    disabled={isSubmitting}  // Disable the button while submitting
                  >
                    {isSubmitting ? "Sending..." : "Submit"}
                  </Button>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}

export default ForgetPassword;
