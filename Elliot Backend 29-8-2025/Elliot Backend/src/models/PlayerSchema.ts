import mongoose, { Schema, Document } from "mongoose";

export interface IPlayer extends Document {
  id: string;
  fullName: string;
}

const PlayerSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
});

export default mongoose.model<IPlayer>("PlayerImage", PlayerSchema);
