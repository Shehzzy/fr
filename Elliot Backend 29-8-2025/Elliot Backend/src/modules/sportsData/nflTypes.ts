import { Document, Types } from "mongoose";

export interface Player extends Document<Types.ObjectId> {
  PlayerID: number;
  Name: string;
  Position: string;
  Team: string;
  Status: string;
  PhotoUrl: string;
}

export interface CleanedPlayer {
  id: number;
  name: string;
  position: string;
  team: string;
  photo: string;
}
