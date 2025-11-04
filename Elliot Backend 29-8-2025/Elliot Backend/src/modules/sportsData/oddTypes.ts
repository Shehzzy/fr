export interface SportGameOddsEvent {
  eventID: string;
  sportID: string;
  leagueID: string;
  type: string;
  teams: {
    home: {
      teamID: string;
      names: {
        long: string;
        medium: string;
        short: string;
      };
      colors: {
        primary: string;
        primaryContrast: string;
        secondary: string;
      };
      statEntityID: string;
    };
    away: {
      teamID: string;
      names: {
        long: string;
        medium: string;
        short: string;
      };
      colors: {
        primary: string;
        primaryContrast: string;
        secondary: string;
      };
      statEntityID: string;
    };
  };
  status: {
    started: boolean;
    completed: boolean;
    cancelled: boolean;
    ended: boolean;
    live: boolean;
    delayed: boolean;
    currentPeriodID: string;
    previousPeriodID: string;
    displayShort: string;
    displayLong: string;
    inBreak: boolean;
    hardStart: boolean;
    periods: {
      started: string[];
      ended: string[];
    };
  };
  oddsPresent: boolean;
  oddsAvailable: boolean;
  finalized: boolean;
  startsAt: string;
  previousStartsAt: string[];
  info: {
    seasonWeek: string;
  };
  odds: Record<string, OddsData>;
  players?: Record<string, PlayerData>;
}

export interface OddsData {
  oddID: string;
  opposingOddID?: string;
  marketName: string;
  statID?: string;
  statEntityID?: string;
  periodID?: string;
  betTypeID?: string;
  sideID?: string;
  started: boolean;
  ended: boolean;
  cancelled: boolean;
  bookOddsAvailable: boolean;
  fairOddsAvailable: boolean;
  fairOdds?: string;
  bookOdds?: string;
  fairSpread?: string;
  bookSpread?: string;
  openFairOdds?: string;
  openBookOdds?: string;
  openFairSpread?: string;
  openBookSpread?: string;
  scoringSupported: boolean;
  byBookmaker?: Record<string, any>;
  bookOverUnder?: string;
  fairOverUnder?: string;
  playerID?: string;
}

export interface PlayerData {
  playerID: string;
  firstName: string;
  lastName: string;
  name: string;
  teamID: string;
}

export interface ProcessedPlayerProp {
  statType: string;
  overUnder?: {
    line: number;
    overOdds: number;
    underOdds: number;
  };
  anytimeTD?: {
    odds: number;
  };
}

export interface ProcessedPlayer {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  props: ProcessedPlayerProp[];
}

export interface ProcessedGame {
  gameId: string;
  homeTeam: any;
  awayTeam: any;
  gameDate: Date;
  players: ProcessedPlayer[];
}

export interface ApiResponse {
  nextCursor?: string;
  success: boolean;
  data: SportGameOddsEvent[];
}
