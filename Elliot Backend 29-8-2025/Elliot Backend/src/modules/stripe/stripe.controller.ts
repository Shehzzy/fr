import Stripe from 'stripe';
import { Request, Response } from 'express';
import * as Models from '../../models/index';
import { handleCatch, handleCustomError, sendResponse } from '../../middlewares';
import * as DAO from '../../DAO/index';
import Transaction from '../../models/Transaction';

const stripe: any = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});


class StripeController {


  static async createSubscription(req: any, res: any) {
    try {
      const { plan_id, coupon_code } = req.body;  
      const user = req.user_data;
      let customerId = user.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user._id.toString() },
        });
        customerId = customer.id;
        console.log("Customer created:", customerId);

        await DAO.findAndUpdate(
          Models.Users,
          { _id: user._id },
          { stripeCustomerId: customerId },
          { new: true }
        );
      }

      let coupon_id: string | undefined;
      if (coupon_code) {
        console.log("Validating coupon code:", coupon_code);


        const coupons = await stripe.coupons.list({
          limit: 1,
        });

        if (coupons.data.length === 0) {
          return res.status(400).json({ message: "Invalid or expired coupon code." });
        }

        coupon_id = coupons.data[0].id;
        console.log("Coupon code valid:", coupon_id);
      }


      const sessionParams: any = {
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: plan_id, quantity: 1 }],
        success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
      };


      if (coupon_id) {
        sessionParams.discounts = [{
          coupon: coupon_id, 
        }];
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      console.log("Checkout session created:", session.id);


      await DAO.findAndUpdate(
        Models.Users,
        { _id: user._id },
        { stripeCheckoutSessionId: session.id },
        { new: true }
      );

  
      res.json({ url: session.url });
    } catch (err: any) {
      console.error("Error creating Checkout Session:", err);
      handleCatch(res, err);
    }
  }



  static async storePaymentIntent(req: any, res: any) {
    try {
      const { payment_intent, plan_id } = req.body;
      const user = req.user_data;

      if (!payment_intent?.id) {
        throw handleCustomError("INVALID_PAYMENT_INTENT", "ENGLISH");
      }

      const transaction = new Transaction({
        user_id: user._id,
        transaction_id: payment_intent.id,
        type: 'stripe-subscription',
        payment_status: payment_intent.status === 'succeeded' ? 1 : 0,
        plan_id: plan_id,
        created_at: `${payment_intent.created * 1000}`,
        full_response: payment_intent,
      });

      await transaction.save();

      sendResponse(res, transaction, "Payment intent saved successfully.");
    } catch (err) {
      handleCatch(res, err);
    }
  }


  static async getSinglePlan(req: Request, res: Response): Promise<void> {
    try {
      const prices = await stripe.prices.list({
        expand: ['data.product'],
        active: true,
        limit: 1,
      });

      if (prices.data.length === 0) {
        throw await handleCustomError('NO_PLAN_FOUND', 'ENGLISH');
      }

      const price = prices.data[0];


      sendResponse(res, price, 'Plan fetched successfully.');
    } catch (err) {
      handleCatch(res, err);
    }
  }

  static async getPaymentHistory(req: any, res: any) {
    try {
      const user = req.user_data; 


      const invoices = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        status: 'paid',
      });

      if (invoices.data.length === 0) {
        return res.status(404).json({ message: 'No payment history found for this user.' });
      }
      console.log(invoices.data)

      sendResponse(res, invoices.data, 'Payment history fetched successfully');
    } catch (err) {
      console.error('Error fetching payment history:', err);
      handleCatch(res, err);
    }
  }

  static async cancelSubscription(req: any, res: any) {
    try {
      const { subscriptionId } = req.body;
      const user = req.user_data;

      if (!subscriptionId) {
        throw handleCustomError('MISSING_SUBSCRIPTION_ID', 'ENGLISH');
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (!subscription) {
        throw handleCustomError('SUBSCRIPTION_NOT_FOUND', 'ENGLISH');
      }

      let canceledSubscription;

      if (subscription.status === 'canceled') {
        canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancellation_details: {
            comment: 'Subscription cancellation attempted again',
          },
        });
      } else {
        canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        });
      }

      await DAO.findAndUpdate(
        Models.Users,
        { _id: user._id },
        {
          subscription_status: 'inactive',
          stripeSubscriptionId: null,
          stripeCurrentPeriodEnd: null,
        },
        { new: true }
      );

      sendResponse(res, canceledSubscription, 'Subscription canceled successfully');
    } catch (err) {
      handleCatch(res, err);
    }
  }


  static async createPromoCode(req: any, res: any) {
    try {
      const { couponData, promoCode } = req.body;

      if (!promoCode || !couponData) {
        return res.status(400).json({ status: false, message: "Missing promoCode or couponData" });
      }

      // Create Stripe coupon
      const coupon = await stripe.coupons.create({
        percent_off: couponData.percent_off,
        amount_off: couponData.amount_off,
        currency: couponData.currency || undefined,
        duration: couponData.duration || "once",
        duration_in_months: couponData.duration_in_months || undefined,
        name: couponData.name || `Coupon for ${promoCode}`,
        metadata: couponData.metadata || {},
      });

      // Create Stripe promotion code
      const promotionCode = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: promoCode.toUpperCase(),
        active: true,
      });

      // Determine type (priority to percent_off)
      const type = coupon.percent_off ? "percent_off" : "amount_off";

      // Save minimal fields
      const promoCodeDoc = new promoCode({
        name: promotionCode.code,
        type,
        used: 0,
        status: promotionCode.active ? "active" : "inactive",
      });

      await promoCodeDoc.save();

      return res.status(201).json({
        status: true,
        message: "Promo code created and saved successfully",
        data: {
          coupon,
          promotionCode,
        },
      });
    } catch (error: any) {
      console.error("Error creating promo code:", error);
      return res.status(500).json({
        status: false,
        message: error.message || "Failed to create promo code",
      });
    }
  }



  static async handleStripeWebhook(req: any, res: any) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log("Received Stripe Webhook signature:", sig);
    if (!req.rawBody) {
      throw new Error('Raw body not found');
    }

    try {
      const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          const planId = session.metadata?.plan_id;
          const userId = session.metadata?.user_id;

          if (!userId) {
            console.error('⚠️ User ID not found in session metadata');
            break;
          }

          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const user = await Models.Users.findById(userId);
          if (!user) {
            console.error('⚠️ User not found with ID:', userId);
            break;
          }

          const promoCode = session.discounts?.[0]?.promotion_code?.code || null;

          const transaction = new Transaction({
            user_id: user._id,
            transaction_id: session.payment_intent,
            type: 'subscription',
            payment_status: 1,
            plan_id: planId,
            subscription_id: subscription.id,
            current_period_end: subscription.current_period_end,
            status: subscription.status,
            created_at: new Date().toISOString(),
            full_response: subscription,
            promo_code: promoCode,
          });
          await transaction.save();

          user.stripeSubscriptionId = subscription.id;
          user.subscription_status = subscription.status;
          user.stripeCurrentPeriodEnd = subscription.current_period_end;
          await user.save();

          console.log(`✅ Subscription processed for user: ${user._id}`);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscriptionEvent = event.data.object;
          const userSubscription = await Models.Users.findOne({ stripeCustomerId: subscriptionEvent.customer });

          if (userSubscription) {
            userSubscription.stripeSubscriptionId = subscriptionEvent.id;
            userSubscription.subscription_status = subscriptionEvent.status;
            userSubscription.stripeCurrentPeriodEnd = subscriptionEvent.current_period_end;

            await userSubscription.save();

            console.log(`✅ Subscription ${event.type === 'customer.subscription.created' ? 'created' : 'updated'} for user: ${userSubscription._id}`);

            const transaction = new Transaction({
              user_id: userSubscription._id,
              transaction_id: subscriptionEvent.id,
              type: event.type === 'customer.subscription.created' ? 'subscription_created' : 'subscription_updated',
              payment_status: 1,
              plan_id: subscriptionEvent.items.data[0].plan.id,
              subscription_id: subscriptionEvent.id,
              current_period_end: subscriptionEvent.current_period_end,
              status: subscriptionEvent.status,
              created_at: new Date().toISOString(),
              full_response: subscriptionEvent,
            });

            await transaction.save();
          }
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object;
          const userDeleted: any = await Models.Users.findOne({ stripeCustomerId: deletedSubscription.customer });

          if (userDeleted) {
            userDeleted.stripeSubscriptionId = null;
            userDeleted.subscription_status = 'inactive';
            userDeleted.stripeCurrentPeriodEnd = null;

            await userDeleted.save();

            console.log(`✅ Subscription canceled for user: ${userDeleted._id}`);

            const canceledTransaction = new Transaction({
              user_id: userDeleted._id,
              transaction_id: deletedSubscription.id,
              type: 'subscription_canceled',
              payment_status: 0,
              plan_id: deletedSubscription.items.data[0].plan.id,
              subscription_id: deletedSubscription.id,
              current_period_end: deletedSubscription.current_period_end,
              status: 'canceled',
              created_at: new Date().toISOString(),
              full_response: deletedSubscription,
            });

            await canceledTransaction.save();
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (err: any) {
      console.error('Error processing webhook:', err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  static async verifyPayment(req: any, res: any) {
    try {
      const { session_id } = req.body; // session_id passed from frontend

      if (!session_id) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      // Retrieve session information using Stripe API
      const session = await stripe.checkout.sessions.retrieve(session_id);

      // Check if the payment was successful
      if (session.payment_status === "paid") {
        return res.json({ status: "paid" });
      } else {
        return res.json({ status: "canceled" });
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      res.status(500).send("Internal Server Error");
    }
  };



}

export default StripeController;
