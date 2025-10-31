"use client"

import { useEffect, useState } from "react"
import { Card, Container } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Header from "../components/Header"
import card1 from "../Assets/Images/card1.png"
import card2 from "../Assets/Images/card2.png"
import card3 from "../Assets/Images/card3.png"
import PlanImg from "../Assets/Images/man.png"
import Crown from "../Assets/Images/crown.svg"
import Footer from "../components/Footer"
import { LuUser } from "react-icons/lu"
import { Link } from "react-router-dom"
import { BASE_URL_IMAGE, BASE_URL, BASE_URL_ADMIN } from "../API"
import { FaRegCalendar } from "react-icons/fa6"
import { format } from "date-fns"
import Loader from "../components/Loader"
import RenderHTMLList from "../components/RenderHTMLList"
import BlogImage from "../Assets/Images/chestnut_bg.png"
import { useUser } from "../context/UserContext"
import { Helmet } from "react-helmet"
import axios from "axios"
import { BASE_URL_SPORTS_API } from "../API"
import CouponShower from "../components/CouponShower"
import { Tweet } from "react-tweet"
function Home() {
  const navigate = useNavigate()
  const [popularData, setPopularData] = useState([])
  const [loading1, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [baseUrl] = useState(BASE_URL)
  const { homeData, loading, token, blog, latestBlogs } = useUser()
  // State for dynamic meta data
  useEffect(() => {
    const fetchPopularComparisons = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL_SPORTS_API}/most-compared-player-list`, {
          headers: { Token: token },
        })
        setPopularData(response.data)
      } catch (err) {
        console.error("Failed to fetch popular comparisons", err)
        setError("Failed to load popular comparisons. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPopularComparisons()
  }, [])
  const [metaData, setMetaData] = useState({
    title: "",
    description: "",
    robots: "index, follow",
    viewport: "width=device-width, initial-scale=1",
  })
  useEffect(() => {
    async function fetchMeta() {
      try {
        const page = "home"
        const response = await axios.get(`${BASE_URL_ADMIN}/meta/${page}`)
        if (response.data) {
          setMetaData({
            title: response.data.title || "",
            description: response.data.description || "",
            robots: response.data.keywords || "index, follow",
            viewport: "width=device-width, initial-scale=1",
          })
        }
      } catch (error) {
        console.error("Failed to fetch meta data", error)
      }
    }
    fetchMeta()
  }, [])
  const handleComparisonClick = async (players) => {
    try {
      const playerIDs = players.map((player) => player.id)

      // Fetch headshots for the players
      const playersData = await Promise.all(
        players.map(async (player) => {
          try {
            const headshotResponse = await axios.get(`${BASE_URL_SPORTS_API}/headshot`, {
              params: { name: player.name },
            })
            return {
              id: player.id,
              name: player.name,
              headshot: headshotResponse.data.headshot || "/Assets/Images/player_dummy.png",
            }
          } catch (err) {
            console.error(`Failed to fetch headshot for ${player.name}`, err)
            return {
              id: player.id,
              name: player.name,
              headshot: "/Assets/Images/player_dummy.png",
            }
          }
        }),
      )

      navigate(`/weighted-score/${playerIDs.join("/")}`, {
        state: { players: playersData },
      })
    } catch (err) {
      console.error("Failed to navigate to comparison", err)
    }
  }
  const handleSubmit = () => {
    if (!token) {
      navigate("/login")
    } else {
      navigate("/compare")
    }
  }

  const handelSubscribe = () => {
    if (!token) {
      navigate("/login")
    } else {
      navigate("/subscription")
    }
  }

  const filteredLatestBlogs = latestBlogs.filter((item) => item._id !== blog?._id)

  const tweetIds = [
    "1977518160333906184",
    "1978851186385056019",
    "1970132115414237554",
    "1968980477953356254",
    "1966561162314584090",
    "1976402393874170062",
    "1977489995528118679",
    "1979238242722480515",
    "1967667368936739005",
  ]

  return (
    <>
      <Helmet>
        <title>{metaData.title || "Default Title"}</title>
        <meta name="description" content={metaData.description} />
        <meta name="robots" content={metaData.robots} />
        <meta name="viewport" content={metaData.viewport} />
      </Helmet>

      <div className="homepage_wrapper">
        <Header />
        <CouponShower />
        {loading || loading1 ? (
          <Loader isLoading={true} />
        ) : homeData ? (
          <>
            {/* Hero Section */}
            <section className="hero_sec">
              <Container>
                <div className="hero_sec_content comm_sec_padd">
                  <h1 className="comm_sec_heading">
                    {homeData.home1Heading} <span>{homeData.home1HeadingGreen}</span>
                  </h1>

                  <button className="main-btn comm_btn_width mx-auto" type="submit" onClick={handleSubmit}>
                    {homeData.home1Btn}
                  </button>

                  <div className="hero_inner_sec_content font-sans text-gray-800">
                    <div className="innerHtmlFont" dangerouslySetInnerHTML={{ __html: homeData.homeDesc }} />

                    <RenderHTMLList htmlString={homeData.homeDesc2} heading={homeData.homeSubHeading} />

                    <div dangerouslySetInnerHTML={{ __html: homeData.homeDesc3 }} />
                  </div>
                </div>
              </Container>
            </section>

            {/* How It Works Section */}
            <section className="how_start_sec">
              <Container>
                <h3 className="comm_sec_heading text-center">
                  {homeData.home3Heading} <span>{homeData.home3HeadingGreen}</span>
                </h3>

                <Row className="row-gap-5">
                  <Col lg={4} md={6}>
                    <div className="how_we_work_col">
                      <figure className="how_we_work_img">
                        <img
                          src={homeData.homeCardImage1 ? `${baseUrl}${homeData.homeCardImage1}` : card1}
                          alt=""
                          className="img-fluid"
                        />
                      </figure>
                      <div className="cntnt">
                        <h5>{homeData.homeCardHeading1}</h5>
                        <p>{homeData.homeCardDesc1}</p>
                      </div>
                    </div>
                  </Col>
                  <Col lg={4} md={6}>
                    <div className="how_we_work_col">
                      <figure className="how_we_work_img">
                        <img
                          src={homeData.homeCardImage2 ? `${baseUrl}${homeData.homeCardImage2}` : card2}
                          alt=""
                          className="img-fluid"
                        />
                      </figure>
                      <div className="cntnt">
                        <h5>{homeData.homeCardHeading2}</h5>
                        <p>{homeData.homeCardDesc2}</p>
                      </div>
                    </div>
                  </Col>
                  <Col lg={4} md={6}>
                    <div className="how_we_work_col">
                      <figure className="how_we_work_img">
                        <img
                          src={homeData.homeCardImage3 ? `${baseUrl}${homeData.homeCardImage3}` : card3}
                          alt=""
                          className="img-fluid"
                        />
                      </figure>
                      <div className="cntnt">
                        <h5 className="implied_head">{homeData.homeCardHeading3}</h5>
                        <p>{homeData.homeCardDesc3}</p>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="info_start_box">
                  <h3 className="comm_sec_heading mb-0 text-center">
                    {homeData.homeDesc4.replace(/<[^>]+>/g, "")}{" "}
                    <span>{homeData.homeDesc4Green.replace(/<[^>]+>/g, "")}</span>
                  </h3>
                </div>
              </Container>
            </section>

            {/* Subscription Section */}
            <section className="subscription_sec comm_sec_padd">
              <Container>
                <Row className="row-gap-5">
                  <Col xl={4}>
                    <h3 className="comm_sec_heading">
                      {homeData.home2Heading.split(" ")[0]} <span>{homeData.home2Heading.split(" ")[1]}</span>
                    </h3>
                  </Col>
                  <Col xl={4} md={6}>
                    <div className="subscription_plan_box casual_plan active">
                      <h6 className="heading">{homeData.home2CardHeading1}</h6>
                      <RenderHTMLList htmlString={homeData.home2CardDesc1} heading={homeData.home2CardSubHeading1} />

                      <figure className="casual_plan_img">
                        <img
                          src={homeData.home2CardImage1 ? `${baseUrl}${homeData.home2CardImage1}` : PlanImg}
                          className="img-fluid"
                          alt="Casual plan"
                        />
                      </figure>
                    </div>
                  </Col>
                  <Col xl={4} md={6}>
                    <div className="subscription_plan_box pro_plan">
                      <h6 className="heading">
                        <img src={Crown || "/placeholder.svg"} className="img-fluid" alt="Crown" />{" "}
                        {homeData.home3CardHeading1}
                      </h6>

                      <RenderHTMLList htmlString={homeData.home3CardDesc1} heading={homeData.home3CardSubHeaing1} />
                      <div className="upgrade_content">
                        <h4>
                          {homeData.home2CardSubHeading2} <span>{homeData.home2CardSubHeading2Green}</span>
                        </h4>
                        <button className="main-btn comm_btn_width mx-auto" type="submit" onClick={handelSubscribe}>
                          {homeData.home3CardBtn}
                        </button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Container>
            </section>
            {/* Popular Section */}
            {popularData && (
              <>
                {/* Popular Section */}
                <section className="comm_sec_padd">
                  <Container>
                    <div className="main-also-like mt-0">
                      <Row className="d-flex justify-content-between flex-wrap">
                        <Col xs={12} md={6} className="mb-4">
                          <h2 className="text-center mb-4">
                            <span style={{ color: "white" }}>Popular</span>{" "}
                            <span style={{ color: "#6FAD02" }}>Comparisons</span>
                          </h2>
                          <ul className="list-group">
                            {popularData.popularComparisons.slice(0, 4).map((comparison, index) => (
                              <li
                                key={index}
                                className="list-group-item d-flex justify-content-between mb-3 align-items-center"
                                style={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid #374151",
                                  color: "white",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                  fontSize: "1.5rem",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#374151"
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#1f2937"
                                }}
                                onClick={() => handleComparisonClick(comparison.players)}
                              >
                                <span style={{ color: "#FFF", fontWeight: "600" }}>
                                  {comparison.players.map((player) => player.name).join(" vs ")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </Col>
                        {/* Popular Players */}
                        <Col xs={12} md={6} className="mb-4">
                          <h2 className="text-center mb-4">
                            <span style={{ color: "white" }}>Popular</span>{" "}
                            <span style={{ color: "#6FAD02" }}>Players</span>
                          </h2>
                          <ul className="list-group">
                            {popularData.popularPlayers.slice(0, 4).map((player, index) => (
                              <li
                                key={index}
                                className="list-group-item d-flex justify-content-between mb-3 align-items-center"
                                style={{
                                  backgroundColor: "#1f2937",
                                  border: "1px solid #374151",
                                  color: "white",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                  fontSize: "1.5rem",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#374151"
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#1f2937"
                                }}
                              >
                                <span style={{ color: "#FFF", fontWeight: "600" }}>{player?.name}</span>
                              </li>
                            ))}
                          </ul>
                        </Col>

                        {/* Popular Comparisons */}
                      </Row>
                      <div className="text-center d-flex justify-content-center mt-4">
                        <button
                          className="main-btn"
                          onClick={() => {
                            navigate("/popular-comparison")
                          }}
                        >
                          View All
                        </button>
                      </div>
                    </div>
                  </Container>
                </section>
              </>
            )}
            <section className="twitter-section py-5">
              <Container>
                <h3 className="comm_sec_heading text-center mb-5">
                  <span>Latest </span> Tweets
                </h3>
                <Row className="g-4 justify-content-center">
                  {tweetIds.map((tweetId, index) => {
                    const isLarge = index % 5 === 0 || index % 7 === 0;
                    return (
                      <Col
                        key={tweetId}
                        xs={12}
                        sm={isLarge ? 12 : 6}
                        md={isLarge ? 8 : 4}
                        lg={isLarge ? 6 : 3}
                        className="bento-item"
                      >
                        <Card className="bento-card border-0 shadow-sm h-100">
                          <div className="tweet-wrapper d-flex justify-content-center align-items-center p-3">
                            <Tweet id={tweetId} />
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Container>
            </section>

            {/* Blogs Section */}
            <section section className="comm_sec_padd pt-0">
              <Container>
                <div className="main-also-like mt-0">
                  <h2>You may also like</h2>
                  <Row className="row-gap-5 product_listing_row">
                    {filteredLatestBlogs.map((item) => (
                      <Col lg="4" md="6" key={item._id}>
                        <div className="latest-news-card">
                          <figure>
                            <img src={item.image ? `${BASE_URL_IMAGE}/${item.image}` : BlogImage} alt={item.heading} />
                          </figure>
                          <div className="card-detail-price">
                            <div className="upper-name-and-date d-flex">
                              <div className="date-news d-flex">
                                <FaRegCalendar />
                                <p>{format(new Date(item.created_at), "dd-MM-yyyy")}</p>
                              </div>
                              <div className="date-news d-flex">
                                <LuUser className="user" />
                                <p>By {item.author}</p>
                              </div>
                            </div>
                            <h3 className="blg_heading">{item.heading}</h3>
                            <p className="discript_news_article">
                              {item.description && item.description.length > 100 ? (
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: `${item.description.substring(0, 100)}...`,
                                  }}
                                />
                              ) : (
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: item.description,
                                  }}
                                />
                              )}
                            </p>
                            <Link to={`/blog-detail/${item._id}`} className="main-btn">
                              read more
                            </Link>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Container>
            </section>
          </>
        ) : (
          <div>Error loading home data</div>
        )}

        <Footer />
      </div>
    </>
  )
}

export default Home
