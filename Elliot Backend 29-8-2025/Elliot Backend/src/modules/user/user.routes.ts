import express from "express";
import userController from "./user.controller";
import authenticator from "../../middlewares/authenticator";
import { signupvalidation, sendOtp, checkOtp, edit, loginValidation} from "../../middlewares/validation";
import { validate } from "../../middlewares/validation_res";
const router = express.Router();


router.post("/sign-up", validate(signupvalidation), userController.signUp)
router.post("/check-otp", validate(checkOtp), userController.checkOtp)
router.post("/send-otp", validate(sendOtp), userController.sendOtp)
router.post("/resend-otp", validate(sendOtp), userController.resendOtp)
router.get("/view-profile", authenticator, userController.viewProfile)
router.post("/edit-profile", authenticator, validate(edit), userController.edit)
router.post("/login", validate(loginValidation), userController.login);
router.put("/forgot-password", userController.forgetPassword)
router.post("/set-new-password", userController.setNewPassword)
router.post("/change-password", authenticator, userController.changePassword);


export default router;