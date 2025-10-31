  import { Container } from "react-bootstrap";
  import Form from "react-bootstrap/Form";
  import { Link } from "react-router-dom";
  import Col from "react-bootstrap/Col";
  import Row from "react-bootstrap/Row";
  import Header from "../components/Header";
  import Footer from "../components/Footer";
  import SideBar from "../components/Profile/SideBar";
  import { BASE_URL_IMAGE } from "../API";

  import Edit from "../Assets/Images/edit.svg";
  import Loader from "../components/Loader";
  import { useUser } from "../context/UserContext";
  import CouponShower from "../components/CouponShower";

  function Profile() {
    const { user, loading } = useUser();

    return (
      <div className="comm_page_wrapper">
        <Header />
        <CouponShower />
        {loading ? (
          <Loader isLoading={true} />
        ) : (
          <div className="comm_profile_layout">
            <Container>
              <div className="comm_border_box">
                <Row className="profile_main_row">
                  <Col lg={3}>
                    <SideBar />
                  </Col>
                  <Col lg={9}>
                    <div className="profile_main_page edit-profile-amin">
                      <div className="comm_profile_heading pf_heading">
                        My Profile
                      </div>
                      <Form>
                        <div className="d-flex my_profile_row">
                          <div className="upper-name-profile-all">
                            <div className="profile-pic">
                              <figure className="profile-img-edit">
                                {!user || user?.image !== null ? (
                                  <img
                                    src={BASE_URL_IMAGE + user?.image}
                                    alt="User"
                                    className="img-fluid"
                                  />
                                ) : (
                                  <span className="user-initial">
                                    {user?.full_name?.charAt(0)?.toUpperCase() || "U"} {/* FIXED */}
                                  </span>
                                )}
                              </figure>
                            </div>
                            <div className="name-all">
                                <h6>{user?.full_name || "User Name"}</h6> {/* FIXED */}
                              <p>{user?.email || "Email"}</p>
                            </div>
                          </div>
                          <div className="dash-pair-btns-comn d-flex align-items-center gap-3">
                            <Link
                              to="/edit-profile"
                              className="profile_edit_icon"
                            >
                              <img src={Edit} alt="Edit" className="img-fluid" />
                            </Link>
                          </div>
                        </div>
                      </Form>
                    </div>
                  </Col>
                </Row>
              </div>
            </Container>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  export default Profile;
