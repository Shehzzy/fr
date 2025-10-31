"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Form from "react-bootstrap/Form"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Button from "react-bootstrap/Button"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import axios from "axios"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import Loader from "../components/Loader"
import { BASE_URL_ADMIN } from "../API"
const CouponWriting = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const TOKEN = localStorage.getItem("token")
    const [isLoading, setIsLoading] = useState(false)

    const defaultValues = location?.state?.data || {}
    const isEditMode = !!defaultValues._id

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({ defaultValues })

    const submitHandler = async (data) => {
        setIsLoading(true)

        const payload = {
            title: data.title,
            description: data.description,
            isActive: data.isActive || true,
        }

        const headers = {
            token: TOKEN,
            "Content-Type": "application/json",
        }

        try {
            const url = isEditMode
                ? `${BASE_URL_ADMIN}/update-coupon-writing/${defaultValues._id}`
                : `${BASE_URL_ADMIN}/create-coupon-writing`

            const method = isEditMode ? "put" : "post"
            const response = await axios[method](url, payload, { headers })

            if (response.data.code === 200 && response.data.status === true) {
                toast.success(response.data.message)
                navigate("/coupon-writings")
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || "An error occurred"
            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Loader isLoading={isLoading} />
            <div className="container-fluid">
                <Header />
                <div className="row">
                    <Sidebar />
                    <div className="col-9 main-dash-left">
                        <section className="back-dashboard-sec comn-dashboard-page">
                            <div className="main-notification-messege">
                                <div className="notifi-list d-flex justify-content-between align-items-center mb-4">
                                    <h6>{isEditMode ? "Edit Coupon Writing" : "Add New Coupon Writing"}</h6>
                                    <Button
                                        variant="outline-secondary"
                                        style={{
                                            width: "100px",
                                            height: "30px"
                                        }}
                                        onClick={() => navigate("/coupon-writings")}
                                        className="d-flex align-items-center justify-content-center gap-2"
                                    >
                                        <i className="fas fa-arrow-left"></i>
                                        Back to List
                                    </Button>
                                </div>

                                <div className="notification-table pt-0">
                                    <div className="edit-profile-amin">
                                        <Form onSubmit={handleSubmit(submitHandler)}>
                                            <Row>
                                                <Col md={12}>
                                                    <Form.Group className="comn-class-inputs mb-4">
                                                        <Form.Label className="fw-semibold">
                                                            Title<span className="text-danger">*</span>
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Enter Coupon Title (e.g., Premium Service Discount)"
                                                            className="form-control-lg"
                                                            {...register("title", {
                                                                required: "Please Enter Coupon Title",
                                                            })}
                                                        />
                                                        {errors.title && <div className="text-danger mt-1 small">{errors.title.message}</div>}
                                                    </Form.Group>
                                                </Col>

                                                <Col md={12}>
                                                    <Form.Group className="comn-class-inputs mb-4">
                                                        <Form.Label className="fw-semibold">
                                                            Coupon Description<span className="text-danger">*</span>
                                                        </Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={5}
                                                            placeholder="Enter coupon description (e.g., Save 30% of the premium services with the promo code WIN!)"
                                                            className="form-control-lg"
                                                            {...register("description", {
                                                                required: "Please Enter Coupon Description",
                                                                minLength: {
                                                                    value: 10,
                                                                    message: "Description must be at least 10 characters long",
                                                                },
                                                            })}
                                                        />
                                                        {errors.description && (
                                                            <div className="text-danger mt-1 small">{errors.description.message}</div>
                                                        )}
                                                    </Form.Group>
                                                </Col>

                                                <Col md={6}>
                                                    <Form.Group className="comn-class-inputs mb-4">
                                                        <Form.Label className="fw-semibold">Status</Form.Label>
                                                        <Form.Select
                                                            aria-label="Status select"
                                                            className="form-control-lg"
                                                            {...register("isActive")}
                                                        >
                                                            <option value={true}>Active</option>
                                                            <option value={false}>Inactive</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <div className="d-flex gap-3 mt-4">
                                                <button className="add-notification-btn d-flex justify-content-center" type="submit" disabled={isLoading}>
                                                    {isLoading ? (
                                                        <>
                                                            <span
                                                                className="spinner-border spinner-border-sm me-2"
                                                                role="status"
                                                                aria-hidden="true"
                                                            ></span>
                                                            {isEditMode ? "Updating..." : "Saving..."}
                                                        </>
                                                    ) : isEditMode ? (
                                                        "Update Coupon Writing"
                                                    ) : (
                                                        "Save Coupon Writing"
                                                    )}
                                                </button>
                                                <Button variant="outline-secondary" type="button" onClick={() => navigate("/coupon-writings")}
                                                    style={{
                                                        fontSize: "15px"
                                                    }}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CouponWriting
