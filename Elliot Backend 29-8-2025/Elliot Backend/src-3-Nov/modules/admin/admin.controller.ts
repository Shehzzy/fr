import type express from 'express';
import * as DAO from '../../DAO/index';
import * as Models from '../../models/index';
import { handleCatch, handleCustomError, helpers, sendResponse } from '../../middlewares/index';
import adminServices from './admin.services';
import { sendOTP } from '../../middlewares/email_services';
import * as emailServices from '../../middlewares/email_services';
import path from 'path';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';
import Stripe from 'stripe';
import slugify from 'slugify';

const stripe: any = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const fs = require('fs');

class adminController {
  static async login(req: any, res: express.Response) {
    try {
      const { email, password: input_password, language } = req.body;
      let response: any;

      //Check Email exixts or not
      const query = { email: email.toLowerCase() };
      const projection = { __v: 0 };
      const options = { lean: true };
      const fetch_data: any = await DAO.getData(Models.Admin, query, projection, options);

      if (fetch_data.length) {
        const { _id, password } = fetch_data[0];

        const decryt = await helpers.decrypt_password(input_password, password);

        if (decryt !== true) {
          throw await handleCustomError('INCORRECT_PASSWORD', language);
        } else {
          const generate_token = await adminServices.generateAdminToken(_id);
          response = await adminServices.makeAdminResponse(generate_token, language);
          const message = 'Login Successfully';

          const resp = {
            user_details: {
              _id: response._id,
              email: response.email,
              name: response.name,
              access_token: response.access_token,
            },
            message: message,
          };
          sendResponse(res, resp, 'Success');
        }
      } else {
        throw await handleCustomError('EMAIL_NOT_REGISTERED', language);
      }
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async viewProfile(req: any, res: express.Response) {
    try {
      const { _id: admin_id } = req.user_data;
      const query = { _id: admin_id };
      const projection = { password: 0 };
      const options = { lean: true };
      const response = await DAO.getData(Models.Admin, query, projection, options);
      const message = 'Success';
      sendResponse(res, response, message);
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async updateProfile(req: any, res: express.Response) {
    try {
      const _id = req.user_data._id;
      const data = await adminServices.updateAdmin(_id, req.body, req.files || null);
      sendResponse(res, data, 'Profile updated successfully.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async forgetPassword(req: any, res: express.Response) {
    try {
      const { email, language } = req.body;
      const query = { email: email.toLowerCase() };
      const fetch_data: any = await adminServices.verifyAdmin(query);

      if (fetch_data.length) {
        const { _id } = fetch_data[0];
        const security_code = await helpers.gen_unique_code(Models.Admin);

        const query = { _id: _id };
        const update = { security_code: security_code };
        const options = { new: true };
        const Update_data = await DAO.findAndUpdate(Models.Admin, query, update, options);

        await emailServices.adminForgetPasswordMail(Update_data);
        const message = 'Reset Password Link is sent on your email.';

        sendResponse(res, message, 'Success');
      } else {
        throw await handleCustomError('EMAIL_NOT_REGISTERED', language);
      }
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async validateResetLink(req: any, res: express.Response) {
    try {
      const { security_code, language } = req.body;

      if (!security_code) {
        throw await handleCustomError('SECURITY_CODE_REQUIRED', language);
      }

      const fetch_data: any = await DAO.getData(Models.Admin, { security_code }, {}, { lean: true });

      if (fetch_data.length) {
        return sendResponse(res, 'Reset link is valid', 'Success');
      } else {
        throw await handleCustomError('LINK_EXPIRED', language);
      }
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async setNewPassword(req: any, res: express.Response) {
    try {
      const { password, security_code, language } = req.body;

      const fetch_data: any = await DAO.getData(Models.Admin, { security_code }, {}, { lean: true });

      if (!fetch_data.length) {
        throw await handleCustomError('LINK_EXPIRED', language);
      }

      const { _id } = fetch_data[0];
      const hashedPassword = await helpers.bcrypt_password(password);

      await DAO.findAndUpdate(Models.Admin, { _id }, { password: hashedPassword }, { new: true });

      // Invalidate link after use
      await DAO.findAndUpdate(Models.Admin, { _id }, { security_code: null }, { new: true });

      sendResponse(res, 'New Password Set Successfully', 'Success');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async changePassword(req: any, res: express.Response) {
    try {
      const { old_password, new_password, language } = req.body;
      const user_id = req.user_data._id;

      await adminServices.changePassword(user_id, old_password, new_password, language);
      sendResponse(res, null, 'Password changed successfully.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async createUser(req: any, res: express.Response) {
    try {
      const createUser = await adminServices.createUser(req.body, req.files || null);
      await sendOTP(createUser);
      sendResponse(res, null, 'Account is successfully created. OTP Sent on email.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async editUser(req: any, res: express.Response) {
    try {
      const _id = req.body._id;

      const createUser = await adminServices.editUser(_id, req.body, req.files || null);
      sendResponse(res, createUser, 'Profile updated successfully.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async getUser(req: any, res: express.Response) {
    try {
      const query = req?.query?.search
        ? {
            $or: [
              { full_name: { $regex: req.query.search, $options: 'i' } },
              { email: { $regex: req.query.search, $options: 'i' } },
            ],
          }
        : {};

      const projection = { __v: 0 };

      const options = {
        lean: true,
        sort: { created_at: -1 },
      };

      const response = await DAO.getData(Models.Users, query, projection, options);

      sendResponse(res, response, 'Success');
    } catch (err) {
      console.error('Error fetching user:', err);
      handleCatch(res, err);
    }
  }

  static async deleteUser(req: any, res: any) {
    try {
      const userId = req.params.id;

      const user = await Models.Users.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          error_description: 'User not found',
        });
      }

      await Models.Users.findByIdAndDelete(userId);

      return res.status(200).json({
        status: true,
        code: 200,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete User Error:', error.message);
      return res.status(500).json({
        status: false,
        error_description: 'Something went wrong while deleting the user',
      });
    }
  }

  static async countUsers(req: any, res: any) {
    try {
      const count = await adminServices.getUserCount();
      res.status(200).json({ success: true, count });
    } catch (error) {
      console.error('Error in countUsers:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }

  static async getAllUsers(req: any, res: any) {
    try {
      const users = await adminServices.getAllUsers();
      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }

  //======================DYNAMICALLY UPDATE USER DATA OF HOME ETC.=======================

  static async createHome(req: any, res: any) {
    try {
      const {
        home1Heading,
        home1HeadingGreen,
        homeDesc,
        homeSubHeading,
        homeDesc2,
        homeDesc3,
        home3Heading,
        home3HeadingGreen,
        homeCardHeading1,
        homeCardDesc1,
        homeCardHeading2,
        homeCardDesc2,
        homeCardHeading3,
        homeCardDesc3,
        homeDesc4,
        homeDesc4Green,
        home2Heading,
        home2CardHeading1,
        home2CardSubHeading1,
        home2CardDesc1,
        home3CardHeading1,
        home3CardSubHeaing1,
        home3CardDesc1,
        home2CardSubHeading2,
        home2CardSubHeading2Green,
        home1Btn,
        home3CardBtn,
        language = 'ENGLISH',
      } = req.body;

      if (
        !home1Heading ||
        !home1HeadingGreen ||
        !homeDesc ||
        !homeSubHeading ||
        !homeDesc2 ||
        !homeDesc3 ||
        !home3Heading ||
        !home3HeadingGreen ||
        !homeCardHeading1 ||
        !homeCardDesc1 ||
        !homeCardHeading2 ||
        !homeCardDesc2 ||
        !homeCardHeading3 ||
        !homeCardDesc3 ||
        !homeDesc4 ||
        !homeDesc4Green ||
        !home2Heading ||
        !home2CardHeading1 ||
        !home2CardSubHeading1 ||
        !home2CardDesc1 ||
        !home3CardHeading1 ||
        !home3CardSubHeaing1 ||
        !home3CardDesc1 ||
        !home2CardSubHeading2 ||
        !home2CardSubHeading2Green ||
        !home1Btn ||
        !home3CardBtn
      ) {
        throw await handleCustomError('ALL_FIELD_MANDATORY', language);
      }

      const uploadFolder = path.join(__dirname, '../../uploads/contentImages');
      if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(uploadFolder, { recursive: true });
      }

      const processImage = (fieldName: string): string => {
        const file = req.files?.[fieldName];
        if (file) {
          const fileName = `${Date.now()}_${file.name}`;
          const filePath = path.join(uploadFolder, fileName);
          file.mv(filePath);
          return `/uploads/contentImages/${fileName}`;
        }
        return '';
      };

      const homeCardImage1 = processImage('homeCardImage1');
      const homeCardImage2 = processImage('homeCardImage2');
      const homeCardImage3 = processImage('homeCardImage3');
      const home2CardImage1 = processImage('home2CardImage1');

      const homeData = {
        home1Heading,
        home1HeadingGreen,
        homeDesc,
        homeSubHeading,
        homeDesc2,
        homeDesc3,
        home3Heading,
        home3HeadingGreen,
        homeCardHeading1,
        homeCardDesc1,
        homeCardHeading2,
        homeCardDesc2,
        homeCardHeading3,
        homeCardDesc3,
        homeDesc4,
        homeDesc4Green,
        home2Heading,
        home2CardHeading1,
        home2CardSubHeading1,
        home2CardDesc1,
        home3CardHeading1,
        home3CardSubHeaing1,
        home3CardDesc1,
        home2CardSubHeading2,
        home2CardSubHeading2Green,
        home1Btn,
        home3CardBtn,
        homeCardImage1,
        homeCardImage2,
        homeCardImage3,
        home2CardImage1,
      };

      const existing = await DAO.getData(Models.HomeSch, { status: 1 }, {}, { lean: true });
      if (existing?.length > 0) {
        throw await handleCustomError('DATA_ALREADY_EXISTS', language);
      }

      console.log(homeData);

      const savedData = await DAO.saveData(Models.HomeSch, homeData);
      if (!savedData) {
        throw await handleCustomError('NO_DATA_FOUND', language);
      }

      sendResponse(res, savedData, 'Home Data successfully created.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async updateHome(req: any, res: any): Promise<void> {
    try {
      const {
        home_id,
        home1Heading,
        home1HeadingGreen,
        homeDesc,
        homeSubHeading,
        homeDesc2,
        homeDesc3,
        home3Heading,
        home3HeadingGreen,
        homeCardHeading1,
        homeCardDesc1,
        homeCardHeading2,
        homeCardDesc2,
        homeCardHeading3,
        homeCardDesc3,
        homeDesc4,
        homeDesc4Green,
        home2Heading,
        home2CardHeading1,
        home2CardSubHeading1,
        home2CardDesc1,
        home3CardHeading1,
        home3CardSubHeaing1,
        home3CardDesc1,
        home2CardSubHeading2,
        home2CardSubHeading2Green,
        home1Btn,
        home3CardBtn,
        language = 'ENGLISH',
      } = req.body;

      const updatedData: any = {};

      if (home1Heading !== undefined) updatedData.home1Heading = home1Heading;
      if (home1HeadingGreen !== undefined) updatedData.home1HeadingGreen = home1HeadingGreen;
      if (homeDesc !== undefined) updatedData.homeDesc = homeDesc;
      if (homeSubHeading !== undefined) updatedData.homeSubHeading = homeSubHeading;
      if (homeDesc2 !== undefined) updatedData.homeDesc2 = homeDesc2;
      if (homeDesc3 !== undefined) updatedData.homeDesc3 = homeDesc3;
      if (home3Heading !== undefined) updatedData.home3Heading = home3Heading;
      if (home3HeadingGreen !== undefined) updatedData.home3HeadingGreen = home3HeadingGreen;
      if (homeCardHeading1 !== undefined) updatedData.homeCardHeading1 = homeCardHeading1;
      if (homeCardDesc1 !== undefined) updatedData.homeCardDesc1 = homeCardDesc1;
      if (homeCardHeading2 !== undefined) updatedData.homeCardHeading2 = homeCardHeading2;
      if (homeCardDesc2 !== undefined) updatedData.homeCardDesc2 = homeCardDesc2;
      if (homeCardHeading3 !== undefined) updatedData.homeCardHeading3 = homeCardHeading3;
      if (homeCardDesc3 !== undefined) updatedData.homeCardDesc3 = homeCardDesc3;
      if (homeDesc4 !== undefined) updatedData.homeDesc4 = homeDesc4;
      if (homeDesc4Green !== undefined) updatedData.homeDesc4Green = homeDesc4Green;
      if (home2Heading !== undefined) updatedData.home2Heading = home2Heading;
      if (home2CardHeading1 !== undefined) updatedData.home2CardHeading1 = home2CardHeading1;
      if (home2CardSubHeading1 !== undefined) updatedData.home2CardSubHeading1 = home2CardSubHeading1;
      if (home2CardDesc1 !== undefined) updatedData.home2CardDesc1 = home2CardDesc1;
      if (home3CardHeading1 !== undefined) updatedData.home3CardHeading1 = home3CardHeading1;
      if (home3CardSubHeaing1 !== undefined) updatedData.home3CardSubHeaing1 = home3CardSubHeaing1;
      if (home3CardDesc1 !== undefined) updatedData.home3CardDesc1 = home3CardDesc1;
      if (home2CardSubHeading2 !== undefined) updatedData.home2CardSubHeading2 = home2CardSubHeading2;
      if (home2CardSubHeading2Green !== undefined) updatedData.home2CardSubHeading2Green = home2CardSubHeading2Green;
      if (home1Btn !== undefined) updatedData.home1Btn = home1Btn;
      if (home3CardBtn !== undefined) updatedData.home3CardBtn = home3CardBtn;

      // Handle file uploads (local)
      if (req.files) {
        const uploadFolder = path.join(__dirname, '../../uploads/contentImages');
        if (!fs.existsSync(uploadFolder)) {
          fs.mkdirSync(uploadFolder, { recursive: true });
        }

        const processUpload = (fieldName: string, keyName: string) => {
          const uploadedFile = (req.files as any)[fieldName];
          if (uploadedFile) {
            const fileName = `${Date.now()}_${uploadedFile.name}`;
            const filePath = path.join(uploadFolder, fileName);
            uploadedFile.mv(filePath);
            updatedData[keyName] = `/uploads/contentImages/${fileName}`;
          }
        };

        processUpload('homeCardImage1', 'homeCardImage1');
        processUpload('homeCardImage2', 'homeCardImage2');
        processUpload('homeCardImage3', 'homeCardImage3');
        processUpload('home2CardImage1', 'home2CardImage1');
      }

      if (home_id) {
        // UPDATE existing home data
        const query = { _id: home_id };
        const options = { lean: true };

        const userResponse = await DAO.findAndUpdate(Models.HomeSch, query, updatedData, options);

        if (!userResponse) {
          return res.status(404).json({ status: false, message: 'Home data not found' });
        }

        sendResponse(res, userResponse, 'Home Data successfully updated.');
      } else {
        // CREATE new home data (upsert pattern - create if doesn't exist)
        const existing = await DAO.getData(Models.HomeSch, { status: 1 }, {}, { lean: true });

        if (existing && existing.length > 0) {
          // If home data exists, update it
          const query = { status: 1 };
          const options = { lean: true };
          const userResponse = await DAO.findAndUpdate(Models.HomeSch, query, updatedData, options);

          if (!userResponse) {
            return res.status(404).json({ status: false, message: 'Home data not found' });
          }

          sendResponse(res, userResponse, 'Home Data successfully updated.');
        } else {
          // If no home data exists, create new one
          updatedData.status = 1;
          const savedData = await DAO.saveData(Models.HomeSch, updatedData);

          if (!savedData) {
            return res.status(400).json({ status: false, message: 'Failed to create home data' });
          }

          sendResponse(res, savedData, 'Home Data successfully created.');
        }
      }
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async getHome(req: any, res: any): Promise<void> {
    try {
      const language: string = (req.query.language as string) || 'ENGLISH';

      const query = { status: 1 };
      const projections = { __v: 0 };
      const options = { lean: true };

      const userResponse = await DAO.getData(Models.HomeSch, query, projections, options);
      if (!userResponse || userResponse.length === 0) {
        throw await handleCustomError('NO_DATA_FOUND', language);
      }

      sendResponse(res, userResponse, 'Home Data successfully fetched.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  //==================BLOGS======================

  static async createBlog(req: any, res: any) {
    try {
      const { heading, description, userId, language } = req.body;

      if (!heading || !description || !userId) {
        throw await handleCustomError('ALL_FIELD_MANDATORY', language);
      }

      const admin = await DAO.getDataById(Models.Admin, userId);
      if (!admin) {
        throw await handleCustomError('ADMIN_NOT_FOUND', language);
      }

      const profileImage = admin.image;
      const author = admin.name;

      if (!req.files || !req.files.image) {
        throw await handleCustomError('FILE_NOT_UPLOAD', language);
      }

      const image = await adminController.uploadFile(req.files.image, 'uploads/blogImages');

      // Generate slug from heading
      const slug = slugify(heading, { lower: true, strict: true });

      const data = {
        heading,
        author,
        description,
        image,
        authorProfileImage: profileImage,
        slug,
        status: 1,
      };

      const response = await DAO.saveData(Models.Blog, data);

      if (!response) {
        throw await handleCustomError('DATA_NOT_SAVE', language);
      }

      sendResponse(res, response, 'Blog added successfully.');
    } catch (err: any) {
      if (err.code === 11000 && err.keyPattern?.slug) {
        // Duplicate slug error
        return res.status(400).json({
          status: false,
          code: 400,
          error: 'DUPLICATE_SLUG',
          message: 'A blog with the same heading/slug already exists. Please use a different Heading.',
        });
      }

      handleCatch(res, err);
    }
  }

  static async updateBlog(req: any, res: any) {
    try {
      const { slug, heading, author, description, language } = req.body;

      if (!slug || !heading || !author || !description) {
        throw await handleCustomError('ALL_FIELD_MANDATORY', language);
      }

      const updateData: any = {
        heading,
        author,
        description,
        language,
        slug: slugify(heading, { lower: true, strict: true }),
      };

      if (req.files && req.files.image) {
        updateData.image = await adminController.uploadFile(req.files.image, 'uploads/blogImages');
      }

      // Update blog by slug
      const query = { slug };
      const options = { lean: true };
      const response = await DAO.findAndUpdate(Models.Blog, query, updateData, options);

      if (!response) {
        throw await handleCustomError('DATA_NOT_SAVE', language);
      }

      sendResponse(res, response, 'Blog updated successfully.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async getBlogBySlug(req: any, res: any) {
    try {
      const { slug } = req.params;
      const query = { slug, status: 1 };
      const projections = { __v: 0 };
      const options = { lean: true };

      const blog = await DAO.getBlogData(Models.Blog, query, projections, options);
      console.log(blog);

      if (!blog || blog.length === 0) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      console.log({ data: blog });
      return res.json({ data: blog });
    } catch (err: any) {
      console.error('Error fetching blog by slug:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  static async getBlog(req: any, res: any) {
    try {
      const query = { status: 1 };
      const projections = { __v: 0 };
      const options = { lean: true, sort: { created_at: -1 } };

      const blogs = await DAO.getData(Models.Blog, query, projections, options);
      const language = 'ENGLISH';

      if (!blogs || blogs.length === 0) {
        throw await handleCustomError('NO_DATA_FOUND', language);
      }

      // Now each blog has a slug for frontend URLs
      sendResponse(res, blogs, 'Blog Details successfully fetched.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async deleteBlog(req: any, res: any) {
    try {
      const { slug, language = 'ENGLISH' } = req.body;
      console.log(req.body);

      if (!slug) {
        throw await handleCustomError('ALL_FIELD_MANDATORY', language);
      }

      const query: any = { slug };

      const userResponse = await DAO.deleteData(Models.Blog, query);

      if (!userResponse) {
        throw await handleCustomError('DATA_NOT_SAVE', language);
      }

      sendResponse(res, userResponse, 'Blog successfully deleted.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async uploadFile(file: any, uploadPath: string): Promise<string> {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      const uploadDir = path.join(__dirname, '../../public/', uploadPath);

      // Ensure upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate a unique file name
      const uniqueFileName = `${Date.now()}_${file.name}`;
      const finalPath = path.join(uploadDir, uniqueFileName);

      // Move file to the server's storage
      await new Promise<void>((resolve, reject) => {
        file.mv(finalPath, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Return the file path
      const filePath = path.join(uploadPath, uniqueFileName);
      return filePath;
    } catch (err: any) {
      throw new Error(`File upload failed: ${err.message}`);
    }
  }

  static async getPrivacyPolicy(req: any, res: any) {
    try {
      const policy = await Models.PrivacyPolicy.findOne();
      if (!policy) sendResponse(res, policy, 'Privacy Policy not found');
      sendResponse(res, policy, 'Privacy Policy Fetched');
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async updatePrivacyPolicy(req: any, res: any) {
    try {
      const { heading, content } = req.body;
      let policy = await Models.PrivacyPolicy.findOne();

      if (policy) {
        policy.heading = heading;
        policy.content = content;
        await policy.save();
      } else {
        policy = await Models.PrivacyPolicy.create({ heading, content });
      }

      sendResponse(res, policy, 'Privacy Policy Updated!!!');
    } catch (error) {
      handleCatch(res, error);
    }
  }

  static async getAllMeta(req: any, res: any) {
    const meta = await Models.PageMetaModel.find();
    res.json(meta);
  }

  static async getMetaByPage(req: any, res: any) {
    const { page } = req.params;
    const meta = await Models.PageMetaModel.findOne({ page });
    if (!meta) return res.status(404).json({ status: false, message: 'Meta not found' });
    res.json(meta);
  }

  static async updateMeta(req: any, res: any) {
    const { page } = req.params; 
    const { title, description, keywords } = req.body;

    const updated = await Models.PageMetaModel.findOneAndUpdate(
      { page },
      { title, description, keywords },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Meta not found' });
    res.json(updated);
  }

  static async createMeta(req: any, res: any) {
    try {
      const { page, title, description, keywords } = req.body;

      if (!page) {
        return res.status(400).json({ status: false, message: 'Page name is required' });
      }

      const existing = await Models.PageMetaModel.findOne({ page });
      if (existing) {
        const updated = await Models.PageMetaModel.findOneAndUpdate(
          { page },
          { title, description, keywords },
          { new: true }
        );
        return res.status(200).json({ status: true, message: 'Meta updated successfully', data: updated });
      }

      const newMeta = new Models.PageMetaModel({ page, title, description, keywords });
      await newMeta.save();
      res.status(201).json({ status: true, message: 'Meta created successfully', data: newMeta });
    } catch (error: any) {
      console.error('Error creating meta:', error);
      res.status(500).json({ status: false, message: 'Error creating meta', error: error.message });
    }
  }

  static async uploadFiles(req: any, res: any) {
    const { positionType, scoringType } = req.body;
    const file = req.files?.file;

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    const uploadDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadDir, file.name);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      await file.mv(filePath);

      const data: any[] = [];

      if (file.name.endsWith('.csv')) {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row: any) => {
            data.push({
              ...row,
            });
          })
          .on('end', async () => {
            try {
              // Delete existing data for the same category
              await Models.Ranking.deleteMany({ positionType, scoringType });

              const ranking = new Models.Ranking({
                positionType,
                scoringType,
                data,
              });
              await ranking.save();
              res.status(200).json({ message: 'CSV data uploaded and saved successfully.' });
            } catch (error) {
              console.error(error);
              res.status(500).json({ error: 'Error saving data to the database.' });
            }
          });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet);

        excelData.forEach((row: any) => {
          data.push({
            ...row,
          });
        });

        try {
          // Delete existing data for the same category
          await Models.Ranking.deleteMany({ positionType, scoringType });

          const ranking = new Models.Ranking({
            positionType,
            scoringType,
            data,
          });
          await ranking.save();
          res.status(200).json({ message: 'Excel data uploaded and saved successfully.' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error saving data to the database.' });
        }
      } else {
        res.status(400).json({ error: 'Unsupported file type. Only CSV and Excel files are allowed.' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Error uploading file.');
    }
  }

  static async getRankings(req: any, res: any) {
    const { positionType, scoringType } = req.params;
    try {
      const rankings = await Models.Ranking.find({ positionType, scoringType });
      res.json(rankings);
      console.log(rankings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching data' });
    }
  }

  static async createPromoCode(req: any, res: any) {
    try {
      const {
        name,
        percent_off,
        amount_off,
        currency,
        max_redemptions,
        duration, // Added duration parameter to customize the coupon duration
      } = req.body;

      // 1. Create a Coupon
      const couponParams = {
        name: name || 'Promo Coupon',
        percent_off: percent_off || undefined,
        amount_off: amount_off || undefined,
        currency: amount_off ? currency : undefined,
        duration: duration || 'once',
        max_redemptions: max_redemptions || 1,
      };

      const coupon = await stripe.coupons.create(couponParams);

      // // 2. Create Promo Code from Coupon
      // const promoCodeParams = {
      //   coupon: coupon.id, // Use the ID of the created coupon
      //   code, // Promo code itself (e.g., "SUMMER2025")
      //   max_redemptions: max_redemptions || undefined, // Set max redemptions if provided
      //   expires_at: expires_at || undefined, // Set expiry date if provided
      //   restrictions: {
      //     first_time_transaction: one_time || false, // Restrict usage to first-time transactions if set
      //   },
      // };

      // const promoCode = await stripe.promotionCodes.create(promoCodeParams);

      return res.status(201).json({
        message: 'Promo code created successfully',
        coupon,
      });
    } catch (err: any) {
      console.error(err); // Added error logging for better debugging
      return res.status(400).json({ error: err.message });
    }
  }

  static async listPromoCodes(req: any, res: any) {
    try {
      const { active } = req.query;

      const coupons = await stripe.coupons.list({
        active: active ? active === 'true' : undefined,
        limit: 20,
      });

      sendResponse(res, coupons.data, 'Coupons fetched successfully');
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // static async updateCoupon(req: any, res: any) {
  //   try {
  //     const { coupon_id, name, redeem_by, metadata } = req.body;

  //     if (!coupon_id) {
  //       return res.status(400).json({ error: "coupon_id is required" });
  //     }

  //     const updateParams: any = {};

  //     if (name) updateParams.name = name;
  //     if (redeem_by) updateParams.redeem_by = redeem_by;
  //     if (metadata) updateParams.metadata = metadata;

  //     const updatedCoupon = await stripe.coupons.update(coupon_id, updateParams);

  //     return res.json({
  //       message: "Coupon updated successfully",
  //       coupon: updatedCoupon,
  //     });
  //   } catch (err: any) {
  //     return res.status(400).json({ error: err.message });
  //   }
  // }

  static async deleteCoupon(req: any, res: any) {
    try {
      const { coupon_id } = req.body;

      if (!coupon_id) {
        return res.status(400).json({ error: 'coupon_id is required' });
      }

      const deletedCoupon = await stripe.coupons.del(coupon_id);
      console.log(deletedCoupon);

      return res.json({
        message: 'Coupon deleted successfully',
        deletedCoupon,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default adminController;
