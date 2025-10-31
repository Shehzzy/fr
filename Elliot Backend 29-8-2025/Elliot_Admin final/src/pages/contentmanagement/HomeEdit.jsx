"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import axios from "axios"
import { BASE_URL, BASE_URL_ADMIN, GET_HOME_DATA } from "../../API"
import Loader from "../../components/Loader"
import Header from "../../components/Header"
import Sidebar from "../../components/Sidebar"

const HomeEdit = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [homeId, setHomeId] = useState(null)
  const [homeData, setHomeData] = useState(null)
  const [isNewData, setIsNewData] = useState(false)
  const baseUrl = BASE_URL

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm()

  const fileFields = ["homeCardImage1", "homeCardImage2", "homeCardImage3", "home2CardImage1"]

  const [imagePreviews, setImagePreviews] = useState({
    homeCardImage1: "",
    homeCardImage2: "",
    homeCardImage3: "",
    home2CardImage1: "",
  })

  const fetchHomeData = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const res = await axios.get(`${BASE_URL_ADMIN}${GET_HOME_DATA}`, {
        headers: { token },
      })

      if (res?.data?.data && res.data.data.length > 0) {
        const home = res.data.data[0]
        setHomeId(home._id)
        setHomeData(home)
        setIsNewData(false)

        const previews = {}
        fileFields.forEach((field) => {
          if (home[field]) {
            previews[field] = home[field].startsWith("http") ? home[field] : `${baseUrl}${home[field]}`
          }
        })
        setImagePreviews(previews)

        const formData = { ...home }
        fileFields.forEach((field) => {
          formData[field] = undefined
        })

        reset(formData)
      } else {
        setIsNewData(true)
        setHomeData({})
        const emptyFormData = {}
        fileFields.forEach((field) => {
          emptyFormData[field] = undefined
        })
        reset(emptyFormData)
      }
    } catch (err) {
      console.error("Error fetching home data", err)
      setIsNewData(true)
      setHomeData({})
      reset({})
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHomeData()
  }, [])

  const handleImageChange = (e, field) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreviews((prev) => ({ ...prev, [field]: url }))
    }
  }

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Unauthorized. Please login.")
        return
      }

      const formData = new FormData()

      Object.keys(data).forEach((key) => {
        if (!fileFields.includes(key) && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      })

      fileFields.forEach((field) => {
        if (data[field]?.[0]) {
          formData.append(field, data[field][0])
        } else if (homeData?.[field]) {
          formData.append(field, homeData[field])
        }
      })

      formData.append("language", "ENGLISH")

      if (homeId) {
        formData.append("home_id", homeId)
      }

      setIsLoading(true)

      await axios.post(`${BASE_URL_ADMIN}/update-home`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token,
        },
      })

      alert("Home content updated successfully.")
      fetchHomeData()
    } catch (err) {
      console.error("Error:", err)
      alert(err.response?.data?.message || "Unknown error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const quillFields = [
    "homeDesc",
    "homeDesc2",
    "homeDesc3",
    "homeDesc4",
    "homeDesc4Green",
    "home2CardDesc1",
    "home3CardDesc1",
  ]

  const textFields = [
    "home1Heading",
    "home1HeadingGreen",
    "homeSubHeading",
    "home3Heading",
    "home3HeadingGreen",
    "homeCardHeading1",
    "homeCardDesc1",
    "homeCardHeading2",
    "homeCardDesc2",
    "homeCardHeading3",
    "homeCardDesc3",
    "home2Heading",
    "home2CardHeading1",
    "home2CardSubHeading1",
    "home3CardHeading1",
    "home3CardSubHeaing1",
    "home2CardSubHeading2",
    "home2CardSubHeading2Green",
    "home1Btn",
    "home3CardBtn",
  ]

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
                <div className="notifi-list ">
                  <h6 className="mb-4">Edit Home Page Content</h6>
                  {isNewData && (
                    <div className="alert alert-info mb-3">
                      <strong>New Data:</strong> No home page content found. Fill in the form below to create new
                      content.
                    </div>
                  )}
                </div>

                {!isLoading && homeData !== null && (
                  <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                    {textFields.map((field) => (
                      <div className="form-group mb-3" key={field}>
                        <label className="form-label">{field}</label>
                        <input
                          className="form-control"
                          {...register(field, { required: true })}
                          defaultValue={homeData?.[field] || ""}
                          placeholder={`Enter ${field}`}
                        />
                        {errors[field] && <small className="text-danger">{field} is required</small>}
                      </div>
                    ))}

                    {quillFields.map((field) => (
                      <div className="form-group mb-4" key={field}>
                        <label className="form-label">{field}</label>
                        <Controller
                          name={field}
                          control={control}
                          defaultValue={homeData?.[field] || ""}
                          rules={{ required: true }}
                          render={({ field: { onChange, value, ref } }) => (
                            <ReactQuill theme="snow" value={value} onChange={onChange} ref={ref} />
                          )}
                        />
                        {errors[field] && <small className="text-danger">{field} is required</small>}
                      </div>
                    ))}

                    {fileFields.map((field) => (
                      <div className="form-group mb-4 change_img_sec" key={field}>
                        <label className="form-label">{field} (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          {...register(field)}
                          onChange={(e) => handleImageChange(e, field)}
                        />
                        {imagePreviews?.[field] && (
                          <div className="mt-2">
                            <h6 className="comm_medium_heading">Current Image:</h6>
                            <img
                              src={imagePreviews[field] || "/placeholder.svg"}
                              alt={`${field} Preview`}
                              className="img-thumbnail"
                              style={{ maxWidth: "200px" }}
                            />
                            <p className="text-muted small-font mt-1">{homeData?.[field]}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="d-flex gap-3 comm_two_inline_btns">
                      <button type="submit" className="main-btn">
                        {isNewData ? "Create" : "Update"}
                      </button>
                      <button type="button" className="secondary_btn" onClick={() => reset(homeData)}>
                        Reset
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeEdit
