// routes/stripe.routes.ts
import express from 'express';
import authenticator from '../../middlewares/authenticator';
import StripeController from '../stripe/stripe.controller';

const router = express.Router();


router.post("/create-payment-intent", authenticator, StripeController.createSubscription);
router.post('/store-payment-intent', authenticator, StripeController.storePaymentIntent);


router.post("/stripe/webhook", express.raw({ type: 'application/json', limit: '10mb' }), StripeController.handleStripeWebhook);
router.get('/plans', StripeController.getSinglePlan);
router.get("/history", authenticator, StripeController.getPaymentHistory);
router.post("/cancel-subscription", authenticator, StripeController.cancelSubscription);
// router.post("/create-promo-code", authenticator, StripeController.createPromoCode);
router.post('/verify-payment', StripeController.verifyPayment);
export default router;
