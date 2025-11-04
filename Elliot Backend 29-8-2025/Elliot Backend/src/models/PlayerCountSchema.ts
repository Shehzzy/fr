import mongoose, { Schema } from 'mongoose';
const PlayerCountSchema = new Schema(
  {
    playerId: { type: String, required: true },
    count: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const PlayerCount = mongoose.model('PlayerCount', PlayerCountSchema);
