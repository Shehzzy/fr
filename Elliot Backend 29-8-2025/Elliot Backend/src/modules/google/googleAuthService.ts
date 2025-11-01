import { OAuth2Client } from 'google-auth-library';
import * as Models from '../../models/index';
import * as DAO from '../../DAO/index';
import userServices from '../user/user.services';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuthService {
    
    static async verifyGoogleToken(tokenId: string) {
        try {
            const ticket = await client.verifyIdToken({
                idToken: tokenId,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            
            return ticket.getPayload();
        } catch (error) {
            throw new Error('Invalid Google token');
        }
    }

    static async googleLogin(tokenId: string, language: string = 'ENGLISH') {
        try {
            const payload = await this.verifyGoogleToken(tokenId);
            if (!payload) {
                throw await this.handleCustomError("INVALID_GOOGLE_TOKEN", language);
            }

            const { sub: googleId, email, name, picture } = payload;

            if (!email) {
                throw await this.handleCustomError("GOOGLE_EMAIL_REQUIRED", language);
            }

            // Check if user exists with Google ID
            const query = { 
                $or: [
                    { googleId },
                    { email: email.toLowerCase().trim() }
                ] 
            };
            const projection = { __v: 0 };
            const options = { lean: true };

            const users: any[] = await DAO.getData(Models.Users, query, projection, options);
            let user = users[0];

            if (user) {
                // User exists - handle different cases
                if (user.googleId === googleId) {
                    // User logging in with Google (existing Google user)
                    if (!user.otp_verified) {
                        // Auto-verify Google users
                        await DAO.findAndUpdate(
                            Models.Users, 
                            { _id: user._id }, 
                            { otp_verified: true }, 
                            { new: true, lean: true }
                        );
                        user.otp_verified = true;
                    }
                } else if (user.email === email.toLowerCase().trim() && !user.googleId) {
                    // User exists with email but no Google account - link them
                    const updateData = {
                        googleId,
                        otp_verified: true,
                        provider: 'google',
                        image: picture || user.image
                    };
                    
                    user = await DAO.findAndUpdate(
                        Models.Users,
                        { _id: user._id },
                        updateData,
                        { new: true, lean: true }
                    );
                }
            } else {
                // Create new user with Google
                const newUserData = {
                    googleId,
                    full_name: name,
                    email: email.toLowerCase().trim(),
                    otp_verified: true,
                    provider: 'google',
                    image: picture,
                    role: 'USER'
                };

                user = await DAO.saveData(Models.Users, newUserData);
            }

            // Generate token using your existing method
            const tokenData = await userServices.generateUserToken(user._id);
            const userResponse = await userServices.makeUserResponse(tokenData, language);

            return userResponse;

        } catch (error) {
            throw error;
        }
    }

    static async handleCustomError(errorCode: string, language: string) {
        const errorMessages: any = {
            GOOGLE_EMAIL_REQUIRED: "Google account email is required",
            INVALID_GOOGLE_TOKEN: "Invalid Google token"
        };
        
        return {
            error: errorCode,
            error_description: errorMessages[errorCode] || "Google authentication failed"
        };
    }
}