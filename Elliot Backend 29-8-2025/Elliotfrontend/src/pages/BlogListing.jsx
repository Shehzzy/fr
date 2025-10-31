import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { FaRegCalendar } from "react-icons/fa6";
import { LuUser } from "react-icons/lu";
import { BASE_URL_ADMIN, BASE_URL_IMAGE } from "../API";
import { format } from "date-fns";
import Loader from "../components/Loader";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";

const BlogListing = () => {
  const { blogs, loading, fetchBlogs } = useUser();
  const [metaData, setMetaData] = useState({
    title: "Blog Listing",
    description: "Explore our latest blogs",
    robots: "index, follow",
    viewport: "width=device-width, initial-scale=1",
  });

  useEffect(() => {
    async function fetchMeta() {
      try {
        const response = await axios.get(`${BASE_URL_ADMIN}/meta/blog`);
        if (response.data) {
          setMetaData({
            title: response.data.title || "Blog Listing",
            description:
              response.data.description || "Explore our latest blogs",
            robots: response.data.keywords || "index, follow",
            viewport: "width=device-width, initial-scale=1",
          });
        }
      } catch (error) {
        console.error("Failed to fetch meta data", error);
      }
    }
    fetchMeta();
  }, [blogs, fetchBlogs]);

  return (
    <div className="comm_page_wrapper2">
      <Helmet>
        <title>{metaData.title}</title>
        <meta name="description" content={metaData.description} />
        <meta name="robots" content={metaData.robots} />
        <meta name="viewport" content={metaData.viewport} />
      </Helmet>

      <Header />

      {loading ? (
        <div className="loader-wrapper">
          <Loader isLoading={loading} />
        </div>
      ) : blogs.length === 0 ? (
        <Loader isLoading={loading} />
      ) : (
        <>
          <section className="comm_second_sec_padd">
            <Container>
              <div className="comm_sec_padd comm_blog_page_outer">
                <h3 className="comm_sec_heading text-center">
                  Latest <span>Blogs</span>
                </h3>
                <Row className="row-gap-5 product_listing_row">
                  {blogs.map((blog) => (
                    <Col lg="4" md="6" key={blog._id}>
                      <div className="latest-news-card">
                        <figure>
                          <img
                            src={
                              blog.image
                                ? BASE_URL_IMAGE + blog.image
                                : "/fallback-image.jpg"
                            }
                            alt={blog.heading || "Blog image"}
                            loading="lazy"
                          />
                        </figure>
                        <div className="card-detail-price">
                          <div className="upper-name-and-date d-flex">
                            <div className="date-news d-flex">
                              <FaRegCalendar />
                              <p>
                                {format(
                                  new Date(blog.created_at),
                                  "dd-MM-yyyy"
                                )}
                              </p>
                            </div>
                            <div className="date-news d-flex">
                              <LuUser className="user" />
                              <p>By {blog.author || "Admin"}</p>
                            </div>
                          </div>
                          <h3 className="blg_heading">{blog.heading}</h3>
                          <p
                            className="discript_news_article"
                            dangerouslySetInnerHTML={{
                              __html:
                                blog.description?.substring(0, 100) + "..." ||
                                "No description available",
                            }}
                          />
                          <Link
                            to={`/blog-detail/${blog.slug}`}
                            className="main-btn"
                          >
                            Read more
                          </Link>
                          {/* <a
                            href={`https://blog.startsitem.com/blog/${blog.slug}`}
                            className="main-btn"
                          >
                            Read more
                          </a> */}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Container>
          </section>
          <Footer />
        </>
      )}
    </div>
  );
};

export default BlogListing;
