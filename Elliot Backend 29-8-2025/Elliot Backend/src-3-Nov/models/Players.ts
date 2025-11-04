import mongoose, { Schema, Document } from 'mongoose';

interface Player {
    id: number;
    name: string;
    position: string;
    team: string;
    status: string;
    photo: string;
}



const playerSchema = new Schema<Player>({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    team: { type: String, required: true },
    status: { type: String, required: true },
    photo: { type: String, required: true },
}, { timestamps: true });

const PlayerModel = mongoose.model<Player>('Player', playerSchema);
export default PlayerModel;
