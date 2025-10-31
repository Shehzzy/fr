import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useForm, Controller } from "react-hook-form";
import { ADD_COUPON, BASE_URL_ADMIN } from "../API";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";

const AddCoupon = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const TOKEN = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize expiry date in Pacific Time
  const [expiryDateTime, setExpiryDateTime] = useState(
    toZonedTime(new Date(), "America/Los_Angeles")
  );

  const defaultValues = location?.state?.data || { expiry: expiryDateTime };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm({ defaultValues });

  useEffect(() => {
    setValue("expiry", expiryDateTime, { shouldValidate: true });
  }, [expiryDateTime, setValue]);

  const handleExpiryChange = (date) => {
    const zonedDate = toZonedTime(date, "America/Los_Angeles");
    setExpiryDateTime(zonedDate);
  };

  const submitHandler = async (data) => {
    setIsLoading(true);

    const payload = {
      coupon_name: data.name,
      discount: parseFloat(data.off),
      type: data.type,
      validity: fromZonedTime(data.expiry, "America/Los_Angeles").toISOString(),
    };

    const headers = {
      token: TOKEN,
      "Content-Type": "application/json",
    };

    try {
      const response = await axios.post(BASE_URL_ADMIN + ADD_COUPON, payload, {
        headers,
      });

      if (response.data.code === 200 && response.data.status === true) {
        toast.success(response.data.message);
        navigate("/coupon");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      {isLoading && <Loader isLoading={isLoading} />}

      <section className="back-comn-img">
        <div className="custm-container">
          <Sidebar />

          <div className="col-9 main-dash-left">
            <section className="comn-dashboard-page">
              <h4 className="dash_page_heading">Add New Coupon</h4>
              <div className="edit-profile-amin">
                <Form onSubmit={handleSubmit(submitHandler)}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="comn-class-inputs">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Coupon Name"
                          {...register("name", {
                            required: "Please Enter Coupon Name",
                          })}
                        />
                        {errors.name && (
                          <span className="error">{errors.name.message}</span>
                        )}
                        <br />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="comn-class-inputs">
                        <Form.Label>
                          Type<span>*</span>
                        </Form.Label>
                        <Form.Select
                          aria-label="Default select example"
                          {...register("type", {
                            required: "Coupon type is required",
                          })}
                        >
                          <option value="">Enter Coupon Type</option>
                          <option value="flat">Flat</option>
                          <option value="percentage">Percentage</option>
                        </Form.Select>
                        {errors.type && (
                          <span className="error">{errors.type.message}</span>
                        )}
                        <br />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="comn-class-inputs">
                        <Form.Label>Off</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter Coupon Off"
                          {...register("off", {
                            required: "Please Enter Coupon Off",
                          })}
                        />
                        {errors.off && (
                          <span className="error">{errors.off.message}</span>
                        )}
                        <br />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="comn-class-inputs">
                        <Form.Label>Expiry</Form.Label>
                        <Controller
                          control={control}
                          name="expiry"
                          rules={{ required: "Please select expiry date" }}
                          render={({ field }) => (
                            <DatePicker
                              {...field}
                              selected={field.value || expiryDateTime}
                              onChange={(date) => {
                                handleExpiryChange(date);
                                field.onChange(date);
                              }}
                              showTimeSelect
                              timeZone="America/Los_Angeles"
                              dateFormat="MMMM d, yyyy h:mm aa"
                              minDate={toZonedTime(
                                new Date(),
                                "America/Los_Angeles"
                              )}
                              className={`form-control ${
                                errors.expiry ? "is-invalid" : ""
                              }`}
                              placeholderText="Select expiry date & time (PDT)"
                            />
                          )}
                        />
                        {errors.expiry && (
                          <span className="error">{errors.expiry.message}</span>
                        )}
                        <br />
                      </Form.Group>
                    </Col>
                  </Row>

                  <button className="add-notification-btn" type="submit">
                    Save Changes
                  </button>
                </Form>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
};

export default AddCoupon;
