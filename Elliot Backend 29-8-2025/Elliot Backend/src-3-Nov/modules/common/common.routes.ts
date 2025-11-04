import express from "express";
import commonController from "../common/common.controller";
const router = express.Router();

router.post("/logout", commonController.logout);


export default router;