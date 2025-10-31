import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Loader from "../../components/Loader";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { BASE_URL_ADMIN } from "../../API";
import * as XLSX from "xlsx";

const RankingPanel = () => {
  const [isLoading, setIsLoading] = useState(false); 
  const [status, setStatus] = useState(""); 
  const [file, setFile] = useState(null); 

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    return new Promise((resolve, reject) => {
      const fileType = file.type;
      let parsedData = [];

      if (
        fileType === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          const binaryStr = reader.result;
          const workbook = XLSX.read(binaryStr, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
          resolve(parsedData);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
      } else if (fileType === "text/csv" || file.name.endsWith(".csv")) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          const csvData = result.split("\n").map((row) => row.split(","));
          resolve(csvData); 
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      } else {
        setStatus("Unsupported file type. Please upload CSV or Excel files.");
        reject("Unsupported file type.");
      }
    });
  };

  const handleFormSubmit = async (data) => {
    setIsLoading(true);

    if (!data.positionType || !data.scoringType || !file) {
      setStatus("Please select all fields and upload a file.");
      setIsLoading(false);
      return;
    }

    try {
      const parsedData = await parseFile(file);
      if (!parsedData) return; 

      // Create formData
      const formData = new FormData();
      formData.append("positionType", data.positionType);
      formData.append("scoringType", data.scoringType);
      formData.append("file", file);
      formData.append("parsedData", JSON.stringify(parsedData));

      const response = await axios.post(
        `${BASE_URL_ADMIN}/upload-csv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Token: localStorage.getItem("token"),
          },
        }
      );

      setStatus("File uploaded and data saved successfully!");
      reset(); 
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatus("Error uploading file. Please try again.");
    }

    setIsLoading(false);
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
                <h6 className="mb-4 comm_sec_heading">Upload Ranking Data</h6>

                <form
                  onSubmit={handleSubmit(handleFormSubmit)}
                  encType="multipart/form-data"
                >
                  {/* Position Type */}
                  <div className="form-group mb-4">
                    <label className="form-label">Position Type</label>
                    <select
                      className="form-control"
                      {...register("positionType", {
                        required: "Position type is required",
                      })}
                    >
                      <option value="">Select Position Type</option>
                      <option value="QB">QB</option>
                      <option value="RB">RB</option>
                      <option value="WR">WR</option>
                      <option value="TE">TE</option>
                    </select>
                    {errors.positionType && (
                      <p className="text-danger">
                        {errors.positionType.message}
                      </p>
                    )}
                  </div>

                  {/* Scoring Type */}
                  <div className="form-group mb-4">
                    <label className="form-label">Scoring Type</label>
                    <select
                      className="form-control"
                      {...register("scoringType", {
                        required: "Scoring type is required",
                      })}
                    >
                      <option value="">Select Scoring Type</option>
                      <option value="PPR">PPR</option>
                      <option value="HalfPPR">Half PPR</option>
                      <option value="Standard">Standard</option>
                    </select>
                    {errors.scoringType && (
                      <p className="text-danger">
                        {errors.scoringType.message}
                      </p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div className="form-group mb-4">
                    <label className="form-label">Upload CSV/Excel File</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Submit and Reset Buttons */}
                  <div className="d-flex gap-3 comm_two_inline_btns">
                    <button type="submit" className="main-btn">
                      Upload Data
                    </button>
                    <button
                      type="button"
                      className="secondary_btn"
                      onClick={() => reset()}
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

export default RankingPanel;
