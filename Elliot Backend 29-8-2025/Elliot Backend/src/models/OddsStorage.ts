import mongoose, { Schema, type Document } from 'mongoose';

// Individual Odd Schema
interface IOdd {
  oddID: string;
  opposingOddID?: string;
  statID?: string;
  statEntityID?: string;
  periodID?: string;
  betTypeID?: string;
  sideID?: string;
  playerID?: string;
  started: boolean;
  ended: boolean;
  cancelled: boolean;
  bookOddsAvailable: boolean;
  fairOddsAvailable: boolean;
  fairOdds?: string;
  bookOdds?: string;
  fairOverUnder?: string;
  bookOverUnder?: string;
  openFairOdds?: string;
  openBookOdds?: string;
  openFairOverUnder?: string;
  openBookOverUnder?: string;
  scoringSupported: boolean;
  marketName: string;
  byBookmaker?: Record<string, any>;
}

// Player Schema for odds storage
interface IOddsPlayer {
  playerID: string;
  teamID: string;
  firstName: string;
  lastName: string;
  name: string;
  position?: string;
  status?: string;
  photo?: string;
}

// Team Schema
interface ITeam {
  teamID: string;
  name: string;
  abbreviation?: string;
  location?: string;
}

// Event Status Schema
interface IEventStatus {
  started: boolean;
  completed: boolean;
  cancelled: boolean;
  postponed?: boolean;
  delayed?: boolean;
}

// Event Info Schema
interface IEventInfo {
  seasonWeek?: string;
  season?: string;
  date?: Date;
  venue?: string;
}

// Links Schema
interface ILinks {
  bookmakers?: Record<string, any>;
}

// Main Event Schema
interface IEvent {
  eventID: string;
  sportID: string;
  leagueID: string;
  type: string;
  teams: {
    home: ITeam;
    away: ITeam;
  };
  status: IEventStatus;
  info: IEventInfo;
  links?: ILinks;
  odds: Record<string, IOdd>; // Dynamic object with oddID as keys
  players?: Record<string, IOddsPlayer>; // Dynamic object with playerID as keys
}

// Main Odds Storage Document
interface IOddsStorage extends Document {
  nextCursor?: string;
  success: boolean;
  data: IEvent[]; // Array format [0, 1, 2...] as mentioned
  fetchedAt: Date;
  source?: string;
}

// Mongoose Schemas
const oddSchema = new Schema<IOdd>(
  {
    oddID: { type: String, required: true },
    opposingOddID: { type: String },
    statID: { type: String },
    statEntityID: { type: String },
    periodID: { type: String },
    betTypeID: { type: String },
    sideID: { type: String },
    playerID: { type: String },
    started: { type: Boolean, required: true, default: false },
    ended: { type: Boolean, required: true, default: false },
    cancelled: { type: Boolean, required: true, default: false },
    bookOddsAvailable: { type: Boolean, required: true, default: false },
    fairOddsAvailable: { type: Boolean, required: true, default: false },
    fairOdds: { type: String },
    bookOdds: { type: String },
    fairOverUnder: { type: String },
    bookOverUnder: { type: String },
    openFairOdds: { type: String },
    openBookOdds: { type: String },
    openFairOverUnder: { type: String },
    openBookOverUnder: { type: String },
    scoringSupported: { type: Boolean, required: true, default: false },
    marketName: { type: String, required: true },
    byBookmaker: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const oddsPlayerSchema = new Schema<IOddsPlayer>(
  {
    playerID: { type: String, required: true },
    teamID: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    name: { type: String, required: true },
    position: { type: String },
    status: { type: String },
    photo: { type: String },
  },
  { _id: false }
);

const teamSchema = new Schema<ITeam>(
  {
    teamID: { type: String, required: true },
    name: { type: String, required: true },
    abbreviation: { type: String },
    location: { type: String },
  },
  { _id: false }
);

const eventStatusSchema = new Schema<IEventStatus>(
  {
    started: { type: Boolean, required: true, default: false },
    completed: { type: Boolean, required: true, default: false },
    cancelled: { type: Boolean, required: true, default: false },
    postponed: { type: Boolean, default: false },
    delayed: { type: Boolean, default: false },
  },
  { _id: false }
);

const eventInfoSchema = new Schema<IEventInfo>(
  {
    seasonWeek: { type: String },
    season: { type: String },
    date: { type: Date },
    venue: { type: String },
  },
  { _id: false }
);

const linksSchema = new Schema<ILinks>(
  {
    bookmakers: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent>(
  {
    eventID: { type: String, required: true },
    sportID: { type: String, required: true },
    leagueID: { type: String, required: true },
    type: { type: String, required: true },
    teams: {
      home: { type: teamSchema, required: true },
      away: { type: teamSchema, required: true },
    },
    status: { type: eventStatusSchema, required: true },
    info: { type: eventInfoSchema, required: true },
    links: { type: linksSchema },
    odds: {
      type: Map,
      of: oddSchema,
      required: true,
      default: {},
    },

    players: {
      type: Map,
      of: oddsPlayerSchema,
      default: new Map(),
    },
  },
  { _id: false }
);

const oddsStorageSchema = new Schema<IOddsStorage>(
  {
    nextCursor: { type: String },
    success: { type: Boolean, required: true, default: true },
    data: [eventSchema],
    fetchedAt: { type: Date, required: true, default: Date.now },
    source: { type: String, default: 'API' },
  },
  {
    timestamps: true,
    collection: 'odds_storage',
  }
);

// Indexes for better query performance
oddsStorageSchema.index({ 'data.eventID': 1 });
oddsStorageSchema.index({ 'data.sportID': 1, 'data.leagueID': 1 });
oddsStorageSchema.index({ fetchedAt: -1 });
oddsStorageSchema.index({ 'data.odds.playerID': 1 });

const OddsStorageModel = mongoose.model<IOddsStorage>('OddsStorage', oddsStorageSchema);

export { OddsStorageModel as OddsStorage };
export default OddsStorageModel;
export type { IOddsStorage, IEvent, IOdd, IOddsPlayer };
