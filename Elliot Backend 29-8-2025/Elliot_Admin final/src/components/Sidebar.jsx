import React, { useEffect, useState } from "react";
import logo from "../Assets/Images/Logos/jpg/site_logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import deleteimg from "../Assets/Images/logImage.svg";
import { ReactComponent as Dashboard } from "../Assets/Images/dashboard.svg";
import { ReactComponent as Sett } from "../Assets/Images/sett.svg";
import { ReactComponent as Logout } from "../Assets/Images/Log.svg";
import { ReactComponent as DashUser } from "../Assets/Images/dash_user.svg";
import { ReactComponent as LuTableOfContents } from "../Assets/Images/list-svgrepo-com.svg";
import { ReactComponent as Coupon } from "../Assets/Images/coupon.svg";

import { toast } from "react-toastify";
import { MdLogout } from "react-icons/md";

function Sidebar() {
  const [show, setShow] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");
  const [openDropdown, setOpenDropdown] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location]);

  const handleToggle = () => {
    setIsToggled((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully.");
    navigate("/login");
    setShow(false);
  };

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? "" : label));
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", Icon: Dashboard },
    {
      path: "/user-management",
      label: "User Management",
      Icon: DashUser,
      altPaths: ["/view-user"],
    },
    {
      label: "Content Management",
      Icon: LuTableOfContents,
      subItems: [
        { path: "/content/home", label: "Home" },
        { path: "/admin/blogs", label: "Blogs" },
        { path: "/admin/privacy-policy", label: "Privacy policy" },
        { path: "/admin/meta-manager", label: "Meta Manager" },
        { path: "/admin/ranking-admin", label: "Ranking Pannel" },
      ],
      altPaths: ["/content/home", "/content/about-us", "/content-edit"],
    },
    {
      path: "/profile",
      label: "Settings",
      Icon: Sett,
      altPaths: ["/change-password"],
    },
    { path: "/coupons", label: "Coupon Management", Icon: Coupon },
    { path: "/coupon-writings", label: "Coupon Writings", Icon: Coupon },
  ];

  return (
    <>
      <div className={`sidebar col-3 ${isToggled ? "active-sidebar" : ""}`}>
        <div className="toggl-main" onClick={handleToggle}>
          <i className="fa-solid fa-bars"></i>
        </div>

        <div className="sidebar-wrapper d-flex">
          <div className="sidebar-content">
            <div className="sidebar-logo">
              <figure
                className="text-center"
                onClick={() => navigate("/dashboard")}
                style={{ cursor: "pointer" }}
              >
                <img src={logo} className="img-fluid" alt="Logo" />
              </figure>
            </div>

            <ul className="slide-navli">
              {menuItems.map(
                ({ path, label, Icon, altPaths = [], subItems }) => {
                  const isActive =
                    activeMenu === path || altPaths.includes(activeMenu);

                  if (subItems) {
                    return (
                      <li key={label}>
                        <div
                          className={`inner-slide-li d-flex align-items-center justify-content-between ${openDropdown === label ||
                            altPaths.includes(activeMenu)
                            ? "active"
                            : ""
                            }`}
                          onClick={() => toggleDropdown(label)}
                        >
                          <div className="d-flex align-items-center gap-2">
                            <Icon />
                            <p className="m-0">{label}</p>
                          </div>
                          <i
                            className={`fa fa-chevron-${openDropdown === label ? "up" : "down"
                              }`}
                          ></i>
                        </div>
                        {openDropdown === label && (
                          <ul className="submenu ps-4 mt-1">
                            {subItems.map((sub) => (
                              <li
                                key={sub.path}
                                onClick={() => navigate(sub.path)}
                              >
                                <div
                                  className={
                                    activeMenu === sub.path
                                      ? "inner-slide-li active"
                                      : "inner-slide-li"
                                  }
                                >
                                  <p className="m-0">{sub.label}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  return (
                    <li key={path} onClick={() => navigate(path)}>
                      <div
                        className={`inner-slide-li d-flex align-items-center gap-2 ${isActive ? "active" : ""
                          }`}
                      >
                        <Icon />
                        <p className="m-0">{label}</p>
                      </div>
                    </li>
                  );
                }
              )}

              <li>
                <div
                  className="inner-slide-li logout d-flex align-items-center gap-2"
                  onClick={() => setShow(true)}
                >
                  <Logout />
                  <p className="m-0">Logout</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      <Modal
        show={show}
        onHide={() => setShow(false)}
        centered
        className="modal-delete-logout"
      >
        <Modal.Body className="p-0">
          <div className="inner-body-delete-logout text-center">
            <div className="logout_img_modal">
              <figure className="logout_icon_wrapper">
                <MdLogout />
              </figure>
            </div>
            <h4>Are you sure you want to logout?</h4>
            <div className="upper-btns-modal-pair d-flex justify-content-center gap-3 mt-3">
              <Button className="comn-modal-btns-blue" onClick={handleLogout}>
                Yes, Logout
              </Button>
              <Button
                className="comn-modal-btns-transparent"
                onClick={() => setShow(false)}
              >
                No, Stay Here
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Sidebar;
