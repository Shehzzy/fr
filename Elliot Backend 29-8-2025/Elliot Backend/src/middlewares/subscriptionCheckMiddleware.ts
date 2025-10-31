import { handleCatch, handleCustomError } from './index';

const subscriptionCheckMiddleware = async (req: any, res: any, next: any) => {
  try {
    const user = req.body.user;

    // ✅ ONLY apply guest access check to comparison creation endpoint
    const isComparisonCreation = req.path.includes('/add-compare-player');
    
    // For all other endpoints (including /player-performances), allow access
    if (!isComparisonCreation) {
      return next();
    }

    // ✅ If no user found, treat as guest - ONLY for comparison creation
    if (!user) {
      const guestAccessed = req.headers["x-guest-accessed"] === "true";
      if (guestAccessed) {
        return res.status(403).json({
          success: false,
          message: "You have already used your one-time access. Please log in for unlimited access.",
        });
      }
      return next(); 
    }

    return next();
  } catch (err) {
    handleCatch(res, err);
  }
};



export default subscriptionCheckMiddleware;
