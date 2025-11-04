import express from 'express';
import * as DAO from '../../DAO/index';
import * as Models from '../../models/index';
import { handleCatch, handleCustomError, sendResponse, helpers } from '../../middlewares/index';
import userServices from './user.services';
import { sendOTP, welcomeMail } from '../../middlewares/email_services';
import * as emailServices from '../../middlewares/email_services';

class userController {
  static async signUp(req: any, res: express.Response) {
    try {
      let createUser = await userServices.createUser(req.body, req.files);
      await sendOTP(createUser);
      sendResponse(res, null, 'Your account is successfully created. Please check your email and verify your OTP.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async sendOtp(req: any, res: express.Response) {
    try {
      let { email, language } = req.body;
      let query = { email: email.toLowerCase() };
      let projection = { __v: 0 };
      let options = { lean: true };
      let fetch_data: any = await DAO.getData(Models.Users, query, projection, options);
      let number = Math.floor(100000 + Math.random() * 900000);

      if (fetch_data.length) {
        let { _id } = fetch_data[0];
        let query = { _id: _id };
        let update = { otp: number };
        let options = { new: true };
        const updatedata = await DAO.findAndUpdate(Models.Users, query, update, options);
        await sendOTP(updatedata);
        sendResponse(res, null, 'OTP sent successfully. Please check your email and verify the OTP.');
      } else {
        throw await handleCustomError('NO_DATA_FOUND', language);
      }
    } catch (err) {
      handleCatch(res, err);
    }
  }
  static async resendOtp(req: any, res: express.Response) {
    try {
      let { email, language } = req.body;
      let query = { email: email.toLowerCase() };
      let projection = { __v: 0 };
      let options = { lean: true };

      let fetch_data: any = await DAO.getData(Models.Users, query, projection, options);
      let number = Math.floor(100000 + Math.random() * 900000);

      if (fetch_data.length) {
        let { _id } = fetch_data[0];
        let updateQuery = { _id: _id };
        let update = { otp: number };
        let updateOptions = { new: true };

        const updatedata = await DAO.findAndUpdate(Models.Users, updateQuery, update, updateOptions);

        await sendOTP(updatedata);

        sendResponse(res, null, 'OTP Resend successfully. Please check your email and verify the OTP.');
      } else {
        throw await handleCustomError('NO_DATA_FOUND', language);
      }
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async checkOtp(req: any, res: express.Response) {
    try {
      console.log(req.body);
      let { email, otp, language } = req.body;
      let response: any;
      let number = Math.floor(100000 + Math.random() * 900000);

      let query = { email: email.toLowerCase() };
      let projection = { __v: 0 };
      let options = { lean: true };
      let fetch_data: any = await DAO.getData(Models.Users, query, projection, options);

      if (fetch_data.length) {
        const { _id } = fetch_data[0];

        if (fetch_data[0].otp !== otp) {
          throw await handleCustomError('WRONG_OTP', language);
        }

        // Mark OTP as verified
        const update = await DAO.findAndUpdate(
          Models.Users,
          { _id: _id },
          { otp_verified: true, otp: number },
          options
        );

        let generate_token = await userServices.generateUserToken(_id);
        response = await userServices.makeUserResponse(generate_token, language);

        let resp = {
          _id: response._id,
          email: response.email,
          full_name: response.full_name,
          access_token: response.access_token,
        };
        if (fetch_data[0].first_login == false) {
          await welcomeMail(response);
          const update = await DAO.findAndUpdate(
            Models.Users,
            { _id: _id },
            { first_login: true, otp: number },
            options
          );
          const premiumEmails = [
            'tylershadle15@gmail.com',
            'absalahuddin2014@gmail.com',
            'donadkins33@gmail.com',
            'nrelersic@gmail.com',
            'briandadams21@gmail.com',
            'kitboxinfo@gmail.com',
            'jklonowski11@gmail.com',
            'startsitem@gmail.com',
            'alejandromorates@gmail.com',
            'joanna.mall0395@gmail.com',
            'e.troop@futuremen.org',
            'tanjidshafin1234@gmail.com',
          ];
          const matchedUser = await Models.Users.findOne({ email: email });
          if (matchedUser) {
            const userEmail = matchedUser.email?.toLowerCase();
            if (userEmail && premiumEmails.map((e) => e.toLowerCase()).includes(userEmail)) {
              await Models.Users.findOneAndUpdate(
                { email: matchedUser.email },
                { $set: { subscription_status: 'active' } },
                { new: true }
              );
              console.log('✅ Subscription activated for:', matchedUser.email);
            }
          }
        } else {
          const update = await DAO.findAndUpdate(Models.Users, { _id: _id }, { otp: number }, options);
        }
        console.log(resp);
        sendResponse(res, resp, 'Successfully Logged In');
      } else {
        throw await handleCustomError('EMAIL_NOT_REGISTERED', language);
      }
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async viewProfile(req: any, res: express.Response) {
    try {
      let { _id: user_id } = req.user_data;
      let query = { _id: user_id };
      let projection = { otp: 0 };
      let options = { lean: true };
      let response: any = await DAO.getData(Models.Users, query, projection, options);
      // let trancRes: any = await DAO.getData(Models.Transaction, query, projection, options)
      // let trancData = trancRes[0];
      let data = response[0];

      let newResponse = {
        full_name: data.full_name,
        email: data.email,
        image: data.image,
        has_accessed_once: data.has_accessed_once,
        subscription_status: data.subscription_status,
        stripeSubscriptionId: data.stripeSubscriptionId,
        // trancStatus: trancData.status
      };

      console.log(newResponse);
      sendResponse(res, newResponse, 'Success');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async edit(req: any, res: express.Response) {
    try {
      let { _id } = req.user_data;

      let createUser = await userServices.editUser(_id, req.body, req.files || null);
      sendResponse(res, createUser, 'Profile updated successfully.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async login(req: any, res: express.Response) {
    try {
      const userData = await userServices.loginUser(req.body, res);
      sendResponse(res, userData, 'Login Successful');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async changePassword(req: any, res: express.Response) {
    try {
      const { old_password, new_password, language } = req.body;
      const user_id = req.user_data._id;

      await userServices.changePassword(user_id, old_password, new_password, language);
      sendResponse(res, null, 'Password changed successfully.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async forgetPassword(req: any, res: express.Response) {
    try {
      let { email, language } = req.body;
      let query = { email: email.toLowerCase() };
      let fetch_data: any = await userServices.verifyUser(query);

      if (fetch_data.length) {
        let { _id } = fetch_data[0];
        let security_code = await helpers.gen_unique_code(Models.Users);

        let query = { _id: _id };
        let update = { security_code: security_code };
        let options = { new: true };
        let Update_data = await DAO.findAndUpdate(Models.Users, query, update, options);

        await emailServices.userForgetPasswordMail(Update_data);
        let message = 'Reset Password Link is sent on your email.';

        sendResponse(res, message, 'Success');
      } else {
        throw await handleCustomError('EMAIL_NOT_REGISTERED', language);
      }
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async setNewPassword(req: any, res: any) {
    try {
      const { password, security_code, language }: any = req.body;

      if (!password || !security_code) {
        throw await handleCustomError('MISSING_FIELDS', language);
      }

      // 1. Find user by security code
      const query = { security_code };
      const projection = { __v: 0 };
      const options = { lean: true };
      const fetch_data = await DAO.getData(Models.Users, query, projection, options);

      if (!fetch_data.length) {
        throw await handleCustomError('LINK_EXPIRED', language);
      }

      const user = fetch_data[0];
      const bcrypt_password = await helpers.bcrypt_password(password);

      // 2. Update user password and clear the security code
      const update = {
        password: bcrypt_password,
        security_code: null,
      };
      const updateOptions = { new: true };

      await DAO.findAndUpdate(Models.Users, { _id: user._id }, update, updateOptions);

      sendResponse(res, 'Password reset successfully.', 'Success');
    } catch (err) {
      handleCatch(res, err);
    }
  }
}

export default userController;
