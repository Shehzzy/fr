import React, { useEffect, useLayoutEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FaRegCalendar } from "react-icons/fa6";
import { LuUser } from "react-icons/lu";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { format } from "date-fns";
import BlogContentParser from "../components/BlogContentParser";
import { Helmet } from "react-helmet-async";
import { BASE_URL_ADMIN, BASE_URL_IMAGE, GET_BLOG } from "../API";
import BlogImage from "../Assets/Images/chestnut_bg.png";
import BlogMain from "../Assets/Images/blog_detail.png";
import CouponShower from "../components/CouponShower";

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch blog by slug
        const blogRes = await axios.get(`${BASE_URL_ADMIN}/get-blog/${slug}`);
        setBlog(blogRes.data.data);

        // Fetch latest blogs
        const blogsRes = await axios.get(`${BASE_URL_ADMIN}${GET_BLOG}`);
        const sortedBlogs = blogsRes.data.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setLatestBlogs(sortedBlogs.slice(0, 5));
      } catch (error) {
        console.error("Error fetching blog details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  const filteredLatestBlogs = latestBlogs.filter(
    (item) => item.slug !== blog?.slug
  );

  return (
    <div className="comm_page_wrapper2">
      {blog && (
        <Helmet>
          <title>{blog.heading || "Blog Details"}</title>
          <meta name="description" content={blog.description || ""} />
          <meta name="robots" content="index, follow" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@webteam1171133" />
          <meta name="twitter:creator" content={"@webteam1171133"} />
          <meta
            name="twitter:title"
            content={blog.heading?.slice(0, 70) || "Blog Title"}
          />
          <meta
            name="twitter:description"
            content={blog.description?.slice(0, 200) || ""}
          />
          <meta
            name="twitter:image"
            content={blog.image ? `${BASE_URL_IMAGE}${blog.image}` : ""}
          />

          <meta property="og:title" content={blog.heading || "Blog Details"} />
          <meta property="og:description" content={blog.description || ""} />
          <meta
            property="og:image"
            content={blog.image ? `${BASE_URL_IMAGE}${blog.image}` : ""}
          />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:type" content="article" />
        </Helmet>
      )}

      <Header />
      <CouponShower />
      {isLoading ? (
        <Loader isLoading={true} />
      ) : (
        <section className="comm_second_sec_padd">
          <Container>
            <div className="comm_sec_padd comm_blog_page_outer">
              <h3 className="comm_sec_heading text-center">
                Latest <span>Blogs</span>
              </h3>

              <div className="blog_detail_content_sec">
                <div className="main-img-detail">
                  <figure>
                    <img
                      src={
                        blog.image ? `${BASE_URL_IMAGE}${blog.image}` : BlogMain
                      }
                      alt={blog.heading}
                    />
                  </figure>
                </div>

                <div className="upper-name-and-date detail-main-blog d-flex">
                  <div className="date-news d-flex">
                    <img
                      src={
                        blog.authorProfileImage
                          ? `${BASE_URL_IMAGE}${blog.authorProfileImage}`
                          : "User"
                      }
                      alt={blog.author}
                    />
                    <p>{blog.author || "Admin"}</p>
                  </div>
                  <div className="date-news d-flex">
                    <FaRegCalendar />
                    <p>{format(new Date(blog.created_at), "dd-MM-yyyy")}</p>
                  </div>
                </div>

                <div className="detail-main-all-blog">
                  <h3>{blog.heading}</h3>
                  <BlogContentParser html={blog.description || ""} />
                </div>
              </div>

              <div className="main-also-like">
                <h2>You may also like</h2>
                <Row className="row-gap-5 product_listing_row">
                  {filteredLatestBlogs.map((item) => (
                    <Col lg="4" md="6" key={item.slug}>
                      <div className="latest-news-card">
                        <figure>
                          <img
                            src={
                              item.image
                                ? `${BASE_URL_IMAGE}${item.image}`
                                : BlogImage
                            }
                            alt={item.heading}
                          />
                        </figure>
                        <div className="card-detail-price">
                          <div className="upper-name-and-date d-flex">
                            <div className="date-news d-flex">
                              <FaRegCalendar />
                              <p>
                                {format(
                                  new Date(item.created_at),
                                  "dd-MM-yyyy"
                                )}
                              </p>
                            </div>
                            <div className="date-news d-flex">
                              <LuUser className="user" />
                              <p>By {item.author}</p>
                            </div>
                          </div>
                          <h3 className="blg_heading">{item.heading}</h3>
                          <p className="discript_news_article">
                            <span
                              dangerouslySetInnerHTML={{
                                __html:
                                  item.description &&
                                    item.description.length > 100
                                    ? `${item.description.substring(0, 100)}...`
                                    : item.description || "",
                              }}
                            />
                          </p>
                          <a
                            href={`http://192.168.0.32:3002/blog/${blog.slug}`}
                            className="main-btn"
                          >
                            Read more
                          </a>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </Container>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogDetail;
