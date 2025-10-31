import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Sidebar from "../../components/Sidebar";
import HalfEye from "../../Assets/Images/half_eye.svg";
import Delete1 from "../../Assets/Images/delete1.svg";
import Delt from "../../Assets/Images/del.svg";
import Pagination from "react-bootstrap/Pagination";
import { CiSearch } from "react-icons/ci";
import { BASE_URL_ADMIN, DELETE_USER, GET_DASHBOARD_DETAILS } from "../../API";
import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";
import Loader from "../../components/Loader";

function UserManagement() {
  const ITEMS_PER_PAGE = 5;
  const [show, setShow] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const formattedDate = (date) => moment(date).format("DD-MM-YYYY | HH:mm");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    getUsers();
  }, []);

  useEffect(() => {
    filterList(searchQuery);
  }, [searchQuery, users, currentPage]);

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const headers = { token };
      const response = await axios.get(BASE_URL_ADMIN + GET_DASHBOARD_DETAILS, {
        headers,
      });

      if (response.status === 200 && response.data.success === true) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        const errorMessage =
          error.response?.data?.error_description || "An error occurred";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterList = (query) => {
    const lowerQuery = query.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user?.full_name?.toLowerCase().includes(lowerQuery) ||
        user?.email?.toLowerCase().includes(lowerQuery)
    );
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    setFilteredList(filtered.slice(start, start + ITEMS_PER_PAGE));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!selectedData?._id) return;

    try {
      const headers = { token };
      const response = await axios.delete(
        BASE_URL_ADMIN + DELETE_USER(selectedData._id),
        {
          headers,
        }
      );

      if (response.status === 200 && response.data.status === true) {
        toast.success(response.data.message || "User deleted successfully");
        setShow(false);
        getUsers(); // Refresh list
      } else {
        toast.error(response.data.error_description || "Failed to delete user");
      }
    } catch (error) {
      const errMessage =
        error?.response?.data?.error_description || "Failed to delete user";
      toast.error(errMessage);
    }
  };

  const totalPages = Math.ceil(
    users.filter(
      (user) =>
        user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ).length / ITEMS_PER_PAGE
  );

  function convertTimestampToDate(timestamp) {
    const timestampInt = parseInt(timestamp, 10);
    const date = new Date(timestampInt);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
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
                <div className="notifi-list d-flex">
                  <h6>User Management</h6>
                  <div className="dropdowns-inner-list d-flex">
                    <div className="icon-search-main">
                      <CiSearch />
                      <Form.Control
                        type="text"
                        placeholder="Search for User"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="notification-table pt-0">
                  <Table>
                    <thead>
                      <tr className="head-class-td">
                        <th>Sr. No.</th>
                        <th>Name</th>
                        <th>Email Address</th>
                        <th>Account Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.length > 0 ? (
                        filteredList.map((user, index) => (
                          <tr key={index}>
                            <td>
                              {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                            </td>
                            <td>{user?.full_name}</td>
                            <td>{user?.email}</td>
                            <td>{convertTimestampToDate(user?.created_at)}</td>
                            <td>
                              <div className="d-flex table_action_btn_group">
                                <Link
                                  to="/view-user"
                                  state={user}
                                  className="view-icon"
                                >
                                  <img src={HalfEye} alt="view" />
                                </Link>
                                <span
                                  className="view-icon delete"
                                  onClick={() => {
                                    setShow(true);
                                    setSelectedData(user);
                                  }}
                                >
                                  <img src={Delete1} alt="delete" />
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center">
                            No data found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="cstm_pagination text-center">
                      <Pagination>
                        <Pagination.First
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        />
                        <Pagination.Prev
                          onClick={() =>
                            setCurrentPage(Math.max(currentPage - 1, 1))
                          }
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
                          onClick={() =>
                            setCurrentPage(
                              Math.min(currentPage + 1, totalPages)
                            )
                          }
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

        {/* Delete User Modal */}
        <Modal
          show={show}
          onHide={() => setShow(false)}
          centered
          className="comm_modal cst_inner_wid_modal"
        >
          <Modal.Body className="p-0">
            <div className="inner-body">
              <div className="img-modal">
                <figure>
                  <img src={Delt} alt="Delete User" />
                </figure>
              </div>
              <h4 className="heading">
                Do you want to delete this user’s account?
              </h4>
              <div className="upper-btns-modal-pair">
                <Button className="comn-modal-btns-blue" onClick={handleDelete}>
                  Yes, Delete
                </Button>
                <Button
                  className="comn-modal-btns-transparent"
                  onClick={() => setShow(false)}
                >
                  No, Leave
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}

export default UserManagement;
