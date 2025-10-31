"use client"

import { useEffect, useState } from "react"
import { Container, Row, Col, Card, Nav } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Loader from "../components/Loader"
import axios from "axios"
import { BASE_URL_SPORTS_API } from "../API"
import { Helmet } from "react-helmet"
import CouponShower from "../components/CouponShower"

const token = localStorage.getItem("token")

function PopularComparison() {
    const [popularData, setPopularData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState("players")
    const navigate = useNavigate()

    const [metaData, setMetaData] = useState({
        title: "Popular Player Comparisons",
        description: "Discover the most popular player comparisons and trending matchups",
        robots: "index, follow",
        viewport: "width=device-width, initial-scale=1",
    })

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

    return (
        <div className="comm_page_wrapper">
            <Helmet>
                <title>{metaData.title}</title>
                <meta name="description" content={metaData.description} />
                <meta name="robots" content={metaData.robots} />
                <meta name="viewport" content={metaData.viewport} />
            </Helmet>
            <Header />
            <CouponShower />
            <section className="hero_sec">
                <Container>
                    {loading ? (
                        <div className="hero_sec_content comm_sec_padd">
                            <Loader animation="border" variant="primary" />
                        </div>
                    ) : error ? (
                        <div className="hero_sec_content comm_sec_padd">
                            <div className="text-center">
                                <h2 className="text-danger">{error}</h2>
                            </div>
                        </div>
                    ) : (
                        <div className="hero_sec_content comm_sec_padd">
                            <h1 className="comm_sec_heading text-center">
                                Popular Player Comparisons
                                <br />
                                <span>Trending Matchups & Most Searched Players</span>
                            </h1>

                            <div className="hero_inner_sec_content">
                                <p className="text-center">
                                    Discover the most popular player comparisons and see what matchups other fantasy football managers are
                                    analyzing. Click on any comparison to see detailed performance analytics and weighted scores.
                                </p>
                            </div>

                            <Row className="mb-4">
                                <Col xs={12}>
                                    <Nav variant="pills" className="justify-content-center gap-3">
                                        <Nav.Item>
                                            <Nav.Link
                                                active={activeTab === "players"}
                                                onClick={() => setActiveTab("players")}
                                                style={{
                                                    backgroundColor: activeTab === "players" ? "#3B82F6" : "transparent",
                                                    color: activeTab === "players" ? "white" : "#9CA3AF",
                                                    border: "1px solid #374151",
                                                    borderRadius: "25px",
                                                    padding: "12px 24px",
                                                    fontWeight: "600",
                                                    transition: "all 0.3s ease",
                                                    cursor: "pointer",
                                                    fontSize: "1.3rem"
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (activeTab !== "players") {
                                                        e.target.style.backgroundColor = "#374151";
                                                        e.target.style.color = "white";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (activeTab !== "players") {
                                                        e.target.style.backgroundColor = "transparent";
                                                        e.target.style.color = "#9CA3AF";
                                                    }
                                                }}
                                            >
                                                Most Searched Players
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link
                                                active={activeTab === "comparisons"}
                                                onClick={() => setActiveTab("comparisons")}
                                                style={{
                                                    backgroundColor: activeTab === "comparisons" ? "#3B82F6" : "transparent",
                                                    color: activeTab === "comparisons" ? "white" : "#9CA3AF",
                                                    border: "1px solid #374151",
                                                    borderRadius: "25px",
                                                    padding: "12px 24px",
                                                    fontWeight: "600",
                                                    transition: "all 0.3s ease",
                                                    cursor: "pointer",
                                                    fontSize: "1.3rem"
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (activeTab !== "comparisons") {
                                                        e.target.style.backgroundColor = "#374151";
                                                        e.target.style.color = "white";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (activeTab !== "comparisons") {
                                                        e.target.style.backgroundColor = "transparent";
                                                        e.target.style.color = "#9CA3AF";
                                                    }
                                                }}
                                            >
                                                Most Popular Comparisons
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </Col>
                            </Row>
                            {activeTab === "players" && popularData?.popularPlayers && popularData.popularPlayers.length > 0 && (
                                <Row className="mb-5">
                                    <Col xs={12}>
                                        <Row className="justify-content-center">
                                            {popularData.popularPlayers.map((player, index) => (
                                                <Col key={player.id} lg={4} md={6} className="mb-3">
                                                    <Card
                                                        style={{
                                                            backgroundColor: "#1f2937",
                                                            border: "1px solid #374151",
                                                            borderRadius: "8px",
                                                            color: "white",
                                                        }}
                                                    >
                                                        <Card.Body className="text-center">
                                                            <Card.Title style={{ fontSize: "18px", fontWeight: "bold" }}>{player.name}</Card.Title>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Col>
                                </Row>
                            )}

                            {activeTab === "comparisons" &&
                                popularData?.popularComparisons &&
                                popularData.popularComparisons.length > 0 && (
                                    <Row>
                                        <Col xs={12}>
                                            <Row className="justify-content-center">
                                                {popularData.popularComparisons.map((comparison, index) => (
                                                    <Col key={index} lg={6} md={8} className="mb-4">
                                                        <Card
                                                            style={{
                                                                backgroundColor: "#1f2937",
                                                                border: "1px solid #374151",
                                                                borderRadius: "8px",
                                                                color: "white",
                                                                cursor: "pointer",
                                                                transition: "all 0.3s ease",
                                                            }}
                                                            className="h-100"
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = "#374151"
                                                                e.currentTarget.style.transform = "translateY(-2px)"
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = "#1f2937"
                                                                e.currentTarget.style.transform = "translateY(0)"
                                                            }}
                                                            onClick={() => handleComparisonClick(comparison.players)}
                                                        >
                                                            <Card.Body className="text-center">
                                                                <Card.Title style={{ fontSize: "20px", fontWeight: "bold" }}>
                                                                    <span
                                                                        style={{
                                                                            color: "#3B82F6",
                                                                            textDecoration: "none",
                                                                            cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        {comparison.players.map((player) => player.name).join(" vs ")}
                                                                    </span>
                                                                </Card.Title>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Col>
                                    </Row>
                                )}

                            {((activeTab === "players" &&
                                (!popularData?.popularPlayers || popularData.popularPlayers.length === 0)) ||
                                (activeTab === "comparisons" &&
                                    (!popularData?.popularComparisons || popularData.popularComparisons.length === 0))) && (
                                    <Row>
                                        <Col xs={12}>
                                            <div className="text-center">
                                                <h3 style={{ color: "#9CA3AF" }}>
                                                    {activeTab === "players"
                                                        ? "No popular players available yet."
                                                        : "No popular comparisons available yet."}
                                                </h3>
                                                <p style={{ color: "#6B7280" }}>Start comparing players to see popular matchups here!</p>
                                                <button className="main-btn comm_btn_width mx-auto" onClick={() => navigate("/compare")}>
                                                    Start Comparing
                                                </button>
                                            </div>
                                        </Col>
                                    </Row>
                                )}

                            <Row className="mt-5">
                                <Col xs={12} className="text-center">
                                    <button className="main-btn comm_btn_width mx-auto" onClick={() => navigate("/compare")}>
                                        Compare Players
                                    </button>
                                </Col>
                            </Row>
                        </div>
                    )}
                </Container>
            </section>
            <Footer />
        </div>
    )
}

export default PopularComparison
