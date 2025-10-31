import * as DAO from '../../DAO';
import * as Models from '../../models/index';
import axios from 'axios';
import PlayerSchema from '../../models/PlayerSchema';
import { OddsStorage } from '../../models/OddsStorage';
import { PlayerCount } from '../../models/PlayerCountSchema';
import { PlayerCompare } from '../../models/PlayerCompareSchema';

interface Player {
  id: string;
  fullName: string;
  active?: boolean;
}

let cachedPlayers: Player[] = [];
function formatPlayerName(playerId: string) {
  const parts = playerId.split('_');
  parts.pop();
  parts.pop();
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}
export const syncPlayersToDB = async () => {
  try {
    const response: any = await axios.get(
      'https://sports.core.api.espn.com/v3/sports/football/nfl/athletes?limit=18000'
    );

    const players = response.data.items || [];

    for (const p of players) {
      if (!p.fullName || !p.id) continue;

      await PlayerSchema.updateOne({ id: p.id }, { $set: { fullName: p.fullName } }, { upsert: true });
    }

    console.log('Players synced successfully!');
  } catch (err) {
    console.error('Error syncing players:', err);
  }
};

export const getPlayerHeadshot = async (req: any, res: any) => {
  const name = req.query.name as string;
  if (!name) return res.status(400).json({ message: 'Player name is required' });

  const player = await PlayerSchema.findOne({ fullName: { $regex: `^${name}$`, $options: 'i' } });

  if (!player) return res.status(404).json({ message: 'Player not found' });

  const headshotUrl = `https://a.espncdn.com/i/headshots/nfl/players/full/${player.id}.png`;

  res.json({ id: player.id, fullName: player.fullName, headshot: headshotUrl });
};

