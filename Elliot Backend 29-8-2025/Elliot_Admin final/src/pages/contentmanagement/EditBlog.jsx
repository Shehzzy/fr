import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import "react-quill/dist/quill.snow.css";
import { BASE_URL, BASE_URL_ADMIN, IMAGE_URL, UPDATE_BLOG } from "../../API";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import CustomQuillEditor from "../../components/CustomQuillEditor";

const EditBlog = () => {
  const { slug } = useParams(); // use slug
  const [blog, setBlog] = useState(null);
  const [language, setLanguage] = useState("ENGLISH");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // for image preview

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${BASE_URL_ADMIN}/get-blog/${slug}`, { headers: { Token: token } })
      .then((res) => {
        const fetchedBlog = res.data.data;
        setBlog(fetchedBlog);
        setValue("heading", fetchedBlog.heading);
        setValue("author", fetchedBlog.author);
        setValue("description", fetchedBlog.description);
        setLanguage(fetchedBlog.language);

        if (fetchedBlog.image) {
          setPreviewImage(`${IMAGE_URL}/${fetchedBlog.image}`); // DB wali image
        }
      })
      .catch((err) => {
        console.error("Error fetching blog!", err);
        toast.error("Failed to fetch blog details");
      })
      .finally(() => setIsLoading(false));
  }, [slug, setValue, navigate]);

  const handleFormSubmit = (data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to update a blog.");
      return;
    }

    const cleanedDescription = data.description
      ? data.description.replace(/<p[^>]*>(\s|&nbsp;|<br>)*<\/p>/gi, "")
      : "";

    const formData = new FormData();
    formData.append("slug", slug); // send slug
    formData.append("heading", data.heading);
    formData.append("author", data.author);
    formData.append("description", cleanedDescription);
    if (data.image && data.image[0]) formData.append("image", data.image[0]);
    formData.append("language", language);

    axios
      .put(`${BASE_URL_ADMIN}${UPDATE_BLOG}`, formData, {
        headers: { Token: token },
      })
      .then((res) => {
        toast.success(res.data.data.message || "Blog updated successfully");
        navigate("/admin/blogs");
      })
      .catch((err) => {
        console.error("Error updating blog:", err);
        toast.error("Failed to update the blog");
      });
  };


  return (
    <>
      {!blog ? (
        <Loader isLoading={isLoading} />
      ) : (
        <div className="container-fluid">
          <Header />
          <div className="row">
            <Sidebar />
            <div className="col-9 main-dash-left">
              <section className="back-dashboard-sec comn-dashboard-page">
                <div className="main-notification-messege">
                  <div className="notifi-list d-flex">
                    <h6>Edit Blog</h6>
                  </div>
                  <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="edit-blog-form"
                  >
                    <div className="form-group">
                      <label>Heading</label>
                      <input
                        type="text"
                        {...register("heading", {
                          required: "Heading is required",
                        })}
                        className={`form-control ${
                          errors.heading ? "input-error" : ""
                        }`}
                        placeholder="Enter Heading"
                      />
                      {errors.heading && (
                        <p className="error-message">
                          {errors.heading.message}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Author</label>
                      <input
                        type="text"
                        {...register("author", {
                          required: "Author is required",
                        })}
                        className={`form-control ${
                          errors.author ? "input-error" : ""
                        }`}
                        placeholder="Enter Author"
                        disabled
                      />
                      {errors.author && (
                        <p className="error-message">{errors.author.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <CustomQuillEditor
                        value={blog.description}
                        onChange={(value) => setValue("description", value)}
                        error={errors.description}
                      />
                      {errors.description && (
                        <p className="error-message">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Upload Blog Image</label>
                      <input
                        type="file"
                        {...register("image")}
                        className="login-btn"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setPreviewImage(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {/* Image Preview */}
                      {previewImage && (
                        <div className="mt-2">
                          <img
                            src={previewImage}
                            alt="Blog Preview"
                            style={{ maxWidth: "200px", borderRadius: "8px" }}
                          />
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="login-btn cstm_width">
                      Update Blog
                    </Button>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditBlog;
