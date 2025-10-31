import { handleCatch } from './index';

const subscriptionCheckMiddleware = async (req: any, res: any, next: any) => {
  try {
    const user = req.user_data;

    if (!user) {
      // Guest logic
      const guestAccessed = req.headers["x-guest-accessed"] === "true";
      if (guestAccessed) {
        return res.status(403).json({
          success: false,
          message: "You have already used your one-time access. Please log in for unlimited access.",
        });
      }
      return next(); 
    }

    next();
  } catch (err) {
    handleCatch(res, err);
  }
};

export default subscriptionCheckMiddleware;
