import mongoose, { Schema, Document, model, Types } from 'mongoose';

// Enums
export type SessionType = 'USER' | 'ADMIN' | null;

// Interface for the session document
export interface ISession extends Document {
  type: SessionType;
  admin_id: Types.ObjectId | null;
  user_id: Types.ObjectId | null;
  access_token: string | null;
  token_gen_at: string | null;
  expire_time: string | null;
  created_at: string;
}

// Define the schema
const SessionsSchema = new Schema<ISession>({
  type: {
    type: String,
    enum: [null, 'USER', 'ADMIN'],
    default: null,
  },
  admin_id: {
    type: Schema.Types.ObjectId,
    ref: 'admins',
    default: null,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    default: null,
  },
  access_token: { type: String, default: null },
  token_gen_at: { type: String, default: null },
  expire_time: { type: String, default: null },
  created_at: { type: String, default: () => `${+new Date()}` },
});

// Create and export the model
const Sessions = model<ISession>('sessions', SessionsSchema);
export default Sessions;
