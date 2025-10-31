import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { BASE_URL_ADMIN } from "../API";
import { Helmet } from "react-helmet";
import CouponShower from "../components/CouponShower";

function PrivacyPolicy() {
  const { loading, privacyPolicy } = useUser();
  const [metaData, setMetaData] = useState({
    title: "",
    description: "",
    robots: "index, follow",
    viewport: "width=device-width, initial-scale=1",
  });

  useEffect(() => {
    async function fetchMeta() {
      try {
        let page = "PrivacyPolicy";
        const response = await axios.get(`${BASE_URL_ADMIN}/meta/${page}`);
        if (response.data) {
          setMetaData({
            title: response.data.title || "",
            description: response.data.description || "",
            robots: response.data.keywords || "index, follow",
            viewport: "width=device-width, initial-scale=1",
          });
        }
      } catch (error) {
        console.error("Failed to fetch meta data", error);
      }
    }
    fetchMeta();
  }, []);

  return (
    <div className="homepage_wrapper">
      <Helmet>
        <title>{metaData.title || "Default Title"}</title>
        <meta name="description" content={metaData.description} />
        <meta name="robots" content={metaData.robots} />
        <meta name="viewport" content={metaData.viewport} />
      </Helmet>
      <Header />
      <CouponShower />
      {loading ? (
        <Loader isLoading={true} />
      ) : privacyPolicy ? (
        <section className="hero_sec">
          <Container>
            <div className="privacy_content_sec comm_sec_padd">
              <h4 className="comm_sec_heading text-center mb-5">
                {privacyPolicy.heading}
              </h4>
              <div
                className="privacy_content"
                dangerouslySetInnerHTML={{ __html: privacyPolicy.content }}
              ></div>
            </div>
          </Container>
        </section>
      ) : (
        <div>Error loading privacy policy data</div>
      )}

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
