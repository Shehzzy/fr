import express from 'express';
import subscriptionCheckMiddleware from '../../middlewares/subscriptionCheckMiddleware';
import {
  addComparePlayers,
  calculatePlayerScores,
  fetchPlayers,
  getPlayerHeadshot,
  mostComparedPlayerList,
} from './api.controller';
import authenticator from '../../middlewares/authenticator';

const router = express.Router();
//=====================Sports Data================
router.get('/headshot', getPlayerHeadshot);

router.get('/odd-players', fetchPlayers);

router.post('/player-performances', authenticator, subscriptionCheckMiddleware, calculatePlayerScores); 

router.post('/add-compare-player', addComparePlayers);

router.get('/most-compared-player-list', mostComparedPlayerList);
export default router;

