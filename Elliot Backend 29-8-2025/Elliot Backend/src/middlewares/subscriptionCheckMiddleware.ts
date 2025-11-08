import { handleCatch, handleCustomError } from './index';

const subscriptionCheckMiddleware = async (req: any, res: any, next: any) => {
  try {
    const user = req.body.user;

    // Logged-in users: allow all
    if (user) {
      return next();
    }

    // Guests: check if they already used their free access
    const guestAccessed = req.headers['x-guest-accessed']; // frontend sets this
    if (!guestAccessed || guestAccessed !== 'true') {
      return next(); // allow first-time guest
    }

    // Guest has already used free access: block
    return res.status(403).json({
      success: false,
      message:
        "You've already used your one-time free comparison. Please log in or subscribe for unlimited access.",
    });
  } catch (err) {
    handleCatch(res, err);
  }
};

export default subscriptionCheckMiddleware;
