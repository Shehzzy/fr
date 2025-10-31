import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import {
  BASE_URL_ADMIN,
  GET_PRIVACY_POLICY,
  UPDATE_PRIVACY_POLICY,
} from "../../API";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import CustomQuillEditor from "../../components/CustomQuillEditor";

const PrivacyPolicyEdit = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch existing policy data
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${BASE_URL_ADMIN}${GET_PRIVACY_POLICY}`
        );
        const { heading, content } = response.data.data;

        setValue("heading", heading || "");
        setValue("content", content || "");
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load privacy policy.");
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [setValue]);

  const cleanContent = (content) => {
    // Clean up unwanted <p><br></p> and other empty tags
    return content.replace(/<p[^>]*>(\s|&nbsp;|<br>)*<\/p>/gi, "");
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const cleanedContent = cleanContent(data.content); // Clean content before submitting

      const res = await axios.post(
        `${BASE_URL_ADMIN}${UPDATE_PRIVACY_POLICY}`,
        { ...data, content: cleanedContent }, // Use cleaned content
        {
          headers: {
            "Content-Type": "application/json",
            Token: localStorage.getItem("token"),
          },
        }
      );

      if (res.status === 200) {
        toast.success("Privacy Policy updated successfully!");
        navigate("/admin/privacy-policy");
      } else {
        toast.error("Failed to update policy.");
      }
    } catch (error) {
      toast.error("An error occurred while updating.");
    } finally {
      setLoading(false);
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
                  <h6>Edit Privacy Policy</h6>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="create-blog-form"
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
                      placeholder="Enter heading"
                    />
                    {errors.heading && (
                      <p className="error-message">{errors.heading.message}</p>
                    )}
                  </div>

                  {/* Content Field - CustomQuillEditor */}
                  <div className="form-group">
                    <label>Content</label>
                    <Controller
                      name="content"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Content is required" }}
                      render={({ field }) => (
                        <CustomQuillEditor
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.content} // Pass error if exists
                        />
                      )}
                    />
                    {errors.content && (
                      <p className="error-message">{errors.content.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="login-btn cstm_width"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Policy"}
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

export default PrivacyPolicyEdit;
