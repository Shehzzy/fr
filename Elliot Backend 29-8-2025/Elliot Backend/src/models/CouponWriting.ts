import mongoose, { Document, Schema } from 'mongoose';

export interface ICouponWriting extends Document {
  title: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponWritingSchema = new Schema<ICouponWriting>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt field before saving
couponWritingSchema.pre<ICouponWriting>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const CouponWriting = mongoose.model<ICouponWriting>('CouponWriting', couponWritingSchema);

export default CouponWriting;
