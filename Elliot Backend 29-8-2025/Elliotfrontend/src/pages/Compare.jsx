"use client"

import { useEffect, useState } from "react"
import { Col, Container, Row } from "react-bootstrap"
import Form from "react-bootstrap/Form"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2";

import { IoSearch } from "react-icons/io5"
import Playr from "../Assets/Images/player_dummy.png"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Select from "react-select"
import axios from "axios"
import { BASE_URL_ADMIN, BASE_URL_SPORTS_API } from "../API"
import Loader from "../components/Loader"
import { useUser } from "../context/UserContext"
import { Helmet } from "react-helmet"
import CouponShower from "../components/CouponShower"

const token = localStorage.getItem("token")

function Compare() {
  const [playerOptions, setPlayerOptions] = useState([])
  const [selectedPlayers, setSelectedPlayers] = useState([null, null])
  const [playerHeadshots, setPlayerHeadshots] = useState([Playr, Playr])
  const [loading, setLoading] = useState(true)
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    const fetchPopularComparisons = async () => {
      try {
        setLoadingPopular(true)
        const response = await axios.get(`${BASE_URL_SPORTS_API}/most-compared-player-list`, {
          headers: { "x-guest-accessed": localStorage.getItem("guestAccessed"), Token: token },
        })
        setPopularData(response.data)
      } catch (err) {
        console.error("Failed to fetch popular comparisons", err)
        setError("Failed to load popular comparisons. Please try again later.")
      } finally {
        setLoadingPopular(false)
      }
    }

    fetchPopularComparisons()
  }, [])

  const [popularData, setPopularData] = useState(null)
  const [subscriptionError, setSubscriptionError] = useState("")
  const [btnName, setBtnName] = useState("Submit")
  const { user } = useUser()
  const navigate = useNavigate()
  const handleComparisonClick = async (players) => {
    try {
      const playerIDs = players.map((player) => player.id)
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

  const [metaData, setMetaData] = useState({
    title: "",
    description: "",
    robots: "index, follow",
    viewport: "width=device-width, initial-scale=1",
  })

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${BASE_URL_SPORTS_API}/odd-players`, {
          headers: {"x-guest-accessed": localStorage.getItem("guestAccessed"), Token: token },
        })

        const options = res.data.players.map((p) => ({
          value: p.playerID,
          label: `${p.name}`,
          photo: p.photo || Playr,
        }))

        setPlayerOptions(options)
      } catch (err) {
        console.error("Failed to fetch players", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const page = "compare"
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


  useEffect(() => {
    // Optional reset once per day
    const today = new Date().toDateString();
    const lastAccessDate = localStorage.getItem("guestAccessDate");
  
    if (lastAccessDate !== today) {
      localStorage.removeItem("guestAccessed");
      localStorage.setItem("guestAccessDate", today);
    }
  }, []);

  


  useEffect(() => {
    const fetchHeadshot = async (playerName, index) => {
      try {
        if (!playerName) return
        const response = await axios.get(`${BASE_URL_SPORTS_API}/headshot`, {
          params: { name: playerName },
        })
        setPlayerHeadshots((prev) => {
          const newHeadshots = [...prev]
          newHeadshots[index] = response.data.headshot || Playr
          return newHeadshots
        })
      } catch (err) {
        console.error("Failed to fetch headshot", err)
        setPlayerHeadshots((prev) => {
          const newHeadshots = [...prev]
          newHeadshots[index] = Playr
          return newHeadshots
        })
      }
    }

    selectedPlayers.forEach((player, index) => {
      if (player) {
        fetchHeadshot(player.label, index)
      }
    })
  }, [selectedPlayers])

  const customStyles = {
    control: (provided) => ({
      ...provided,
      paddingLeft: 30,
      position: "relative",
    }),
  }

  const CustomControl = ({ children, ...props }) => {
    const [inputValue, setInputValue] = useState("")

    const handleInputChange = (newValue) => {
      setInputValue(newValue)
    }

    const shouldShowOptions = inputValue.length > 0

    return (
      <div style={{ position: "relative", width: "100%" }}>
        <IoSearch
          style={{
            position: "absolute",
            top: "50%",
            left: 10,
            fontSize: 24,
            transform: "translateY(-50%)",
            zIndex: 1,
            color: "#F30808",
          }}
        />
        <Select
          {...props}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          styles={customStyles}
          components={{
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
          }}
          menuIsOpen={shouldShowOptions}
          menuPlacement="top"
        >
          {children}
        </Select>
      </div>
    )
  }

  const handlePlayerChange = (selectedPlayer, index) => {
    setSelectedPlayers((prev) => {
      const newPlayers = [...prev]
      newPlayers[index] = selectedPlayer
      return newPlayers
    })
  }

  const addPlayer = () => {
    if (selectedPlayers.length < 4) {
      setSelectedPlayers((prev) => [...prev, null])
      setPlayerHeadshots((prev) => [...prev, Playr])
    }
  }
  const handleSubmit = async () => {
    setError("")
    setSubscriptionError("")
    const validPlayers = selectedPlayers.filter((player) => player !== null)
    if (validPlayers.length < 2) {
      setError("Please select at least 2 players before submitting!!!")
      return
    }
    // if (user.subscription_status === "active" || user.has_accessed_once !== true) {
    //   try {
    //     const playerIDs = validPlayers.map((player) => player.value)
    //     await axios.post(`${BASE_URL_SPORTS_API}/add-compare-player`, {
    //       playerIDs: playerIDs,
    //     })
    //     const playersData = validPlayers.map((player, index) => ({
    //       id: player.value,
    //       name: player.label,
    //       headshot: playerHeadshots[selectedPlayers.indexOf(player)],
    //     }))
    //     navigate(`/weighted-score/${playerIDs.join("/")}`, {
    //       state: { players: playersData },
    //     })
    //   } catch (err) {
    //     console.error("Failed to log comparison:", err)
    //     const playerIDs = validPlayers.map((player) => player.value)
    //     const playersData = validPlayers.map((player, index) => ({
    //       id: player.value,
    //       name: player.label,
    //       headshot: playerHeadshots[selectedPlayers.indexOf(player)],
    //     }))

    //     navigate(`/weighted-score/${playerIDs.join("/")}`, {
    //       state: { players: playersData },
    //     })
    //   }
    // } else {
    //   if (btnName === "Subscribe") {
    //     navigate("/subscription")
    //   } else {
    //     setSubscriptionError("You have already used your one-time access. Please subscribe for unlimited access.")
    //     setBtnName("Subscribe")
    //   }
    // }


    if (user || (!user && localStorage.getItem("guestAccessed") !== "true")) {
      try {
        const playerIDs = validPlayers.map((player) => player.value);
        await axios.post(`${BASE_URL_SPORTS_API}/add-compare-player`, { playerIDs });
    
        const playersData = validPlayers.map((player, index) => ({
          id: player.value,
          name: player.label,
          headshot: playerHeadshots[selectedPlayers.indexOf(player)],
        }));
    
        // Mark guest as having used their one free access
        if (!user) localStorage.setItem("guestAccessed", "true");
    
        navigate(`/weighted-score/${playerIDs.join("/")}`, {
          state: { players: playersData },
        });
      } catch (err) {
        console.error("Failed to log comparison:", err);
    
        const playerIDs = validPlayers.map((player) => player.value);
        const playersData = validPlayers.map((player, index) => ({
          id: player.value,
          name: player.label,
          headshot: playerHeadshots[selectedPlayers.indexOf(player)],
        }));
    
        navigate(`/weighted-score/${playerIDs.join("/")}`, {
          state: { players: playersData },
        });
      }
    } else {
      // Guest already used their one free access
      Swal.fire({
        title: "Access Restricted",
        text: "You’ve already used your one-time free comparison. Please log in for unlimited access.",
        icon: "warning",
        confirmButtonText: "Login Now",
        confirmButtonColor: "#6FAD02",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login"); // ✅ takes user to login page
        }
      });
    }
    
    

    


  }
  if (loading || loadingPopular) {
    return (
      <div className="comm_page_wrapper">
        <Header />
        <section className="hero_sec">
          <Container>
            <div className="hero_sec_content comm_sec_padd">
              <Loader animation="border" variant="primary" />
            </div>
          </Container>
        </section>
        <Footer />
      </div>
    )
  }
  return (
    <div className="comm_page_wrapper">
      <Helmet>
        <title>{metaData.title || "Default Title"}</title>
        <meta name="description" content={metaData.description} />
        <meta name="robots" content={metaData.robots} />
        <meta name="viewport" content={metaData.viewport} />
      </Helmet>
      <Header />
      <CouponShower />
      <section className="hero_sec">
        <Container>
          {loading || loadingPopular ? (
            <Loader animation="border" variant="primary" />
          ) : (
            <div className="hero_sec_content comm_sec_padd compare_page_content">
              <h1 className="comm_sec_heading">
                Start Sit 'em Showdown
                <br />
                <span>Who Deserves the Start?</span>
              </h1>
              <div className="hero_inner_sec_content">
                <p className="text-center">
                  Make smarter lineup decisions with data that actually matters. Our tool compares players head-to-head
                  using Vegas player props - from yardage lines to touchdown odds - to help you decide who to start and
                  who to sit, without second-guessing.
                </p>
              </div>

              <div className="d-flex home_search_wrapper flex-wrap">
                {selectedPlayers.map((selectedPlayer, index) => (
                  <div key={index} className="comm-search-container">
                    <Form.Group className="comn-class-inputs mb-0">
                      <Form.Label>Player {index + 1}</Form.Label>
                      <CustomControl
                        options={playerOptions}
                        value={selectedPlayer}
                        onChange={(player) => handlePlayerChange(player, index)}
                        placeholder={`Search Player ${index + 1}`}
                        isSearchable
                      />
                    </Form.Group>
                    <figure className="select_player_img">
                      <img
                        src={playerHeadshots[index] || "/placeholder.svg"}
                        alt={selectedPlayer?.label || `Player ${index + 1}`}
                        className="img-fluid compare"
                      />
                    </figure>
                  </div>
                ))}
              </div>

              <div className="d-flex flex-column flex-lg-row justify-content-center align-items-center gap-4 mb-3">
                {selectedPlayers.length < 4 && (
                  <button
                    onClick={addPlayer}
                    className="main-btn comm_btn_width"
                    style={{ height: "5rem", fontSize: "1.5rem" }}
                  >
                    Add Player
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  className="main-btn comm_btn_width"
                  style={{
                    height: "5rem",
                    fontSize: "1.5rem",
                    backgroundColor: "#6FAD02",
                    color: "white",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                >
                  {btnName}
                </button>
              </div>
              =
              {error && <p className="error-message text-center">{error}</p>}
              {subscriptionError && <p className="error-message text-center">{subscriptionError}</p>}


            </div>
          )}
        </Container>
      </section>
      {popularData && (<>
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
                          e.currentTarget.style.backgroundColor = "#374151";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#1f2937";
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
                          e.currentTarget.style.backgroundColor = "#374151";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#1f2937";
                        }}

                      >
                        <span style={{ color: "#FFF", fontWeight: "600" }}>
                          {player?.name}
                        </span>
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
                    navigate("/popular-comparison");
                  }}
                >
                  View All
                </button>
              </div>
            </div>
          </Container>
        </section>
      </>)}
      <Footer />
    </div>
  )
}

export default Compare
