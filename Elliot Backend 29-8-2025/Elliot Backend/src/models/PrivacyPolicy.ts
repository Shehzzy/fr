
import mongoose, { Schema } from 'mongoose';

interface PrivacyPolicy {
  heading: string | null,
  content: string | null
}

const PrivacyPolicySchema = new Schema<PrivacyPolicy>({
  heading: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
},
  { timestamps: true }
);

const PrivacyPolicyModel = mongoose.model<PrivacyPolicy>('PrivacyPolicy', PrivacyPolicySchema);
export default PrivacyPolicyModel;