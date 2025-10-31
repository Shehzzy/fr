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

export const calculatePlayerScores = async (req: any, res: any) => {
  const { playerIDs, user } = req.body;
  const matchedUser = await Models.Users.findOne({ email: user.email });
  if (!matchedUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (matchedUser.subscription_status === 'inactive' && !matchedUser.has_accessed_once) {
    await Models.Users.findOneAndUpdate({ email: user.email }, { $set: { has_accessed_once: true } });
    console.log('✅ First-time inactive user access granted.');
  }
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
    const popularPlayers = popularPlayersRaw.map((p) => ({
      id: p.playerId,
      name: formatPlayerName(p.playerId),
      count: p.count,
    }));
    const popularComparisonsRaw = await PlayerCompare.find({
      updatedAt: { $gte: threeDaysAgo },
      count: { $gte: 2 },
    }).sort({ count: -1 });

    const popularComparisons = popularComparisonsRaw.map((c) => ({
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
// export const rankPlayers = async (res: any, req: any) => {
//   try {
//     const { page = 1, limit = 10, sortBy, order, position } = req.query;
//     const pageNum = Math.max(parseInt(page), 1);
//     const pageSize = Math.max(parseInt(limit), 1);
//     const [oddsData] = await OddsStorage.aggregate([
//       { $sort: { createdAt: -1 } },
//       { $limit: 1 },
//       {
//         $project: {
//           data: 1,
//           createdAt: 1,
//         },
//       },
//     ]);
//     if (!oddsData) {
//       return res.status(404).json({
//         success: false,
//         message: 'No odds data found in database',
//       });
//     }
//     const events: any[] = oddsData.data;
//     const statCategories = [
//       'passing_yards',
//       'passing_touchdowns',
//       'touchdowns',
//       'rushing_yards',
//       'receiving_receptions',
//       'receiving_yards',
//     ];
//     const positionMapping: any = {
//       QB: ['passing_yards', 'passing_touchdowns', 'touchdowns'],
//       WR_TE: ['receiving_yards', 'receiving_receptions', 'touchdowns'],
//       RB: ['rushing_yards', 'receiving_receptions', 'receiving_yards', 'touchdowns'],
//     };
//     const normalizeOdds = (val: any): number | null => {
//       if (val === undefined || val === null) return null;
//       if (typeof val === 'number') return val;
//       if (typeof val === 'string') return Number(val.replace('+', '')) || null;
//       return null;
//     };
//     const convertOddsToScore = (odds: number | null): number => {
//       if (odds === null) return 0;
//       return odds < 0 ? (-odds / (-odds + 100)) * 100 : (100 / (odds + 100)) * 100;
//     };
//     const uniquePlayerIDs = [
//       ...new Set(events.flatMap((event: any) => Object.values(event.players || {}).map((p: any) => p.playerID))),
//     ];
//     const processPlayerStats = (playerID: string) => {
//       const playerEvents = events.filter(
//         (event) => event.odds && Object.values(event.odds).some((odd: any) => odd.oddID.includes(playerID))
//       );
//       if (playerEvents.length === 0) return null;
//       playerEvents.sort(
//         (a, b) => new Date(b?.status?.startsAt || 0).getTime() - new Date(a?.status?.startsAt || 0).getTime()
//       );
//       const latestEvent = playerEvents[0];
//       const propsMap: Record<string, any> = {};
//       playerEvents.forEach((event) => {
//         Object.values(event.odds).forEach((odd: any) => {
//           if (!odd.oddID.includes(playerID) || !statCategories.includes(odd.statID)) return;
//           const chosen = odd.byBookmaker?.draftkings || odd.byBookmaker?.espnbet || odd.byBookmaker?.fanduel;
//           if (chosen) {
//             propsMap[odd.statID] = {
//               odds: normalizeOdds(chosen.odds),
//               overUnder: normalizeOdds(chosen.overUnder),
//               name: chosen.bookName || 'draftkings',
//             };
//           }
//         });
//       });
//       const foundPositions: Set<string> = new Set();
//       Object.values(latestEvent.odds).forEach((odd: any) => {
//         if (!odd.oddID.includes(playerID) || !statCategories.includes(odd.statID)) return;
//         if (positionMapping.QB.includes(odd.statID)) foundPositions.add('QB');
//         if (positionMapping.WR_TE.includes(odd.statID)) foundPositions.add('WR_TE');
//         if (positionMapping.RB.includes(odd.statID)) foundPositions.add('RB');
//       });
//       const playerStats: Record<string, any> = {};
//       foundPositions.forEach((pos) => {
//         playerStats[pos] = {};
//         positionMapping[pos].forEach((statID: string) => {
//           playerStats[pos][statID] = propsMap[statID] ?? { name: null, odds: null, overUnder: null };
//         });
//       });
//       const weightedScore =
//         (propsMap['passing_yards']?.overUnder ?? 0) * 0.1 +
//         (propsMap['passing_touchdowns']?.overUnder ?? 0) * 4 +
//         (propsMap['receiving_yards']?.overUnder ?? 0) * 0.1 +
//         (propsMap['receiving_receptions']?.overUnder ?? 0) * 1 +
//         (propsMap['rushing_yards']?.overUnder ?? 0) * 0.1 +
//         convertOddsToScore(propsMap['touchdowns']?.odds ?? null);
//       return {
//         playerID,
//         startsAt: latestEvent.status?.startsAt,
//         stats: playerStats,
//         weightedScore,
//       };
//     };
//     let playersData = uniquePlayerIDs.map((id) => processPlayerStats(id)).filter(Boolean) as any[];
//     if (position) {
//       playersData = playersData.filter((p) => {
//         const positions = Object.keys(p.stats || {});
//         return positions.length > 0 && positions[0] === position;
//       });
//     }
//     if (sortBy) {
//       const field = String(sortBy);
//       const direction = order === 'asc' ? 1 : -1;
//       playersData.sort((a, b) => {
//         const aVal =
//           a.stats?.QB?.[field]?.overUnder ?? a.stats?.WR_TE?.[field]?.overUnder ?? a.stats?.RB?.[field]?.overUnder ?? 0;
//         const bVal =
//           b.stats?.QB?.[field]?.overUnder ?? b.stats?.WR_TE?.[field]?.overUnder ?? b.stats?.RB?.[field]?.overUnder ?? 0;
//         return (aVal - bVal) * direction;
//       });
//     } else {
//       playersData.sort((a, b) => b.weightedScore - a.weightedScore);
//     }
//     const totalPlayers = playersData.length;
//     const paginated = playersData.slice((pageNum - 1) * pageSize, pageNum * pageSize).map((player, index) => ({
//       rank: (pageNum - 1) * pageSize + index + 1,
//       ...player,
//     }));
//     res.json({
//       success: true,
//       totalPlayers,
//       currentPage: pageNum,
//       totalPages: Math.ceil(totalPlayers / pageSize),
//       players: paginated,
//     });
//   } catch (err: any) {
//     res.status(500).json({
//       success: false,
//       message: `Failed to rank players: ${err.message}`,
//     });
//   }
// };
