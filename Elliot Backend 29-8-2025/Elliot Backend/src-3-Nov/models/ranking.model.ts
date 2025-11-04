import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the Ranking document
interface IRanking extends Document {
  positionType: string;
  scoringType: string;
  data: object;
}

const rankingSchema: Schema = new Schema(
  {
    positionType: { type: String, required: true },
    scoringType: { type: String, required: true },
    data: { type: Object, required: true },
  },
  { timestamps: true }
);

const Ranking = mongoose.model<IRanking>('Ranking', rankingSchema);

export default Ranking;
