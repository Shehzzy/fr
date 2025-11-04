import * as DAO from "../DAO/index"
import * as Models from "../models"

const handleSuccess = (reply: any, response: any) => {
  reply.send({
    data: response,
    status: true,
    code: 200,
  })
}

const sendResponse = (reply: any, response: any, message: any) => {
  reply.send({
    data: response,
    status: true,
    code: 200,
    message: message,
  })
}

const handleCatch = (reply: any, error: any) => {
  console.log("-------------------error-->", error)

  let { type, status_code, error_message } = error

  // If error is a raw Error object, extract message properly
  if (error instanceof Error && !type) {
    type = "Internal Server Error"
    status_code = 500
    error_message = error.message || error.toString()
  }

  if (type == undefined) {
    type = "Bad Request"
  }
  if (status_code == undefined) {
    status_code = 400
  }
  if (error_message == undefined) {
    error_message = error
  }

  reply.status(status_code).send({
    error: type,
    error_description: error_message,
    status: false,
    code: status_code,
  })
}

const handleCustomError = async (type: string, language = "ENGLISH") => {
  try {
    const query = { message_type: type }
    const projection = { __v: 0 }
    const options = { lean: true }

    const fetch_data: any[] = await DAO.getData(Models.ResMessages, query, projection, options)

    if (!fetch_data.length) {
      throw {
        type: "INVALID_ERROR_TYPE",
        code: 400,
        error_message: `Error type '${type}' not found in database`,
      }
    }

    const { message_type, code, msg_in_english } = fetch_data[0]

    let error_message = "Something went wrong"

    if (language === "ENGLISH") {
      error_message = msg_in_english
    } else {
      return {
        type: "INVALID_LANGUAGE",
        code: "400",
        error_message: "Sorry, this is not a valid language",
      }
    }

    return {
      type: message_type,
      code,
      error_message,
    }
  } catch (err) {
    if (err && typeof err === "object" && "type" in err) {
      throw err // Already in proper format
    }
    throw {
      type: "DATABASE_ERROR",
      code: 500,
      error_message: err instanceof Error ? err.message : "Failed to fetch error message from database",
    }
  }
}

const handleJoiError = async (error: any) => {
  const error_message = error.details[0].message
  const custom_message = error_message.replace(/"/g, "")
  throw {
    status_code: 400,
    type: "Joi Error",
    error_message: custom_message,
  }
}
export { handleCatch, handleSuccess, handleCustomError, handleJoiError, sendResponse }
