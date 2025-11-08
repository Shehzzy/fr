import express from 'express';
import subscriptionCheckMiddleware from '../../middlewares/subscriptionCheckMiddleware';
import { addComparePlayers, calculatePlayerScores, mostComparedPlayerList } from './api.controller';
import authenticator from '../../middlewares/authenticator';
import { OddsStorage } from '../../models/OddsStorage';
import PlayerSchema from '../../models/PlayerSchema';

const router = express.Router();
const fetchPlayerPosition = async (playerName: string): Promise<string | null> => {
  try {
    let playerId: string | null = null;
    if (playerName.toLowerCase() === 'josh allen') {
      playerId = '3918298';
    } else {
      const player = await PlayerSchema.findOne({
        fullName: { $regex: `^${playerName}$`, $options: 'i' },
      });
      if (!player) return null;
      playerId = player.id;
    }
    const response = await fetch(
      `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/athletes/${playerId}?lang=en&region=us`
    );
    if (!response.ok) return null;
    const playerData = await response.json();
    return playerData?.position?.abbreviation || null;
  } catch (error) {
    console.error('Error fetching player position:', error);
    return null;
  }
};
router.get('/headshot', async (req: any, res: any) => {
  const name = req.query.name as string;
  if (!name) return res.status(400).json({ message: 'Player name is required' });
  if (name.toLowerCase() === 'josh allen') {
    const headshotUrl = `https://a.espncdn.com/i/headshots/nfl/players/full/3918298.png`;
    return res.json({ id: '3918298', fullName: 'Josh Allen', headshot: headshotUrl });
  }
  const player = await PlayerSchema.findOne({
    fullName: { $regex: `^${name}$`, $options: 'i' },
  });
  if (!player) return res.status(404).json({ message: 'Player not found' });
  const headshotUrl = `https://a.espncdn.com/i/headshots/nfl/players/full/${player.id}.png`;
  res.json({ id: player.id, fullName: player.fullName, headshot: headshotUrl });
});

router.get('/odd-players', async (req: any, res: any) => {
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
});

router.post('/player-performances', subscriptionCheckMiddleware, calculatePlayerScores);

router.post('/add-compare-player', addComparePlayers);

router.get('/most-compared-player-list', mostComparedPlayerList);

