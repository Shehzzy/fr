"use client"

import { useState, useEffect } from "react"
import { Container, Alert } from "react-bootstrap"
import { useUser } from "../context/UserContext"
import axios from "axios"
export const BASE_URL = "https://api.startsitem.com";
export const BASE_URL_ADMIN = `${BASE_URL}/Admin/api`;
const CouponShower = () => {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { user } = useUser()
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL_ADMIN}/get-coupon-writings`)
        const activeCoupons = response?.data.data.filter((coupon) => coupon.isActive === true)
        setCoupons(activeCoupons)
      } catch (err) {
        console.error("Failed to fetch coupons:", err)
        setError("Failed to load coupons")
      } finally {
        setLoading(false)
      }
    }
    fetchCoupons()
  }, [])
  if (
    loading ||
    error ||
    coupons.length === 0 ||
    !(user === null || user?.subscription_status === "inactive")
  ) {
    return null
  }
  return (
    <>
      {coupons.map((coupon, index) => (
        <div key={coupon._id || index} className="coupon-banner-wrapper">
          <Alert
            variant="warning"
            className="coupon-banner mb-0 text-center py-2"
            style={{
              backgroundColor: "#FFD700",
              border: "none",
              borderRadius: "0",
              color: "#000",
              fontWeight: "600",
              fontSize: "14px",
              position: "relative",
              zIndex: 1000,
            }}
          >
            <Container>
              <div className="d-flex align-items-center justify-content-center">
                <span className="me-2">🎉</span>
                <span className="font-sans">{coupon.description}</span>
                <span className="ms-2">🎉</span>
              </div>
            </Container>
          </Alert>
        </div>
      ))}

      <style jsx>{`
        .coupon-banner-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .coupon-banner {
          animation: slideDown 0.5s ease-out;
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .coupon-banner {
            font-size: 12px !important;
            padding: 8px 0 !important;
          }
        }
        
        @media (max-width: 576px) {
          .coupon-banner {
            font-size: 11px !important;
            padding: 6px 0 !important;
          }
          
          .coupon-banner span {
            display: inline-block;
            max-width: 90%;
            word-wrap: break-word;
          }
        }
      `}</style>
    </>
  )
}

export default CouponShower
