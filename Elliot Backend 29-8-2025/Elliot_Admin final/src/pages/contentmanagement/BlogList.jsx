import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BASE_URL_ADMIN, DELETE_BLOG, GET_BLOG } from "../../API";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { toast } from "react-toastify";
import { Table } from "react-bootstrap";
import HalfEye from "../../Assets/Images/edit1.svg";
import Delete1 from "../../Assets/Images/delete1.svg";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found, please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL_ADMIN}${GET_BLOG}`, {
        headers: { Token: token },
      });
      console.log(response)
      setBlogs(response.data.data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found, please log in.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      const res = await axios.post(
        `${BASE_URL_ADMIN}${DELETE_BLOG}`,
        { slug },
        { headers: { Token: token } }
      );
      setBlogs((prev) => prev.filter((blog) => blog.slug !== slug));
      toast.success(res.data.message || "Blog deleted successfully");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete the blog");
    }
  };

  return (
    <>
      <Loader isLoading={loading} />
      <div className="container-fluid">
        <Header />
        <div className="row">
          <Sidebar />
          <div className="col-9 main-dash-left">
            <section className="back-dashboard-sec comn-dashboard-page">
              <div className="main-notification-messege">
                <div className="notifi-list d-flex">
                  <h6 className="mb-4">Manage Blogs</h6>
                  <Link to="/admin/create-blog" className="btn-create">
                    Create New Blog
                  </Link>
                </div>

                <div className="notification-table">
                  <Table>
                    <thead>
                      <tr className="head-class-td">
                        <th>#</th>
                        <th>Heading</th>
                        <th>Author</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.length > 0 ? (
                        blogs.map((blog, index) => (
                          <tr key={blog._id}>
                            <td>{index + 1}</td>
                            <td>{blog.heading}</td>
                            <td>{blog.author}</td>
                            <td>
                              <div className="d-flex table_action_btn_group">
                                <Link
                                  className="view-icon"
                                  to={`/admin/edit-blog/${blog.slug}`}
                                >
                                  <img
                                    src={HalfEye}
                                    alt="Edit"
                                    className="img-fluid"
                                  />
                                </Link>
                                <button
                                  className="view-icon delete btn btn-link p-0"
                                  onClick={() => handleDelete(blog.slug)}
                                >
                                  <img
                                    src={Delete1}
                                    alt="Delete"
                                    className="img-fluid"
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">
                            No blogs available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogList;