router.get('/rank-players', async (req: any, res: any) => {
  try {
    const { page = 1, limit = 10, position, sortBy, order, preferredBookmaker = 'draftkings' } = req.query;
    const pageNum = Math.max(Number.parseInt(page), 1);
    const pageSize = Math.max(Number.parseInt(limit), 1);
    const [oddsData] = await OddsStorage.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 1 },
      { $project: { data: 1, createdAt: 1 } },
    ]);
    if (!oddsData) {
      return res.status(404).json({ success: false, message: 'No odds data found in database' });
    }
    const events: any[] = oddsData.data || [];
    const statCategories = [
      'passing_yards',
      'passing_touchdowns',
      'touchdowns',
      'rushing_yards',
      'receiving_receptions',
      'receiving_yards',
      'receiving_longestReception',
    ];
    const positionMapping: any = {
      QB: ['passing_yards', 'passing_touchdowns', 'touchdowns'],
      WR_TE: ['receiving_yards', 'receiving_receptions', 'touchdowns', 'receiving_longestReception'],
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
      if (statID === 'receiving_yards' || statID === 'rushing_yards') {
        const priority = [preferred, 'bovada', 'caesars', 'prophetexchange', 'betonline', 'hardrockbet', 'draftkings'];
        for (const book of priority) {
          if (byBookmaker[book]) {
            const bookData = byBookmaker[book];
            return {
              bookName: book,
              odds: bookData.odds,
              overUnder: bookData.overUnder,
              lastUpdatedAt: bookData.lastUpdatedAt,
            };
          }
        }
      } else {
        const priority = [preferred, 'draftkings', 'espnbet', 'fanduel', 'betmgm'];
        for (const book of priority) {
          if (byBookmaker[book]) {
            const bookData = byBookmaker[book];
            return {
              bookName: book,
              odds: bookData.odds,
              overUnder: bookData.overUnder,
              lastUpdatedAt: bookData.lastUpdatedAt,
            };
          }
        }
      }
      let latest: any = null;
      Object.entries(byBookmaker).forEach(([bookName, bookData]: any) => {
        const bookTime = new Date(bookData.lastUpdatedAt || 0).getTime();
        if (!latest || bookTime > latest._time) {
          latest = {
            bookName,
            odds: bookData.odds,
            overUnder: bookData.overUnder,
            lastUpdatedAt: bookData.lastUpdatedAt,
            _time: bookTime,
          };
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
    const uniquePlayerIDs = [
      ...new Set(events.flatMap((event: any) => Object.values(event.players || {}).map((p: any) => p.playerID))),
    ];
    const processPlayerStats = async (playerID: string) => {
      const playerEvents = events.filter((event) => {
        if (!event || !event.odds) return false;
        return Object.values(event.odds).some((odd: any) => odd?.oddID?.includes(playerID));
      });
      if (playerEvents.length === 0) return null;
      playerEvents.sort((a, b) => {
        const aTime = new Date(a?.status?.startsAt || 0).getTime();
        const bTime = new Date(b?.status?.startsAt || 0).getTime();
        return bTime - aTime;
      });
      const latestEvent = playerEvents[0];
      if (!latestEvent) return null;
      const propsMap: Record<
        string,
        { odds: number | null; overUnder: number | null; name: string | null; _time: number }
      > = {};

      for (const oddKey of Object.keys(latestEvent.odds || {})) {
        const odd = latestEvent.odds[oddKey];
        if (!odd) continue;
        if (!odd.oddID || !odd.oddID.includes(playerID)) continue;
        const statID = odd.statID;
        if (!statCategories.includes(statID)) continue;
        if (propsMap[statID]) {
          continue;
        }
        const chosenBook = pickBookmaker(odd.byBookmaker, statID, preferredBookmaker);
        if (!chosenBook) continue;
        const normalizedOdds = normalizeOdds(chosenBook.odds);
        const normalizedOverUnder = normalizeOdds(chosenBook.overUnder);
        propsMap[statID] = {
          odds: normalizedOdds,
          overUnder: normalizedOverUnder,
          name: chosenBook.bookName || null,
          _time: new Date(chosenBook.lastUpdatedAt || latestEvent.status?.startsAt || 0).getTime(),
        };
      }
      const foundPositions: Set<string> = new Set();
      Object.values(latestEvent.odds || {}).forEach((odd: any) => {
        if (!odd?.oddID?.includes(playerID)) return;
        const statID = odd.statID;
        if (!statCategories.includes(statID)) return;
        if (positionMapping.QB.includes(statID)) foundPositions.add('QB');
        if (positionMapping.WR_TE.includes(statID)) foundPositions.add('WR_TE');
        if (positionMapping.RB.includes(statID)) foundPositions.add('RB');
      });
      const playerStats: Record<string, any> = {};
      foundPositions.forEach((pos) => {
        playerStats[pos] = {};
        positionMapping[pos].forEach((statID: string) => {
          const val = propsMap[statID];
          playerStats[pos][statID] = val
            ? { name: val.name, odds: val.odds, overUnder: val.overUnder }
            : { name: null, odds: null, overUnder: null };
        });
      });
      const weightedScore =
        (propsMap['passing_yards']?.overUnder ?? 0) * 0.1 +
        (propsMap['passing_touchdowns']?.overUnder ?? 0) * 4 +
        (propsMap['receiving_yards']?.overUnder ?? 0) * 0.1 +
        (propsMap['receiving_receptions']?.overUnder ?? 0) * 1 +
        (propsMap['rushing_yards']?.overUnder ?? 0) * 0.1 +
        (propsMap['touchdowns']?.odds ? convertOddsToScore(propsMap['touchdowns'].odds) : 0);
      let playerName = '';
      for (const event of playerEvents) {
        const playerData = Object.values(event.players || {}).find((p: any) => p.playerID === playerID);
        if (playerData) {
          playerName = (playerData as any).name;
          break;
        }
      }
      let espnPosition: string | null = null;
      try {
        if (typeof fetchPlayerPosition === 'function' && playerName) {
          espnPosition = await fetchPlayerPosition(playerName);
        }
      } catch (e) {
        espnPosition = null;
      }

      return {
        playerID,
        name: playerName,
        position: espnPosition,
        startsAt: latestEvent.status?.startsAt,
        stats: playerStats,
        weightedScore,
      };
    };
    const playerPromises = uniquePlayerIDs.map((id) => processPlayerStats(id));
    let playersData = (await Promise.all(playerPromises)).filter(Boolean) as any[];
    if (position) {
      playersData = playersData.filter((p) => p.position === position);
    }
    if (sortBy && order) {
      const orderFactor = order.toLowerCase() === 'desc' ? -1 : 1;
      playersData = playersData.filter((p) =>
        ['QB', 'RB', 'WR_TE'].some((pos) => p.stats[pos] && p.stats[pos][sortBy] !== undefined)
      );
      playersData.sort((a, b) => {
        let aVal = 0;
        let bVal = 0;
        for (const pos of ['QB', 'RB', 'WR_TE']) {
          if (a.stats[pos] && a.stats[pos][sortBy]?.odds !== undefined) aVal = a.stats[pos][sortBy].odds;
          if (b.stats[pos] && b.stats[pos][sortBy]?.odds !== undefined) bVal = b.stats[pos][sortBy].odds;
        }
        return (aVal - bVal) * orderFactor;
      });
    } else {
      playersData.sort((a, b) => (b.weightedScore ?? 0) - (a.weightedScore ?? 0));
    }
    const totalPlayers = playersData.length;
    const paginated = playersData.slice((pageNum - 1) * pageSize, pageNum * pageSize).map((player, index) => ({
      rank: (pageNum - 1) * pageSize + index + 1,
      ...player,
    }));

    res.json({
      success: true,
      totalPlayers,
      currentPage: pageNum,
      totalPages: Math.ceil(totalPlayers / pageSize),
      players: paginated,
    });
  } catch (err: any) {
    console.error('Error in /rank-players:', err);
    res.status(500).json({ success: false, message: `Failed to rank players: ${err.message}` });
  }
});

export default router;