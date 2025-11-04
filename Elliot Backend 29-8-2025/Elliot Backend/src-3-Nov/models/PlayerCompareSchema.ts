import mongoose, { Schema } from 'mongoose';

const PlayerCompareSchema = new Schema(
  {
    player1: { type: String, required: true },
    player2: { type: String, required: true },
    count: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const PlayerCompare = mongoose.model('PlayerCompare', PlayerCompareSchema);
