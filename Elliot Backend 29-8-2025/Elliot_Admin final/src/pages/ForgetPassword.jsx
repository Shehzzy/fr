import React, { useEffect, useState } from 'react'
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import loginimg from '../Assets/Images/Logos/jpg/site_logo.png';
import logo from '../Assets/Images/Logos/png/site_logo2.png'
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast } from 'react-toastify'
import { BASE_URL_ADMIN, FORGOT_PASSWORD} from '../API';
import Loader from '../components/Loader';

function ForgetPassword() {

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.put(BASE_URL_ADMIN + FORGOT_PASSWORD, data);
      if (response.status === 200 && response.data.status === true) {
        toast.success(response.data.data);
        navigate('/login')
      }
    }
    catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.error_description || "An error occurred";
        toast.error(errorMessage);
      } else {
        toast.error("An error occurred");
      }
    }
    finally { setIsLoading(false) }
  }


  return (
    <>
      <Loader isLoading={isLoading} />
      <section className="login-section">
        <div className="container-fluid g-0">
          {/* <Header /> */}
          <Row className='row-min-h'>
            <Col lg={6} className='img-n'>
              <div className="upper-fig-main-login" >
                <figure className='login-img-main'>
                  <img src={loginimg} alt="" />
                </figure>
              </div>
            </Col>
            <Col lg={6}>
              <div className="inner-login-mian">
                <div className="loginupper-right">
                  <figure className='creden_page_logo' onClick={()=> navigate('/')} style={{cursor: 'pointer'}}>
                    <img src={logo} alt="" className='img-fluid' />
                  </figure>
                  <h2>Forgot Password</h2>
                  <p className='forg-pass-text'>Don’t worry we will help you to recover your password</p>
                  <Form onSubmit={handleSubmit(submitHandler)}>
                    <Row>
                      <Col md={12}>
                        <Form.Group controlId="formGridEmail" className='comn-class-inputs'>
                          <Form.Label>email address</Form.Label>
                          <Form.Control type="email" placeholder="Enter Your Email Address" {...register('email', { required: true })} />
                          {errors.email && <span className='error'>E-mail is required</span>}
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button className='login-btn' type="submit">Reset Password</Button>
                    <div className="text-center mt-3">
                       <Link to="/" className='link_back_btn'>Back to Login</Link>
                    </div>
                  </Form>
                </div>
              </div>
            </Col>

          </Row>
        </div>
      </section>
    </>
  )
}

export default ForgetPassword