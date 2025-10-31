"use client"

import { useEffect, useState, useCallback } from "react"
import { Container } from "react-bootstrap"
import Footer from "../components/Footer"
import Header from "../components/Header"
import axios from "axios"
import Loader from "../components/Loader"
import Table from "react-bootstrap/Table"
import { BASE_URL_SPORTS_API } from "../API"
import { useUser } from "../context/UserContext"
import CouponShower from "../components/CouponShower"
import { useNavigate } from "react-router-dom"

const Average = () => {
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [playersData, setPlayersData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreData, setHasMoreData] = useState(true)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "desc" })
  const [selectedPosition, setSelectedPosition] = useState("")
  const { user } = useUser()
  const limit = 10
  const isInactive = !user;
  const navigate = useNavigate()

  const fetchRankingsData = async (page = 1, sortBy = null, order = "desc", position = "", isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
      const params = {
        page,
        limit,
        ...(sortBy && { sortBy, order }),
        ...(position && { position }),
      }
      const response = await axios.get(`${BASE_URL_SPORTS_API}/rank-players`, { params })
      if (response.data.success) {
        if (isLoadMore) {
          setPlayersData((prevData) => [...prevData, ...response.data.players])
        } else {
          setPlayersData(response.data.players)
        }
        setCurrentPage(response.data.currentPage)
        setTotalPlayers(response.data.totalPlayers)
        setHasMoreData(response.data.currentPage < response.data.totalPages)
      }
    } catch (error) {
      console.error("Error fetching rankings data:", error)
      if (!isLoadMore) {
        setPlayersData([])
      }
    }

    if (isLoadMore) {
      setLoadingMore(false)
    } else {
      setLoading(false)
    }
  }

  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMoreData || isInactive) return
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      const nextPage = currentPage + 1
      fetchRankingsData(nextPage, sortConfig.key, sortConfig.direction, selectedPosition, true)
    }
  }, [loadingMore, hasMoreData, isInactive, sortConfig.key, sortConfig.direction, selectedPosition, currentPage])

  useEffect(() => {
    const checkScrollPosition = () => {
      if (loadingMore || !hasMoreData || isInactive) return
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        const nextPage = currentPage + 1
        setCurrentPage(nextPage)
        fetchRankingsData(nextPage, sortConfig.key, sortConfig.direction, selectedPosition, true)
      }
    }
    const timeoutId = setTimeout(checkScrollPosition, 100)
    return () => clearTimeout(timeoutId)
  }, [
    playersData.length,
    loadingMore,
    hasMoreData,
    isInactive,
    currentPage,
    sortConfig.key,
    sortConfig.direction,
    selectedPosition,
  ])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const formatPlayerName = (playerID) => {
    if (!playerID) return "Player"
    const cleaned = playerID.replace(/_1_NFL$/, "")
    return cleaned
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  useEffect(() => {
    fetchRankingsData(1, sortConfig.key, sortConfig.direction, selectedPosition, false)
  }, [sortConfig, selectedPosition])
  const handleSort = (statKey) => {
    let direction = "desc";
    if (sortConfig.key === statKey && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key: statKey, direction });
    setPlayersData([]);
    setCurrentPage(1);
    setHasMoreData(true);
    fetchRankingsData(1, statKey, direction, selectedPosition, false);
  };

  const renderSortIcon = (statKey) => {
    if (sortConfig.key === statKey) {
      return sortConfig.direction === "asc" ? "▲" : "▼"
    }
    return "▼"
  }
  const renderStatCell = (player, position, statKey, label) => {
    const stat = player.stats?.[position]?.[statKey]
    if (!stat || (!stat.overUnder && !stat.odds)) return null
    return (
      <td key={`${position}-${statKey}`}>
        <div>
          <strong>{label}:</strong>
          {stat.overUnder && <div>O/U: {stat.overUnder}</div>}
          {stat.odds && (
            <div>
              Odds: {stat.odds > 0 ? "+" : ""}
              {stat.odds}
            </div>
          )}
          {stat.name && <div className="text-muted small">({stat.name})</div>}
        </div>
      </td>
    )
  }

  const getStatHeaders = () => {
    const statKeys = new Set()
    playersData.forEach((player) => {
      Object.values(player.stats || {}).forEach((positionStats) => {
        Object.keys(positionStats).forEach((key) => statKeys.add(key))
      })
    })
    return Array.from(statKeys)
  }

  const statHeaders = getStatHeaders()

  const displayedPlayers = isInactive ? playersData.slice(0, 3) : playersData

  const handlePositionChange = (position) => {
    setSelectedPosition(position)
  }

  return (
    <div className="comm_page_wrapper2">
      <Header />
      <CouponShower />
      {loading ? (
        <div className="loader-wrapper">
          <Loader isLoading={true} />
        </div>
      ) : (
        <>
          <section className="comm_second_sec_padd">
            <Container>
              <div className="comm_sec_padd comm_blog_page_outer">
                <h3 className="comm_sec_heading text-center mb-4">
                  Weekly <span>Vegas Rankings</span>
                </h3>
                <p className="text-white text-center mx-auto" style={{ maxWidth: "600px" }}>
                  Player rankings based on Vegas odds including Over/Under totals, receptions, touchdowns, and weighted
                  scoring algorithms.
                </p>
                <div className="d-flex justify-content-start">
                  <div className="position-filter-container">
                    <label htmlFor="positionFilter" className="text-white me-3 fw-bold">
                      Filter by Position:
                    </label>
                    <select
                      id="positionFilter"
                      className="form-select"
                      style={{
                        width: "200px",
                        backgroundColor: "#2c3e50",
                        color: "white",
                        border: "1px solid #34495e",
                      }}
                      value={selectedPosition}
                      onChange={(e) => handlePositionChange(e.target.value)}
                    >
                      <option value="">All Positions</option>
                      <option value="QB">Quarterback (QB)</option>
                      <option value="WR">Wide Receiver (WR)</option>
                      <option value="TE">Tight End (TE)</option>
                      <option value="RB">Running Back (RB)</option>
                    </select>
                  </div>
                </div>
                <div
                  className="table-responsive avg_table_outer"
                >
                  <div className="table-main-listng avg_table">
                    <Table striped>
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Player Name</th>
                          <th>Weighted Score</th>
                          {statHeaders.map((statKey) => (
                            <th
                              key={statKey}
                              style={{ cursor: "pointer", userSelect: "none" }}
                              onClick={() => handleSort(statKey)}
                            >
                              {statKey.replace(/_/g, " ").toUpperCase()} {renderSortIcon(statKey)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayedPlayers.length > 0 ? (
                          displayedPlayers.map((player, idx) => (
                            <tr key={`${player.playerID}-${idx}`}>
                              <td>{player.rank}</td>
                              <td>{formatPlayerName(player.playerID)}</td>
                              <td>{player.weightedScore?.toFixed(2) || "N/A"}</td>
                              {statHeaders.map((statKey) => {
                                let statData = null
                                Object.entries(player.stats || {}).forEach(([position, stats]) => {
                                  if (stats[statKey] && (stats[statKey].overUnder || stats[statKey].odds)) {
                                    statData = stats[statKey]
                                  }
                                })

                                return (
                                  <td key={statKey}>
                                    {statData ? (
                                      <div>
                                        {statData.overUnder && <div>O/U: {statData.overUnder}</div>}
                                        {statData.odds && (
                                          <div>
                                            Odds: {statData.odds > 0 ? "+" : ""}
                                            {statData.odds}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-muted">-</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4 + statHeaders.length}>No data available</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
                {loadingMore && !isInactive && (
                  <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading more...</span>
                    </div>
                    <p className="text-white mt-2">Loading more players...</p>
                  </div>
                )}
                {!hasMoreData && !isInactive && playersData.length > 0 && (
                  <div className="text-center mt-3">
                    <p className="text-white">You've reached the end of the rankings!</p>
                    <p className="text-muted">Total players loaded: {playersData.length}</p>
                  </div>
                )}
                {isInactive && playersData.length > 3 && (
                  <div
                    style={{
                      position: "relative",
                      background: "rgba(0,0,0,0.8)",
                      padding: "40px",
                      textAlign: "center",
                      color: "white",
                      borderRadius: "8px",
                      marginTop: "20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "24px",
                        marginBottom: "10px",
                      }}
                    >
                      🔒
                    </div>
                    <h4>Content Locked</h4>
                    <p>Please log in to see all player rankings</p> {/* 🚨 CHANGED THIS TEXT */}
                    <div className="d-flex justify-content-center">
                      <button
                        onClick={() => {
                          navigate("/login") // 🚨 CHANGED TO LOGIN PAGE
                        }}
                        style={{
                          background: "#007bff",
                          color: "white",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Login to View All
                      </button> {/* 🚨 CHANGED BUTTON TEXT */}
                    </div>
                  </div>
                )}
              </div>
            </Container>
          </section>
          <Footer />
        </>
      )}
    </div>
  )
}

export default Average
