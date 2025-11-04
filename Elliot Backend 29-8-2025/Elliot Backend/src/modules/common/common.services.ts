import * as DAO from "../../DAO/index";
import * as Models from "../../models/index";

class commonServices {


    static async logoutUser(access_token: string) {
        try {
            const query = { access_token };
            const result: any = await DAO.removeMany(Models.Sessions, query);

            if (result.deletedCount === 0) {
                throw new Error("Session not found or already logged out");
            }

            return true;
        } catch (err) {
            throw err;
        }
    }



}

export default commonServices;