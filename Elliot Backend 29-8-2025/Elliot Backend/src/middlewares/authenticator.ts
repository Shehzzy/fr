import { verify_token, handleCatch, handleCustomError } from './index';
import * as DAO from "../DAO";
import * as Models from '../models';
import { app_constant } from '../config/index';
const { scope } = app_constant
const admin_scope = scope.admin
const user_scope = scope.user



const authenticator = async (req: any, res: any, next: any) => {
    try {

        let { token } = req.headers, api_path = req.originalUrl
        let set_language = 'ENGLISH';
        // let { language: body_language } = req.body, { language: query_language } = req.query
        // if (body_language != undefined) { set_language = body_language }
        // if (query_language != undefined) { set_language = query_language }
        let admin_path = api_path.includes("Admin")
        let user_path = api_path.includes("User")
        let sports_api_path = api_path.includes("Sports")
        let payments_api_path = api_path.includes("Payments")

        if (admin_path) {

            let fetch_token_data: any = await verify_token(token, admin_scope, set_language)

            if (fetch_token_data) {

                let { admin_id, access_token, token_gen_at } = fetch_token_data

                let query: any = { _id: admin_id }
                let projection = { __v: 0 }
                let options = { lean: true }
                let fetch_data: any = await DAO.getData(Models.Admin, query, projection, options)

                if (fetch_data.length > 0) {

                    fetch_data[0].access_token = access_token
                    fetch_data[0].token_gen_at = token_gen_at
                    req.user_data = fetch_data[0]
                    req.session_data = fetch_token_data

                    next();

                } else {
                    throw await handleCustomError('UNAUTHORIZED', set_language)
                }

            } else {
                throw await handleCustomError('UNAUTHORIZED', set_language)
            }

        }
        else if (user_path || sports_api_path || payments_api_path) {
            let fetch_token_data: any = await verify_token(token, user_scope, set_language)
            if (fetch_token_data) {

                let { user_id, access_token, device_type, fcm_token, token_gen_at } = fetch_token_data

                let query: any = { _id: user_id }
                let projection = { __v: 0, password: 0 }
                let options = { lean: true }
                let fetch_data: any = await DAO.getData(Models.Users, query, projection, options)

                if (fetch_data.length > 0) {

                    fetch_data[0].access_token = access_token
                    fetch_data[0].device_type = device_type
                    fetch_data[0].fcm_token = fcm_token
                    fetch_data[0].token_gen_at = token_gen_at
                    req.user_data = fetch_data[0]
                    req.session_data = fetch_token_data
                    next();

                }

                else {
                    throw await handleCustomError('UNAUTHORIZED', set_language)
                }

            } else {
                throw await handleCustomError('UNAUTHORIZED', set_language)
            }

        }
        else {

            throw await handleCustomError('UNAUTHORIZED', set_language)
        }

    }
    catch (err) {

        handleCatch(res, err)
    }
}
export default authenticator




