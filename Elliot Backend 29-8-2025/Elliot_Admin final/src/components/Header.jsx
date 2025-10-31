import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import user from "../Assets/Images/blank.png";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/slices/AdminDetails";
import { BASE_URL_ADMIN, IMAGE_URL, ADMIN_DETAILS } from "../API";
import { toast } from "react-toastify";
import axios from "axios";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  const userStateDetail = useSelector((state) => state.user.user);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userStateDetail || !userStateDetail.name) {
      fetchUserDetail();
    }
  }, []);

  const fetchUserDetail = async () => {
    try {
      setIsLoading(true);
      const headers = { token };
      const response = await axios.get(BASE_URL_ADMIN + ADMIN_DETAILS, { headers });

      if (response.status === 200 && response.data.status === true) {
        const userData = response.data.data[0];
        dispatch(setUser(userData));
      } else {
        toast.error("Failed to fetch user details.");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error_description || "An error occurred while fetching user details.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const userName = userStateDetail?.name || "User";
  const profileImage = userStateDetail?.image;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="dashboard_header navbar navbar-expand-lg navbar-admin">
      <div className="container-fluid m-0 p-0">
        <div className="welcom-upper d-flex justify-content-between align-items-center w-100">
          <h6 className="user_name">Hello {userName}</h6>
          <div className="dash_header_notify_wrap d-flex align-items-center">
            <div className="divider"></div>
            <Link to="/profile" className="dash_profile_image">
              {profileImage && profileImage !== "null" ? (
                <img
                  src={`${IMAGE_URL}/${profileImage}`}
                  alt="Profile"
                  className="img-fluid"
                />
              ) : (
                <div className="user-initial-circle">{userInitial}</div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
