import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Assets/Images/site_logo2.png";
import { BASE_URL_IMAGE } from "../API";
import Loader from "./Loader";
import { useUser } from "../context/UserContext";
import Nav from "react-bootstrap/Nav";
import { FaBars, FaChevronDown } from "react-icons/fa";
import Navbar from "react-bootstrap/Navbar";

function Header() {
  const { user, loginChecked, loading } = useUser();
  const navigate = useNavigate();

  // Debug: Check the complete user object
  console.log('Complete user object:', user);
  console.log('User image:', user?.image);
  console.log('All user keys:', user ? Object.keys(user) : 'No user');

  const headerRef = useRef(null);
  const isStickySet = useRef(false);
  const hasUserInteracted = useRef(false);

  useEffect(() => {
    const scrollTriggerKeys = [
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " ",
    ];

    const markUserInteraction = (e) => {
      if (e.type === "keydown") {
        if (scrollTriggerKeys.includes(e.key)) {
          hasUserInteracted.current = true;
        }
      } else {
        hasUserInteracted.current = true;
      }
    };

    const handleScroll = () => {
      if (
        !isStickySet.current &&
        window.scrollY > 0 &&
        hasUserInteracted.current
      ) {
        headerRef.current?.classList.add("header-sticky");
        isStickySet.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", markUserInteraction, { passive: true });
    window.addEventListener("touchstart", markUserInteraction, {
      passive: true,
    });
    window.addEventListener("keydown", markUserInteraction, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", markUserInteraction);
      window.removeEventListener("touchstart", markUserInteraction);
      window.removeEventListener("keydown", markUserInteraction);
    };
  }, []);

  const handleProfileClick = () => {
    if (user) {
      navigate("/profile");
    }
  };

  // Profile Image Component (reusable)
  const ProfileImage = () => (
    <figure className="prf_img">
      {user?.image && !user.image.includes('googleusercontent.com') ? (
        <img
          src={BASE_URL_IMAGE + user.image}
          alt="User Profile"
          className="img-fluid"
        />
      ) : (
        <span className="user-initial">
          {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
        </span>
      )}
    </figure>
  );

  return (
    <>
      <header ref={headerRef} className="site_header">
        <div className="container" style={{
          paddingTop: "20px",
          paddingBottom: "20px"
        }}>
          <div className="d-flex site_header_inner">
            <Navbar expand="md" className="w-100">
              <Navbar.Brand href="/" className="site_header_logo">
                <img src={logo} alt="Site Logo" className="img-fluid" />
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="navbarScroll">
                {user ? (
                  <div className="d-flex cst_header_user_info toggle_header_img">
                    <ProfileImage /> {/* Use the same component */}
                    <FaChevronDown />
                  </div>
                ) : (
                  <FaBars />
                )}
              </Navbar.Toggle>
              <Navbar.Collapse id="navbarScroll">
                <Nav className="ms-auto my-2 my-lg-0 d-flex header_right_links">
                  <Link to="/compare" className="header_link active">
                    Compare Now
                  </Link>

                  <Link to="/blogs" className="header_link ">
                    Blogs
                  </Link>
                  <Link to="/vegas-rankings" className="header_link active">
                    Weekly Vegas Rankings
                  </Link>
                  <Link to="/vegas-adp" className="header_link active">
                    Vegas ADP
                  </Link>

                  {user && (
                    <Link
                      to="/profile"
                      className="header_link header_profile_link"
                    >
                      My Profile
                    </Link>
                  )}
                </Nav>
                <div
                  className={`site_header_btns ${user ? "" : "site_header_btns_login"}`}
                >
                  {!user ? (
                    <>
                      <Link to="/login" className="main-btn" type="submit">
                        Login
                      </Link>
                      <Link
                        to="/registration"
                        className="main-outline-btn"
                        type="submit"
                      >
                        Register
                      </Link>
                    </>
                  ) : (
                    <div className="header_user_info_wrapper">
                      <div
                        onClick={handleProfileClick}
                        className="d-flex cst_header_user_info"
                      >
                        <ProfileImage /> {/* Use the same component here too */}
                        <div>
                          <h6 className="name">
                            {loading ? <Loader /> : user?.full_name || "User"}
                          </h6>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Navbar.Collapse>
            </Navbar>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;