import express from "express";
import { handleCatch, sendResponse } from "../../middlewares/index";
import commonServices from "../common/common.services";

class commonController {

    static async logout(req: any, res: express.Response): Promise<void> {
        try {
            const access_token = req.headers.token
            if (!access_token) {
                throw new Error("Access token is required");
            }

            await commonServices.logoutUser(access_token);
            sendResponse(res, null, "Logout successful.");
        } catch (err) {
            handleCatch(res, err);
        }
    }


}

export default commonController;