export const calculatePlayerScores = async (req: any, res: any) => {
  const { playerIDs } = req.body;
  if (!playerIDs || !Array.isArray(playerIDs) || playerIDs.length < 2) {
    return res.status(400).send({
      success: false,
      message: 'At least 2 playerIDs are required',
    });
  }

  try {
    const oddsData = await OddsStorage.findOne().sort({ createdAt: -1 }).lean();
    if (!oddsData) {
      return res.status(404).send({
        success: false,
        message: 'No odds data found in database',
      });
    }

    const events: any[] = oddsData.data;

    const statCategories = [
      'passing_yards',
      'passing_touchdowns',
      'touchdowns',
      'rushing_yards',
      'receiving_receptions',
      'receiving_yards',
    ];

    const positionMapping: any = {
      QB: ['passing_yards', 'passing_touchdowns', 'touchdowns'],
      WR_TE: ['receiving_yards', 'receiving_receptions', 'touchdowns'],
      RB: ['rushing_yards', 'receiving_receptions', 'receiving_yards', 'touchdowns'],
    };

    const normalizeOdds = (val: any): number | null => {
      if (val === undefined || val === null) return null;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') return Number(val.replace('+', '')) || null;
      return null;
    };

    const pickBookmaker = (byBookmaker: any, fallbackTimestamp: string, statID: string) => {
      if (!byBookmaker || Object.keys(byBookmaker).length === 0) return null;
      if (statID === 'receiving_yards') {
        const priority = ['bovada', 'caesars', 'prophetexchange', 'betonline'];
        for (const book of priority) {
          if (byBookmaker[book]) {
            return { bookName: book, ...byBookmaker[book] };
          }
        }
      } else {
        if (byBookmaker['draftkings']) return { bookName: 'draftkings', ...byBookmaker['draftkings'] };
        if (byBookmaker['espnbet']) return { bookName: 'espnbet', ...byBookmaker['espnbet'] };
        if (byBookmaker['fanduel']) return { bookName: 'fanduel', ...byBookmaker['fanduel'] };
      }
      let latest: any = null;
      Object.entries(byBookmaker).forEach(([bookName, bookData]: any) => {
        const bookTime = new Date(bookData.lastUpdatedAt || fallbackTimestamp).getTime();
        if (!latest || bookTime > latest._time) {
          latest = { bookName, ...bookData, _time: bookTime };
        }
      });
      if (latest) {
        delete latest._time;
        return latest;
      }
      return null;
    };

    const convertOddsToScore = (odds: number | null): number => {
      if (odds === null) return 0;
      let prob = 0;
      if (odds < 0) prob = -odds / (-odds + 100);
      else prob = 100 / (odds + 100);
      return prob * 100;
    };

    const processPlayerStats = (playerID: string) => {
      const playerEvents = events.filter((event) => {
        if (!event.odds) return false;
        return Object.values(event.odds).some((odd: any) => odd.oddID.includes(playerID));
      });
      if (playerEvents.length === 0) return null;

      playerEvents.sort((a, b) => {
        const aTime = new Date(a?.status?.startsAt || 0).getTime();
        const bTime = new Date(b?.status?.startsAt || 0).getTime();
        return bTime - aTime;
      });

      const latestEvent = playerEvents[0];
      const propsMap: Record<string, any> = {};

      playerEvents.forEach((event) => {
        Object.values(event.odds).forEach((odd: any) => {
          if (!odd.oddID.includes(playerID)) return;
          let statID = odd.statID;
          if (!statCategories.includes(statID)) return;

          const chosen = pickBookmaker(odd.byBookmaker, event.status?.startsAt, statID);
          if (chosen) {
            propsMap[statID] = {
              odds: normalizeOdds(chosen.odds),
              overUnder: normalizeOdds(chosen.overUnder),
              name: chosen.bookName,
            };
          }
        });
      });

      const foundPositions: Set<string> = new Set();
      Object.values(latestEvent.odds).forEach((odd: any) => {
        if (!odd.oddID.includes(playerID)) return;
        let statID = odd.statID;
        if (!statCategories.includes(statID)) return;

        if (positionMapping.QB.includes(statID)) foundPositions.add('QB');
        if (positionMapping.WR_TE.includes(statID)) foundPositions.add('WR_TE');
        if (positionMapping.RB.includes(statID)) foundPositions.add('RB');
      });

      const playerStats: Record<string, any> = {};
      foundPositions.forEach((pos) => {
        playerStats[pos] = {};
        positionMapping[pos].forEach((statID: string) => {
          playerStats[pos][statID] = propsMap[statID] ?? {
            name: null,
            odds: null,
            overUnder: null,
          };
        });
      });

      const weightedScore =
        (propsMap['passing_yards']?.overUnder ?? 0) * 0.1 +
        (propsMap['passing_touchdowns']?.overUnder ?? 0) * 4 +
        (propsMap['receiving_yards']?.overUnder ?? 0) * 0.1 +
        (propsMap['receiving_receptions']?.overUnder ?? 0) * 1 +
        (propsMap['rushing_yards']?.overUnder ?? 0) * 0.1 +
        convertOddsToScore(propsMap['touchdowns']?.odds ?? null);

      return {
        playerID,
        startsAt: latestEvent.status?.startsAt,
        stats: playerStats,
        weightedScore,
      };
    };

    // ✅ Process all players dynamically
    const playersData = playerIDs.map((id: string) => processPlayerStats(id));

    res.send({
      success: true,
      players: playersData,
    });
  } catch (err: any) {
    res.status(500).send({
      success: false,
      message: `Failed to fetch player performance from database: ${err.message}`,
    });
  }
};
export const addComparePlayers = async (req: any, res: any) => {
  try {
    const { playerIDs } = req.body;
    if (!playerIDs || !Array.isArray(playerIDs) || playerIDs.length < 2) {
      return res.status(400).json({ error: 'At least 2 players are required' });
    }
    for (const playerId of playerIDs) {
      await PlayerCount.findOneAndUpdate({ playerId }, { $inc: { count: 1 } }, { upsert: true, new: true });
    }
    if (playerIDs.length === 2) {
      const [p1, p2] = playerIDs.sort();
      await PlayerCompare.findOneAndUpdate(
        { player1: p1, player2: p2 },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
    } else if (playerIDs.length === 4) {
      const firstPair = playerIDs.slice(0, 2).sort();
      const secondPair = playerIDs.slice(2, 4).sort();
      await PlayerCompare.findOneAndUpdate(
        { player1: firstPair[0], player2: firstPair[1] },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
      await PlayerCompare.findOneAndUpdate(
        { player1: secondPair[0], player2: secondPair[1] },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
    }
    res.json({ message: 'Comparison logged successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const mostComparedPlayerList = async (req: any, res: any) => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const popularPlayersRaw = await PlayerCount.find({
      updatedAt: { $gte: threeDaysAgo },
      count: { $gte: 3 },
    }).sort({ count: -1 });
    const popularPlayers = popularPlayersRaw.map((p:any) => ({
      id: p.playerId,
      name: formatPlayerName(p.playerId),
      count: p.count,
    }));
    const popularComparisonsRaw = await PlayerCompare.find({
      updatedAt: { $gte: threeDaysAgo },
      count: { $gte: 2 },
    }).sort({ count: -1 });

    const popularComparisons = popularComparisonsRaw.map((c: any) => ({
      players: [
        { id: c.player1, name: formatPlayerName(c.player1) },
        { id: c.player2, name: formatPlayerName(c.player2) },
      ],
      count: c.count,
    }));
    res.json({ popularPlayers, popularComparisons });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
export const fetchPlayers = async (req: any, res: any) => {
  try {
    const oddsData = await OddsStorage.findOne().sort({ createdAt: -1 }).lean();
    if (!oddsData) {
      return res.status(404).json({
        success: false,
        message: 'No odds data found in database',
      });
    }
    const allEvents: any[] = oddsData.data;
    const allPlayers = allEvents.flatMap((event: any) => Object.values(event.players || {}));
    res.json({
      success: true,
      players: allPlayers,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: `Failed to fetch players from database: ${err.message}`,
    });
  }
};

