// @ts-nocheck
import express, { Request, Response } from 'express';
import { GoogleAuthService } from './googleAuthService';
import { handleCatch } from '../../middlewares/index';

const router = express.Router();

interface GoogleLoginRequest {
    tokenId: string;
    language?: string;
}

router.post('/google-login', async (req: Request<{}, {}, GoogleLoginRequest>, res: Response) => {
    try {
        const { tokenId, language = 'ENGLISH' } = req.body;

        if (!tokenId) {
            return res.status(400).json({
                success: false,
                error: 'GOOGLE_TOKEN_REQUIRED',
                error_description: 'Google token is required'
            });
        }

        const userData = await GoogleAuthService.googleLogin(tokenId, language);
        
        res.send({
            data: userData,
            status: true,
            code: 200,
            message: 'Google login successful',
        });

    } catch (err) {
        handleCatch(res, err);
    }
});

export default router;