import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import "react-quill/dist/quill.snow.css";
import { BASE_URL_ADMIN, CREATE_BLOG } from "../../API";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import CustomQuillEditor from "../../components/CustomQuillEditor";

const CreateBlog = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to create a blog!");
      navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken._id;
      setUserProfile({ userId });
    } catch (error) {
      console.error("Error decoding token:", error);
      alert("Invalid token. Please log in again.");
      navigate("/login");
    }
  }, [navigate]);

  const handleFormSubmit = (data) => {
    if (!userProfile) {
      alert("User data is not available.");
      return;
    }

    setLoading(true);

    const cleanedDescription = data.description.replace(
      /<p[^>]*>(\s|&nbsp;|<br>)*<\/p>/gi,
      ""
    );

    const formData = new FormData();
    formData.append("heading", data.heading);
    formData.append("description", cleanedDescription);
    formData.append("userId", userProfile.userId);
    formData.append("image", data.image[0]);
    formData.append("language", "ENGLISH");

    axios
      .post(`${BASE_URL_ADMIN}${CREATE_BLOG}`, formData, {
        headers: {
          Token: localStorage.getItem("token"),
        },
      })
      .then((response) => {
        toast.success(response.data.message);
        navigate("/admin/blogs");
        setLoading(false);
      })
      .catch((error) => {
        // console.log(error.response.data.message);
        toast.error(error.response.data.message);
        setLoading(false);
      });
  };

  return (
    <>
      <Loader isLoading={loading} />
      <div className="container-fluid">
        <Header />
        <div className="row">
          <Sidebar />
          <div className="col-9 main-dash-left">
            {/* <Breadcrumb className="cstm_bredcrumb">
                <Breadcrumb.Item>Blogs</Breadcrumb.Item>
              </Breadcrumb> */}

            <section className="back-dashboard-sec comn-dashboard-page">
              <div className="main-notification-messege">
                <div className="notifi-list d-flex">
                  <h6>Create Blog</h6>
                </div>
                <form
                  onSubmit={handleSubmit(handleFormSubmit)}
                  className="create-blog-form"
                  encType="multipart/form-data"
                >
                  {/* Heading Field */}
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
                      <p className="error-message">{errors.heading.message}</p>
                    )}
                  </div>

                  {/* Description Field - Using React Quill */}
                  <div className="form-group">
                    <label>Description</label>
                    <Controller
                      name="description"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Description is required" }}
                      render={({ field }) => (
                        <CustomQuillEditor
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.description}
                        />
                      )}
                    />
                    {errors.description && (
                      <p className="error-message">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Blog Image Upload */}
                  <div className="form-group">
                    <label>Upload Blog Image</label>
                    <input
                      type="file"
                      {...register("image", {
                        required: "Blog image is required",
                      })}
                      className={`form-control ${
                        errors.image ? "input-error" : ""
                      }`}
                      accept="image/*"
                    />
                    {errors.image && (
                      <p className="error-message">{errors.image.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="login-btn cstm_width"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Blog"}
                  </Button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateBlog;
