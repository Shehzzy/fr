"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Table from "react-bootstrap/Table"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Form from "react-bootstrap/Form"
import Pagination from "react-bootstrap/Pagination"
import { toast } from "react-toastify"
import axios from "axios"
import { CiSearch } from "react-icons/ci"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import Loader from "../components/Loader"
import Delt from "../Assets/Images/del.svg"
import { MdDeleteForever } from "react-icons/md"
import { FiEdit } from "react-icons/fi";
import { BASE_URL_ADMIN } from "../API"
const CouponWritings = () => {
    const ITEMS_PER_PAGE = 5
    const navigate = useNavigate()
    const TOKEN = localStorage.getItem("token")
    const [isLoading, setIsLoading] = useState(false)
    const [coupons, setCoupons] = useState([])
    const [filteredCoupons, setFilteredCoupons] = useState([])
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedCoupon, setSelectedCoupon] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")

    // Fetch all coupon writings
    const fetchCoupons = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get(`${BASE_URL_ADMIN}/get-coupon-writings`, {
                headers: { token: TOKEN },
            })

            if (response.data.code === 200 && response.data.status === true) {
                setCoupons(response.data.data || [])
            }
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token")
                toast.error("Session expired. Please login again.")
                navigate("/login")
            } else {
                const errorMessage = error.response?.data?.error || "Failed to fetch coupons"
                toast.error(errorMessage)
            }
        } finally {
            setIsLoading(false)
        }
    }

    // Filter and paginate coupons
    const filterCoupons = (query) => {
        const lowerQuery = query.toLowerCase()
        const filtered = coupons.filter(
            (coupon) =>
                coupon?.title?.toLowerCase().includes(lowerQuery) || coupon?.description?.toLowerCase().includes(lowerQuery),
        )
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        setFilteredCoupons(filtered.slice(start, start + ITEMS_PER_PAGE))
    }

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value)
        setCurrentPage(1)
    }

    // Toggle coupon status
    const toggleStatus = async (couponId, currentStatus) => {
        try {
            const response = await axios.patch(
                `${BASE_URL_ADMIN}/toggle-coupon-writing-status/${couponId}`,
                {},
                { headers: { token: TOKEN } },
            )

            if (response.data.code === 200 && response.data.status === true) {
                toast.success(response.data.message)
                fetchCoupons() // Refresh the list
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to update status"
            toast.error(errorMessage)
        }
    }

    // Delete coupon
    const deleteCoupon = async () => {
        if (!selectedCoupon) return

        try {
            const response = await axios.delete(`${BASE_URL_ADMIN}/delete-coupon-writing/${selectedCoupon._id}`, {
                headers: { token: TOKEN },
            })

            if (response.data.code === 200 && response.data.status === true) {
                toast.success(response.data.message)
                setShowDeleteModal(false)
                setSelectedCoupon(null)
                fetchCoupons() // Refresh the list
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to delete coupon"
            toast.error(errorMessage)
        }
    }

    // Handle edit navigation
    const handleEdit = (coupon) => {
        navigate("/coupon-writing", { state: { data: coupon } })
    }

    // Handle delete modal
    const handleDeleteClick = (coupon) => {
        setSelectedCoupon(coupon)
        setShowDeleteModal(true)
    }

    // Calculate total pages
    const totalFilteredCoupons = coupons.filter(
        (coupon) =>
            coupon?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            coupon?.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    ).length
    const totalPages = Math.ceil(totalFilteredCoupons / ITEMS_PER_PAGE)

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    useEffect(() => {
        if (!TOKEN) {
            navigate("/login")
            return
        }
        fetchCoupons()
    }, [])

    useEffect(() => {
        filterCoupons(searchQuery)
    }, [searchQuery, coupons, currentPage])

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
                                <div className="notifi-list d-flex justify-content-between align-items-center">
                                    <h6>Coupon Writings Management</h6>
                                    <div className="dropdowns-inner-list d-flex gap-3">
                                        <div className="icon-search-main">
                                            <CiSearch />
                                            <Form.Control
                                                type="text"
                                                placeholder="Search for Coupons"
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                            />
                                        </div>
                                        <Button className="add-notification-btn" style={{
                                            width: "100px",
                                            fontSize: "15px"
                                        }} onClick={() => navigate("/coupon-writing")}>
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                <div className="notification-table pt-0">
                                    {filteredCoupons.length === 0 && !isLoading ? (
                                        <div className="text-center py-5">
                                            <h5 className="text-muted">
                                                {searchQuery ? "No coupons found matching your search" : "No coupon writings found"}
                                            </h5>
                                            <p className="text-muted">
                                                {searchQuery
                                                    ? "Try adjusting your search terms"
                                                    : 'Click "Add New Coupon" to create your first coupon.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <thead>
                                                <tr className="head-class-td">
                                                    <th>Sr. No.</th>
                                                    <th>Title</th>
                                                    <th>Description</th>
                                                    <th>Status</th>
                                                    <th>Created Date</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCoupons.map((coupon, index) => (
                                                    <tr key={coupon._id}>
                                                        <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                                        <td>
                                                            <strong className="text-primary">{coupon.title}</strong>
                                                        </td>
                                                        <td>
                                                            <div style={{ maxWidth: "300px" }}>
                                                                {coupon.description.length > 80
                                                                    ? `${coupon.description.substring(0, 80)}...`
                                                                    : coupon.description}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`badge ${coupon.isActive ? "bg-success" : "bg-secondary"} cursor-pointer`}
                                                                onClick={() => toggleStatus(coupon._id, coupon.isActive)}
                                                                style={{ cursor: "pointer" }}
                                                            >
                                                                {coupon.isActive ? "Active" : "Inactive"}
                                                            </span>
                                                        </td>
                                                        <td>{formatDate(coupon.createdAt)}</td>
                                                        <td>
                                                            <div className="d-flex table_action_btn_group">
                                                                <Button
                                                                    variant="dark"
                                                                    onClick={() => handleEdit(coupon)}
                                                                    title="Edit Coupon"
                                                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                                                    style={{ width: "34px", height: "34px" }}
                                                                >
                                                                    <FiEdit size={20} />
                                                                </Button>
                                                                <Button
                                                                    variant="danger"
                                                                    onClick={() => handleDeleteClick(coupon)}
                                                                    title="Delete Coupon"
                                                                    className="rounded-circle d-flex align-items-center justify-content-center p-2"
                                                                    style={{ width: "34px", height: "34px" }}
                                                                >
                                                                    <MdDeleteForever size={20} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}

                                    {totalPages > 1 && (
                                        <div className="cstm_pagination text-center">
                                            <Pagination>
                                                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                                <Pagination.Prev
                                                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                                                    disabled={currentPage === 1}
                                                />
                                                {Array.from({ length: totalPages }).map((_, index) => (
                                                    <Pagination.Item
                                                        key={index + 1}
                                                        active={index + 1 === currentPage}
                                                        onClick={() => setCurrentPage(index + 1)}
                                                    >
                                                        {index + 1}
                                                    </Pagination.Item>
                                                ))}
                                                <Pagination.Next
                                                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                />
                                                <Pagination.Last
                                                    onClick={() => setCurrentPage(totalPages)}
                                                    disabled={currentPage === totalPages}
                                                />
                                            </Pagination>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
                <Modal
                    show={showDeleteModal}
                    onHide={() => setShowDeleteModal(false)}
                    centered
                    className="comm_modal cst_inner_wid_modal"
                >
                    <Modal.Body className="p-0">
                        <div className="inner-body">
                            <div className="img-modal">
                                <figure>
                                    <img src={Delt || "/placeholder.svg"} alt="Delete Coupon" />
                                </figure>
                            </div>
                            <h4 className="heading">Do you want to delete this coupon writing?</h4>
                            {selectedCoupon && (
                                <div className="text-center mb-5">
                                    <strong style={{
                                        fontSize: "18px"
                                    }} className="text-primary">{selectedCoupon.title}</strong>
                                </div>
                            )}
                            <div className="upper-btns-modal-pair">
                                <Button className="comn-modal-btns-blue" onClick={deleteCoupon}>
                                    Yes, Delete
                                </Button>
                                <Button className="comn-modal-btns-transparent" onClick={() => setShowDeleteModal(false)}>
                                    No, Leave
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </>
    )
}

export default CouponWritings
