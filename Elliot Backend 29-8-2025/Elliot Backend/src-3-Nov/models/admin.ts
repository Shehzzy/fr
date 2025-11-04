import mongoose, { Schema, Document, model } from 'mongoose';
import * as Models from './index';
import * as DAO from '../DAO/index';

export interface IAdmin extends Document {
  name: string | null;
  image: string | null;
  email: string | null;
  password: string | null;
  otp: string | null;
  role: string;
  created_at: string;
  security_code: string | null;
}

const AdminSchema = new Schema<IAdmin>({
  name: { type: String, default: null },
  image: { type: String, default: null },
  email: { type: String, default: null },
  password: { type: String, default: null },
  otp: { type: String, default: null },
  role: { type: String, default: 'ADMIN' },
  security_code: { type: String, default: null },
  created_at: { type: String, default: () => `${+new Date()}` },
});

AdminSchema.pre('findOneAndDelete', async function (next) {
  const query = this;

  try {
    const admin = await query.model.findOne(query.getFilter());

    if (admin) {
      console.log('Admin ID in models:', admin._id);

      const sessionsRemoved = await DAO.removeMany(Models.Sessions, { admin_id: admin._id });
      console.log('Sessions removed:', sessionsRemoved);
    }

    next();
  } catch (err) {
    console.error('Error in findOneAndDelete middleware:', err);
    next(); // Ensure the error is passed along if something fails
  }
});

const Admin = model<IAdmin>('admins', AdminSchema);
export default Admin;
