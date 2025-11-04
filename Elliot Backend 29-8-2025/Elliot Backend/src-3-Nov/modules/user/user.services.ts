import express from "express";
import * as DAO from "../../DAO/index";
import * as Models from "../../models/index";
import { app_constant } from '../../config/index'
const user_scope = app_constant.scope.user;
import { handleCustomError, generate_token, helpers } from "../../middlewares/index";
import { sendOTP, welcomeMail } from "../../middlewares/email_services"
import path from 'path';
import fs from "fs";

class userServices {

    static async saveSessionData(access_token: any, token_data: any) {
        try {
            let { _id, token_gen_at, expire_time } = token_data
            let set_data = {
                type: "USER",
                user_id: _id,
                access_token: access_token,
                token_gen_at: token_gen_at,
                created_at: +new Date(),
                expire_time: expire_time
            }
            let response = await DAO.saveData(Models.Sessions, set_data)
            return response

        } catch (err) {
            throw err;
        }
    }

    static async fetchUserToken(token_data: any) {
        try {
            let access_token = await generate_token(token_data)
            let response = await this.saveSessionData(access_token, token_data)
            return response;
        } catch (err) {
            throw err;
        }
    }

    static async fetchTotalCount(collection: any, query: any) {
        try {
            let response = await DAO.countData(collection, query);
            return response;
        } catch (err) {
            throw err;
        }
    }

    static async generateUserToken(_id: string) {
        try {
            let token_data = {
                _id: _id,
                scope: user_scope,
                collection: Models.Users,
                token_gen_at: +new Date()
            }
            let response = await this.fetchUserToken(token_data)
            return response;
        } catch (err) {
            throw err;
        }
    }

    static async makeUserResponse(data: any, language: string) {
        try {
            let { user_id, token_gen_at, access_token } = data


            let query = { _id: user_id }
            let projection = { password: 0 }
            let options = { lean: true }
            let fetch_data: any = await DAO.getData(Models.Users, query, projection, options)

            if (fetch_data.length) {
                fetch_data[0].access_token = access_token
                fetch_data[0].token_gen_at = token_gen_at

                return fetch_data[0]
            } else {
                throw await handleCustomError('UNAUTHORIZED', language)
            }

        } catch (err) {
            throw err;
        }
    }

    static async verifyUser(query: any) {
        try {
            let projection = { __v: 0 }
            let options = { lean: true }
            let response = await DAO.getData(Models.Users, query, projection, options)
            return response
        } catch (err) {
            throw err;
        }
    }

    static async createUser(req_data: any, file: any) {
        try {

            const { full_name, email, password, language } = req_data
            const projection = { __v: 0 }
            const options = { lean: true }
            const check: any = await DAO.getData(Models.Users, { email: email.toLowerCase() }, projection, options);
            if (check.length > 0) {
                throw await handleCustomError("THIS_DATA_ALREADY_EXIT", language)
            }

            let number = Math.floor(100000 + Math.random() * 900000);
            const hashedPassword = await helpers.bcrypt_password(password);

            const data: any = {
                full_name: full_name,
                email: email.toLowerCase(),
                password: hashedPassword,
                add_by: 'SELF',
                otp: number
            }
            if (file) {
                let image = await this.uploadFile(file, 'uploads/user/image');
                data.image = image
            }
            const response = await DAO.saveData(Models.Users, data)
            return response;
        } catch (err) {
            throw err;
        }
    }

    static async editUser(id: any, req_data: any, file: any) {
        try {

            const { full_name, language } = req_data
            const projection = { __v: 0 }
            const options = { lean: true }
            const check: any = await DAO.getData(Models.Users, { _id: id }, projection, options);
            if (!check.length) {
                throw await handleCustomError("NO_DATA_FOUND", language)
            }

            const data: any = {
                full_name: full_name,
            }
            if (file) {
                let image = await this.uploadFile(file, 'uploads/user/image');
                data.image = image
            }
            const response = await DAO.findAndUpdate(Models.Users, { _id: id }, data, options)
            return response;
        } catch (err) {
            throw err;
        }
    }

    static async loginUser(req_data: any, res: express.Response) {
        try {

            const { email, password, language } = req_data
            const query = { email: email.toLowerCase().trim() };
            const projection = { __v: 0 };
            const options = { lean: true };

            const users: any[] = await DAO.getData(Models.Users, query, projection, options);

            if (!users.length) {
                throw await handleCustomError("EMAIL_NOT_VALID", language);
            }

            const user = users[0];
            // Check if OTP is verified
            if (!user.otp_verified) {
                let number = Math.floor(100000 + Math.random() * 900000);
                let update = { otp: number }

                const updatedata = await DAO.findAndUpdate(Models.Users, query, update, { new: true, lean: true })
                await sendOTP(updatedata)
                throw await handleCustomError("OTP_NOT_VERIFIED", language);
            }

            // Check if user has password field
            if (!user.password) {
                throw await handleCustomError("PASSWORD_NOT_SET", language);
            }

            const isMatch = await helpers.decrypt_password(password, user.password);
            if (!isMatch) {
                throw await handleCustomError("INCORRECT_PASSWORD", language);
            }
            // Generate JWT token
            const tokenData = await this.generateUserToken(user._id);
            const userResponse = await this.makeUserResponse(tokenData, language);

            return userResponse;
        } catch (err) {
            throw err;
        }
    }

    static async uploadFile(file: any, uploadPath: string) {
        try {
            if (!file || !file.image) {
                handleCustomError("FILE_NOT_UPLOAD", 'ENGLISH');
            }

            const uploadedFile = file.image
            const uploadDir = path.join(__dirname, '../../public/' + uploadPath);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const uniqueFileName = `${Date.now()}_${uploadedFile.name}`;
            const finalPath = path.join(uploadDir, uniqueFileName);

            await new Promise<void>((resolve, reject) => {
                uploadedFile.mv(finalPath, (err: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            const imagePath = path.join(uploadPath, uniqueFileName);
            return imagePath;
        } catch (err) {
            throw err;
        }

    }
    static async changePassword(user_id: string, old_password: string, new_password: string, language: string) {
        try {
            const projection = { password: 1 };
            const options = { lean: false };

            const users: any[] = await DAO.getData(Models.Users, { _id: user_id }, projection, options);
            if (!users.length) {
                throw await handleCustomError("NO_DATA_FOUND", language);
            }

            const user = users[0];
            const isMatch = await helpers.decrypt_password(old_password, user.password);
            if (!isMatch) {
                throw await handleCustomError("INCORRECT_OLD_PASSWORD", language);
            }

            const hashedPassword = await helpers.bcrypt_password(new_password);
            user.password = hashedPassword;
            await user.save();

            return true;
        } catch (err) {
            throw err;
        }
    }

}

export default userServices