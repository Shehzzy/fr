import { check } from "express-validator";

// VALIDATION COMPONENTS
const email: any = check("email")
  .trim()
  .not()
  .isEmpty()
  .withMessage("Please provide email")
  .isEmail()
  .withMessage("Please provide vaild email")
  .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  .withMessage("Please provide vaild email")

const fullname: any = check("full_name")
  .trim()
  .not()
  .isEmpty()
  .withMessage("Please provide full name")

const language: any = check("language")
  .trim()
  .not()
  .isEmpty()
  .withMessage("Please provide language")

const otp: any = check("otp")
  .trim()
  .not()
  .isEmpty()
  .withMessage("Please provide otp")
  .bail()
  .isLength({ min: 6, max: 6 })
  .withMessage("Your new password should be exactly 6 characters long");

const password: any = check("password")
  .trim()
  .not()
  .isEmpty()
  .withMessage("Please provide password")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters");

// EXPORT VALIDATION
export const signupvalidation = [email, fullname, language];
export const sendOtp = [email, language];
export const checkOtp = [email, otp, language];
export const edit = [fullname, language];
export const loginValidation = [email, password, language];
export const passwordValidation = [password]

