import React, { useEffect, useState } from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL_ADMIN, LOGIN } from '../API';
import Loader from '../components/Loader';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import loginimg from '../Assets/Images/Logos/jpg/site_logo.png';
import logo from '../Assets/Images/Logos/jpg/site_logo.png';

function Login() {
  const token = localStorage.getItem('token');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      language: "ENGLISH"
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email_admin") || "";
    const storedPassword = localStorage.getItem("password_admin") || "";
    setValue('email_admin', storedEmail);
    setValue('password_admin', storedPassword);
    setRememberMe(!!(storedEmail && storedPassword));
  }, []);

  const submitHandler = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(BASE_URL_ADMIN + LOGIN, data);

      if (response.data.code === 200 && response.data.status === true) {
        toast.success(response.data.data.message);

        if (rememberMe) {
          localStorage.setItem("email_admin", data.email);
          localStorage.setItem("password_admin", data.password);
        } else {
          localStorage.removeItem("email_admin");
          localStorage.removeItem("password_admin");
        }

        const token = response.data.data.user_details.access_token;
        localStorage.setItem("token", token);
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error_description || "An error occurred. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  return (
    <>
      <Loader isLoading={isLoading} />
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
                  <figure
                    className="creden_page_logo"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={logo} alt="Phrase Logo" className="img-fluid" />
                  </figure>
                  <h2>Log in to your account</h2>
                  <p className="forg-pass-text">Welcome back! Please fill the information below:</p>

                  <Form onSubmit={handleSubmit(submitHandler)}>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="comn-class-inputs">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Enter your email address"
                            {...register('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^\S+@\S+\.\S+$/,
                                message: 'Invalid email format',
                              },
                            })}
                          />
                          {errors.email && <span className="error">{errors.email.message}</span>}
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group className="comn-class-inputs">
                          <Form.Label>Password</Form.Label>
                          <div className="cstPassGroup">
                            <Form.Control
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              onKeyDown={(e) => {
                                if (e.key === " ") e.preventDefault();
                              }}
                              {...register('password', {
                                required: 'Password is required',
                                maxLength: {
                                  value: 25,
                                  message: 'Password must be less than 25 characters',
                                },
                                pattern: {
                                  value: /^\S*$/,
                                  message: 'Password should not contain spaces',
                                },
                              })}
                            />
                            <div onClick={togglePasswordVisibility} className="eyeToggleBtn">
                              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                            </div>
                          </div>
                          {errors.password && (
                            <span className="error">{errors.password.message}</span>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="upper-main-forgot-pass d-flex justify-content-between">
                      <Form.Group className="custom-checkbox mb-0">
                        <Form.Check
                          type="checkbox"
                          className="ps-0"
                          label="Remember Me"
                          id="checkbox1"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                        />
                      </Form.Group>
                      <Link className="forgot-link" to="/forgotpassword">
                        Forgot Password?
                      </Link>
                    </div>

                    <Button className="login-btn" type="submit">
                      Login
                    </Button>
                  </Form>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
}

export default Login;
