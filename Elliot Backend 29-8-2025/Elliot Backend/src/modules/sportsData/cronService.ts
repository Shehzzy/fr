import cron from 'node-cron';
import axios from 'axios';
import { OddsStorage } from '../../models/OddsStorage';
import { findAndUpdate } from '../../DAO';
import { syncPlayersToDB } from './api.controller';
const SPORTGAMEODDS_API_KEY = process.env.SPORTGAMEODDS_API_KEY;
const fetchAndStoreOddsData = async () => {
  try {
    const url = `https://api.sportsgameodds.com/v2/events`;
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);
    const config = {
      headers: {
        'x-api-key': SPORTGAMEODDS_API_KEY,
        'Content-Type': 'application/json',
      },
      params: {
        leagueID: 'NFL',
        oddsAvailable: true,
        limit: 100,
        startsAfter: now.toISOString(),
        startsBefore: sevenDaysLater.toISOString(),
      },
    };
    const response = await axios.get<any>(url, config);
    const events: any[] = response.data?.data || [];
    const transformedData = events.map((event) => {
      const transformedOdds: Record<string, any> = {};
      const transformedPlayers: Record<string, any> = {};
      if (event.odds) {
        Object.keys(event.odds).forEach((oddKey) => {
          const odd = event.odds[oddKey];
          transformedOdds[oddKey] = {
            oddID: odd.oddID || oddKey,
            opposingOddID: odd.opposingOddID,
            marketName: odd.marketName || '',
            statID: odd.statID || '',
            statEntityID: odd.statEntityID,
            periodID: odd.periodID,
            betTypeID: odd.betTypeID,
            sideID: odd.sideID,
            playerID: odd.playerID || '',
            started: odd.started || false,
            ended: odd.ended || false,
            cancelled: odd.cancelled || false,
            bookOddsAvailable: odd.bookOddsAvailable || false,
            fairOddsAvailable: odd.fairOddsAvailable || false,
            fairOdds: odd.fairOdds || 0,
            bookOdds: odd.bookOdds || 0,
            fairOverUnder: odd.fairOverUnder || 0,
            bookOverUnder: odd.bookOverUnder || 0,
            openFairOdds: odd.openFairOdds || 0,
            openBookOdds: odd.openBookOdds || 0,
            openFairOverUnder: odd.openFairOverUnder || 0,
            openBookOverUnder: odd.openBookOverUnder || 0,
            scoringSupported: odd.scoringSupported || false,
            byBookmaker: odd.byBookmaker || {},
          };
        });
      }
      if (event.players) {
        Object.keys(event.players).forEach((playerKey) => {
          const player = event.players[playerKey];
          transformedPlayers[playerKey] = {
            playerID: player.playerID || playerKey,
            teamID: player.teamID || '',
            firstName: player.firstName || '',
            lastName: player.lastName || '',
            name: player.name || `${player.firstName} ${player.lastName}`.trim(),
          };
        });
      }
      return {
        eventID: event.eventID,
        odds: transformedOdds,
        players: transformedPlayers,
        status: event.status,
        lastUpdated: new Date(),
      };
    });
    const oddsStorageData = {
      data: transformedData,
      lastFetch: new Date(),
    };
    const result = await findAndUpdate(OddsStorage, {}, { $set: oddsStorageData }, { upsert: true, new: true });
    console.log("Feching PLayers and Stored to db done")
    return result;
  } catch (error) {
    console.error('Error fetching/storing odds data:', error);
    throw error;
  }
};

const startOddsCronJob = () => {
  fetchAndStoreOddsData().catch(console.error);
  cron.schedule(
    '0 0 * * *',
    async () => {
      console.log('Running scheduled odds data fetch...');
      try {
        await fetchAndStoreOddsData();
      } catch (error) {
        console.error('Scheduled odds data fetch failed:', error);
      }
    },
    {
      timezone: 'America/New_York',
    }
  );
};

const startPlayersCronJob = () => {
  // Initial fetch on server start
  syncPlayersToDB().catch(console.error);

  // Schedule weekly sync every Sunday at 2 AM
  cron.schedule(
    "0 2 * * 0",
    async () => {
      console.log("Running scheduled NFL players sync...");
      try {
        await syncPlayersToDB();
      } catch (error) {
        console.error("Scheduled NFL players sync failed:", error);
      }
    },
    {
      timezone: "America/New_York",
    }
  );
};

export { startOddsCronJob, fetchAndStoreOddsData, startPlayersCronJob };
