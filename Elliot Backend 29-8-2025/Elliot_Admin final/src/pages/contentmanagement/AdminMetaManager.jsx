import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { BASE_URL_ADMIN } from "../../API";

// Pages for which we manage meta data
const pages = ["home", "compare", "weightedScores", "PrivacyPolicy", "blog"];

const AdminMetaManager = () => {
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [metaData, setMetaData] = useState({});
  const [status, setStatus] = useState(""); // Status message

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch metadata for each page from the backend
  useEffect(() => {
    async function fetchMeta() {
      const data = {};
      try {
        // Fetch metadata for each page
        for (let page of pages) {
          const res = await axios.get(`${BASE_URL_ADMIN}/meta/${page}`); // Use GET /meta/:page
          data[page] = res.data;
        }
        setMetaData(data); // Store fetched data in state
      } catch (err) {
        console.error(err)
        setStatus("Error fetching data for pages.");
      }
      setIsLoading(false);
    }

    fetchMeta();
  }, []);

  // Handle form submission to update meta data
  const onSubmit = async (data) => {
    try {
      // Update meta data for each page
      for (let page of pages) {
        if (data[page]) {
          const pageData = data[page];
          await axios.put(
            `${BASE_URL_ADMIN}/admin/page-meta/${page}`,
            pageData
          ); // Use PUT /admin/page-meta/:page
        }
      }
      setStatus("Meta updated successfully.");
    } catch (error) {
      setStatus("Error updating meta.");
    }
  };

  return (
    <>
      <Loader isLoading={isLoading} />
      <div className="container-fluid">
        <Header />
        <div className="row">
          <Sidebar />
          <div className="col-9 main-dash-left">
            <section className="back-dashboard-sec comn-dashboard-page">
              <div className="main-notification-messege">
                <h6 className="mb-4 comm_sec_heading">Manage Page Meta</h6>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  encType="multipart/form-data"
                >
                  {/* Loop through each page for meta management */}
                  {pages.map((page) => (
                    <div key={page} className="space-y-6 mb-5">
                      <h5 className="font-semibold text-xl comm_sec_heading2">
                        {page.charAt(0).toUpperCase() + page.slice(1)}
                      </h5>

                      {/* Meta Title */}
                      <div className="form-group mb-4">
                        <label className="form-label">
                          Meta Title for {page}
                        </label>
                        <input
                          className="form-control"
                          defaultValue={metaData[page]?.title || ""}
                          {...register(`${page}.title`, {
                            required: "Meta Title is required",
                          })}
                        />
                        {errors[`${page}.title`] && (
                          <p className="text-danger">
                            {errors[`${page}.title`]?.message}
                          </p>
                        )}
                      </div>

                      {/* Meta Description */}
                      <div className="form-group mb-4">
                        <label className="form-label">
                          Meta Description for {page}
                        </label>
                        <textarea
                          className="form-control"
                          rows="4"
                          defaultValue={metaData[page]?.description || ""}
                          {...register(`${page}.description`)}
                        />
                      </div>

                      {/* Meta Keywords */}
                      <div className="form-group mb-4">
                        <label className="form-label">
                          Meta Keywords for {page}
                        </label>
                        <input
                          className="form-control"
                          defaultValue={metaData[page]?.keywords || ""}
                          {...register(`${page}.keywords`)}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Submit and Reset buttons */}
                  <div className="d-flex gap-3 comm_two_inline_btns">
                    <button type="submit" className="main-btn">
                      Update Meta for All Pages
                    </button>
                    <button
                      type="button"
                      className="secondary_btn"
                      onClick={() => reset(metaData)} // Reset form to initial state
                    >
                      Reset
                    </button>
                  </div>
                </form>

                {/* Status Message */}
                {status && (
                  <p className="mt-4 text-green-700 font-medium">{status}</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminMetaManager;
