import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import { MdOutlineMenu } from "react-icons/md";
import axios from "axios";
import { BASE_URL_ADMIN, BASE_URL_COMMON, LOGOUT } from "../../API";
import { useUser } from "../../context/UserContext";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setLoginChecked } = useUser()
  const [show, setShow] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const toggleSidebar = () => setShowSidebar(!showSidebar);
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await axios.get(`${BASE_URL_ADMIN}/get-home`);
        if (res.data?.data?.[0]) {
          setHomeData(res.data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    };

    fetchHomeData();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${BASE_URL_COMMON}${LOGOUT}`,
        {},
        {
          headers: {
            Token: token,
          }
        }
      );

      localStorage.removeItem("token");
      localStorage.clear();
      setLoginChecked(false)
      setUser("")
      navigate("/login", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSubscriptionPage = () => {
    navigate("/subscription", { state: { homeData } });
  };

  return (
    <>
      <div className="sidebar_main_outer">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <MdOutlineMenu size={30} />
        </button>

        <div className={`sidebar-wrapper d-flex ${showSidebar ? "open" : ""}`}>
          <div className="sidebar-content">
            <div className="comm_profile_heading">My Account</div>
            <ul className="slide-navli">
              <li onClick={() => navigate("/profile")}>
                <div
                  className={
                    location.pathname === "/profile"
                      ? "inner-slide-li active"
                      : "inner-slide-li first"
                  }
                >
                  <p>My profile</p>
                </div>
              </li>
              <li onClick={() => navigate("/payment-histroy")}>
                <div
                  className={
                    location.pathname === "/payment-histroy"
                      ? "inner-slide-li active"
                      : "inner-slide-li"
                  }
                >
                  <p>Payments History</p>
                </div>
              </li>
              <li onClick={handleSubscriptionPage}>
                {" "}
                <div
                  className={
                    location.pathname === "/subscription"
                      ? "inner-slide-li active"
                      : "inner-slide-li"
                  }
                >
                  <p>Subscription Plan</p>
                </div>
              </li>
              <li onClick={() => navigate("/change-password")}>
                <div
                  className={
                    location.pathname === "/change-password"
                      ? "inner-slide-li active"
                      : "inner-slide-li"
                  }
                >
                  <p>Change Password</p>
                </div>
              </li>
            </ul>

            <div
              className="sidebar_logout inner-slide-li logout"
              onClick={handleShow}
            >
              <h6>Logout</h6>
            </div>
          </div>
        </div>

        <Modal
          show={show}
          onHide={handleClose}
          centered
          className="modal-delete-logout"
        >
          <Modal.Body className="p-0">
            <div className="inner-body-delete-logout">
              <h4>Are you sure you want to logout?</h4>
              <div className="logout_modal_btns">
                <button className="main-outline-btn" onClick={handleClose}>
                  No
                </button>
                <button className="main-btn" onClick={handleLogout}>
                  Yes
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default SideBar;
