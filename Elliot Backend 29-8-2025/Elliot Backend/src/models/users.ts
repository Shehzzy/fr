import mongoose, { Schema, Document, model } from 'mongoose';
import * as Models from './index';
import * as DAO from '../DAO/index';

export interface IUser extends Document {
  full_name: string | null;
  email: string | null;
  otp: string | null;
  image: string | null;
  password: string | null;
  role: string;
  created_at: string;
  first_login: boolean;
  security_code: string;
  otp_verified: boolean;
  has_accessed_once: boolean;
  subscription_status: 'active' | 'inactive';
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeCurrentPeriodEnd: number; // Timestamp for end of billing period
  stripeCheckoutSessionId: string | null
}

const UserSchema = new Schema<IUser>({
  full_name: { type: String, default: null },
  email: { type: String, default: null },
  image: { type: String, default: null },
  otp: { type: String, default: null },
  otp_verified: { type: Boolean, default: false },
  first_login: { type: Boolean, default: false },
  password: { type: String, default: null },
  role: { type: String, default: 'USER' },
  security_code: { type: String, default: null },
  has_accessed_once: { type: Boolean, default: false },
  subscription_status: {
    type: String, enum: ['active', 'inactive', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'past_due'],
    default: 'inactive',
  },
  stripeCustomerId: { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },
  stripeCurrentPeriodEnd: { type: Number, default: null },
  stripeCheckoutSessionId: { type: String, default: null },

  created_at: { type: String, default: () => `${+new Date()}` },
}, { timestamps: true });

UserSchema.pre('findOneAndDelete', async function (next) {
  const query = this;
  const user = await query.model.findOne(query.getFilter());

  if (user) {
    const userId = user._id;
    console.log('User ID in models', userId);
    await DAO.removeMany(Models.Sessions, { user_id: userId });
  }

  next();
});

const Users = model<IUser>('users', UserSchema);
export default Users;
