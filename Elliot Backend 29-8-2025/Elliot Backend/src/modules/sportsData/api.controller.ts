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
  const { playerIDs, user, preferredBookmaker = 'draftkings' } = req.body;
  const canon = (s: any) =>
    String(s ?? '')
      .trim()
      .replace(/\s+/g, '_');
  const expectedOddID = (statID: string, playerID: string) => `${statID}-${canon(playerID)}-game-yn-yes`;
  
  const matchesPlayerStatFlexible = (odd: any, playerID: string, statCategories: string[]) => {
    if (!odd?.oddID || !odd?.statID) return false;
    if (!statCategories.includes(odd.statID)) return false;
    
    // More flexible player ID matching
    const normalizedOddID = canon(odd.oddID).toLowerCase();
    const normalizedPlayerID = canon(playerID).toLowerCase();
    
    if (odd.statID === 'touchdowns') {
      const expected = canon(expectedOddID(odd.statID, playerID)).toLowerCase();
      return normalizedOddID === expected;
    }

    // More flexible matching for other stats
    // Try both full player ID and name without suffix
    const playerNameOnly = normalizedPlayerID.replace('_1_nfl', '');
    return normalizedOddID.includes(normalizedPlayerID) || normalizedOddID.includes(playerNameOnly);
  };

  try {
    const matchedUser = await Models.Users.findOne({ email: user.email });
    if (!matchedUser) return res.status(404).json({ error: 'User not found' });

    if (matchedUser.subscription_status === 'inactive' && !matchedUser.has_accessed_once) {
      await Models.Users.findOneAndUpdate({ email: user.email }, { $set: { has_accessed_once: true } });
    }

    if (!playerIDs || !Array.isArray(playerIDs) || playerIDs.length < 2) {
      return res.status(400).send({ success: false, message: 'At least 2 playerIDs are required' });
    }

    const oddsData = await OddsStorage.findOne().lean();
    if (!oddsData) {
      return res.status(404).send({ success: false, message: 'No odds data found in database' });
    }

    const events: any[] = oddsData.data || [];
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
      if (typeof val === 'string') {
        const cleaned = val.replace('+', '');
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    const pickBookmaker = (byBookmaker: any, statID: string, preferred: string) => {
      if (!byBookmaker || Object.keys(byBookmaker).length === 0) return null;

      // Enhanced bookmaker selection with better fallbacks
      if (statID === 'receiving_yards' || statID === 'rushing_yards' || statID === 'passing_yards') {
        const priority = [preferred, 'bovada', 'caesars', 'prophetexchange', 'betonline', 'hardrockbet', 'draftkings', 'fanduel', 'betmgm'];
        for (const book of priority) {
          if (byBookmaker[book] && (byBookmaker[book].odds !== undefined || byBookmaker[book].overUnder !== undefined)) {
            const b = byBookmaker[book];
            return { bookName: book, odds: b.odds, overUnder: b.overUnder, lastUpdatedAt: b.lastUpdatedAt };
          }
        }
      } else {
        const priority = [preferred, 'draftkings', 'espnbet', 'fanduel', 'betmgm', 'bovada', 'caesars'];
        for (const book of priority) {
          if (byBookmaker[book] && (byBookmaker[book].odds !== undefined || byBookmaker[book].overUnder !== undefined)) {
            const b = byBookmaker[book];
            return { bookName: book, odds: b.odds, overUnder: b.overUnder, lastUpdatedAt: b.lastUpdatedAt };
          }
        }
      }

      // Fallback: any bookmaker with data
      for (const [bookName, bookData] of Object.entries<any>(byBookmaker)) {
        if (bookData.odds !== undefined || bookData.overUnder !== undefined) {
          return {
            bookName,
            odds: bookData.odds,
            overUnder: bookData.overUnder,
            lastUpdatedAt: bookData.lastUpdatedAt,
          };
        }
      }

      return null;
    };

    const convertOddsToScore = (odds: number | null): number => {
      if (odds === null) return 0;
      const prob = odds < 0 ? -odds / (-odds + 100) : 100 / (odds + 100);
      return prob * 100;
    };

    // NEW: Generate realistic fallback data based on player position and name
    const generateFallbackData = (playerID: string) => {
      const playerName = playerID.toLowerCase();
      
      // Determine position based on common name patterns or default to RB
      let position = 'RB';
      if (playerName.includes('qb_') || playerName.includes('_qb')) position = 'QB';
      else if (playerName.includes('wr_') || playerName.includes('_wr')) position = 'WR_TE';
      else if (playerName.includes('te_') || playerName.includes('_te')) position = 'WR_TE';
      
      // Generate realistic stats based on position
      const baseStats: any = {
        QB: {
          passing_yards: { overUnder: 220 + Math.floor(Math.random() * 100), odds: null },
          passing_touchdowns: { overUnder: 1.5, odds: null },
          touchdowns: { overUnder: null, odds: -110 + Math.floor(Math.random() * 50) }
        },
        WR_TE: {
          receiving_yards: { overUnder: 45 + Math.floor(Math.random() * 40), odds: null },
          receiving_receptions: { overUnder: 3.5, odds: null },
          touchdowns: { overUnder: null, odds: 150 + Math.floor(Math.random() * 200) }
        },
        RB: {
          rushing_yards: { overUnder: 35 + Math.floor(Math.random() * 30), odds: null },
          receiving_receptions: { overUnder: 2.5, odds: null },
          receiving_yards: { overUnder: 15 + Math.floor(Math.random() * 20), odds: null },
          touchdowns: { overUnder: null, odds: 120 + Math.floor(Math.random() * 150) }
        }
      };

      const stats = {
        [position]: baseStats[position]
      };

      // Calculate a reasonable weighted score
      const positionStats = baseStats[position];
      const weightedScore = 
        (positionStats.passing_yards?.overUnder || 0) * 0.1 +
        (positionStats.passing_touchdowns?.overUnder || 0) * 4 +
        (positionStats.receiving_yards?.overUnder || 0) * 0.1 +
        (positionStats.receiving_receptions?.overUnder || 0) * 1 +
        (positionStats.rushing_yards?.overUnder || 0) * 0.1 +
        (positionStats.touchdowns?.odds ? convertOddsToScore(positionStats.touchdowns.odds) : 0);

      return {
        playerID,
        stats,
        weightedScore: Math.max(10, Math.min(100, weightedScore)), // Keep between 10-100
        isFallback: true
      };
    };

    const processPlayerStats = (playerID: string) => {
      console.log(`\n=== Processing Player: ${playerID} ===`);
      
      const playerEvents = events.filter((event) => {
        if (!event || !event.odds) {
          return false;
        }
        
        return Object.values(event.odds).some((odd: any) => 
          matchesPlayerStatFlexible(odd, playerID, statCategories)
        );
      });

      console.log(`Found ${playerEvents.length} events for player ${playerID}`);
      
      // If no events found, use fallback data
      if (playerEvents.length === 0) {
        console.log(`❌ No events found for player ${playerID}, using fallback data`);
        return generateFallbackData(playerID);
      }

      playerEvents.sort(
        (a, b) => new Date(b?.status?.startsAt || 0).getTime() - new Date(a?.status?.startsAt || 0).getTime()
      );
      const latestEvent = playerEvents[0];
      if (!latestEvent) {
        console.log(`❌ No valid event for player ${playerID}, using fallback data`);
        return generateFallbackData(playerID);
      }

      console.log(`Using event with startsAt: ${latestEvent?.status?.startsAt || 'N/A'}`);

      const allOddsForStat: Record<
        string,
        Array<{ bookName: string; odds: number | null; overUnder: number | null; lastUpdatedAt: string | null }>
      > = {};
      const propsMap: Record<
        string,
        { odds: number | null; overUnder: number | null; name: string | null; _time: number }
      > = {};

      // Debug: Log all available odds for this player
      console.log(`\n--- Available odds for ${playerID} ---`);
      Object.entries(latestEvent.odds || {}).forEach(([oddKey, odd]: [string, any]) => {
        if (matchesPlayerStatFlexible(odd, playerID, statCategories)) {
          console.log(`✅ MATCHED: ${oddKey}`, {
            statID: odd.statID,
            oddID: odd.oddID,
            bookmakers: odd.byBookmaker ? Object.keys(odd.byBookmaker) : 'none'
          });
        }
      });

      for (const oddKey of Object.keys(latestEvent.odds || {})) {
        const odd = latestEvent.odds[oddKey];
        if (!matchesPlayerStatFlexible(odd, playerID, statCategories)) continue;

        const statID = odd.statID;
        const byBookmaker = odd.byBookmaker || {};
        
        // Collect all available odds for this stat
        for (const [bookName, bookData] of Object.entries<any>(byBookmaker)) {
          if (!allOddsForStat[statID]) allOddsForStat[statID] = [];
          allOddsForStat[statID].push({
            bookName,
            odds: normalizeOdds(bookData?.odds),
            overUnder: normalizeOdds(bookData?.overUnder),
            lastUpdatedAt: (bookData?.lastUpdatedAt as string) ?? null,
          });
        }

        // Only set propsMap if not already set or if we have better data
        const chosen = pickBookmaker(byBookmaker, statID, preferredBookmaker);
        if (!chosen) continue;

        const currentTime = new Date(chosen.lastUpdatedAt || latestEvent.status?.startsAt || 0).getTime();
        
        if (!propsMap[statID] || currentTime > propsMap[statID]._time) {
          propsMap[statID] = {
            odds: normalizeOdds(chosen.odds),
            overUnder: normalizeOdds(chosen.overUnder),
            name: chosen.bookName || null,
            _time: currentTime,
          };
        }
      }

      // Enhanced logging of available odds
      try {
        console.log(`\n[Player ${playerID}] All available odds by statID:`);
        Object.entries(allOddsForStat).forEach(([statID, rows]) => {
          const sorted = rows.slice().sort((a, b) => {
            const ta = new Date(a.lastUpdatedAt || 0).getTime();
            const tb = new Date(b.lastUpdatedAt || 0).getTime();
            return tb - ta;
          });
          console.group(`statID: ${statID}`);
          console.table(
            sorted.map((r) => ({
              book: r.bookName,
              odds: r.odds,
              overUnder: r.overUnder,
              lastUpdatedAt: r.lastUpdatedAt,
            }))
          );
          console.groupEnd();
        });
      } catch (e) {
        console.warn('Logging all odds failed:', e);
      }

      const foundPositions: Set<string> = new Set();
      Object.values(latestEvent.odds || {}).forEach((odd: any) => {
        if (!matchesPlayerStatFlexible(odd, playerID, statCategories)) return;
        const statID = odd.statID;
        if (positionMapping.QB.includes(statID)) foundPositions.add('QB');
        if (positionMapping.WR_TE.includes(statID)) foundPositions.add('WR_TE');
        if (positionMapping.RB.includes(statID)) foundPositions.add('RB');
      });

      console.log(`Found positions for ${playerID}:`, Array.from(foundPositions));

      const playerStats: Record<string, any> = {};
      
      // If we have some data but missing positions, fill in with fallback data
      if (foundPositions.size > 0) {
        foundPositions.forEach((pos) => {
          playerStats[pos] = {};
          positionMapping[pos].forEach((statID: string) => {
            const val = propsMap[statID];
            playerStats[pos][statID] = val
              ? { name: val.name, odds: val.odds, overUnder: val.overUnder }
              : { name: null, odds: null, overUnder: null };
          });
        });
      } else {
        // No positions found, use fallback data
        console.log(`No positions found for ${playerID}, using fallback data`);
        return generateFallbackData(playerID);
      }

      // Enhanced weighted score calculation with better fallbacks
      const weightedScore =
        (propsMap['passing_yards']?.overUnder ?? 0) * 0.1 +
        (propsMap['passing_touchdowns']?.overUnder ?? 0) * 4 +
        (propsMap['receiving_yards']?.overUnder ?? 0) * 0.1 +
        (propsMap['receiving_receptions']?.overUnder ?? 0) * 1 +
        (propsMap['rushing_yards']?.overUnder ?? 0) * 0.1 +
        (propsMap['touchdowns']?.odds ? convertOddsToScore(propsMap['touchdowns'].odds) : 0);

      console.log(`Final weighted score for ${playerID}: ${weightedScore}`);

      return {
        playerID,
        startsAt: latestEvent.status?.startsAt,
        stats: playerStats,
        weightedScore: Math.max(5, weightedScore), // Ensure minimum score
        isFallback: false
      };
    };

    const playersData = playerIDs.map((id: string) => processPlayerStats(id));
    
    console.log('\n=== FINAL RESULTS ===');
    playersData.forEach((player, index) => {
      console.log(`Player ${index + 1}:`, {
        playerID: player.playerID,
        weightedScore: player.weightedScore,
        isFallback: player.isFallback,
        statsCount: Object.keys(player.stats || {}).length
      });
    });

    res.send({ success: true, players: playersData });generateFallbackData
  } catch (err: any) {
    console.error('Error in calculatePlayerScores:', err);
    
    // Provide fallback data on error
    const fallbackPlayers = (playerIDs || []).map((id: string) => (id));
    
    res.status(500).send({ 
      success: false, 
      message: `Failed to fetch player performance: ${err.message}`,
      players: fallbackPlayers
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