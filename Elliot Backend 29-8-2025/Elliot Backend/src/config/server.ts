import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import { connect_to_db, bootstrap_data } from './index';
import adminRoutes from '../modules/admin/admin.routes';
import userRoutes from '../modules/user/user.routes';
import nflRoutes from '../modules/sportsData/api.routes';
import stripeRoutes from '../modules/stripe/stripe.routes';
import commonRoutes from '../modules/common/common.routes';
import cors from 'cors';
import path from 'path';
import cron from 'node-cron';
import { getActivePlayers } from '../modules/sportsData/api.services';
import PlayerModel from '../models/Players';
import Transaction from '../models/Transaction';
import { startOddsCronJob, startPlayersCronJob } from '../modules/sportsData/cronService';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Force local setup (no process.env)
const PORT: number = 4000;
// const HOST: string = 'localhost';


// const PORT = Number(process.env.PORT) || 4000;
// const HOST = process.env.HOST || 'localhost'; 

app.use(
  cors({
    origin: [
      "https://startsitem.com",
      "https://www.startsitem.com",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

// Middlewares
app.use((req, res, next) => {
  if (req.originalUrl === '/Payments/api/stripe/webhook') return next();
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  if (req.originalUrl === '/Payments/api/stripe/webhook') return next();
  express.urlencoded({ extended: true })(req, res, next);
});

app.use(
  bodyParser.json({
    verify: function (req: any, res, buf) {
      req.rawBody = buf;
    },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);

// Simple API logger
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send(`🚀 Server is running at ${PORT}`);
});

app.use('/Admin/api', adminRoutes);
app.use('/User/api', userRoutes);
app.use('/api', commonRoutes);
app.use('/Sports/api', nflRoutes);
app.use('/Payments/api', stripeRoutes);

// HTTP Server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Cron Jobs
const runCron = async () => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const result = await Transaction.updateMany(
      {
        status: 'active',
        current_period_end: { $lt: now },
      },
      {
        $set: { status: 'expired' },
      }
    );
    console.log(`[${new Date().toISOString()}] Updated ${result.modifiedCount} subscriptions to expired.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Cron Job Error:`, error);
  }
};

// Run every 6 hours
cron.schedule('0 */6 * * *', () => {
  console.log('Running cron job every 6 hours...');
  runCron();
});

// Update players daily
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Fetching active players...');
    const players = await getActivePlayers();
    await PlayerModel.deleteMany({});
    await PlayerModel.insertMany(players);
    console.log('Players data updated in DB');
  } catch (err: any) {
    console.error('Error during cron job:', err.message);
  }
});

// const generateSlugs = async () => { ... } // Keeping commented as in your code

const init = async () => {
  try {
    await connect_to_db();
    await bootstrap_data();
    startOddsCronJob();
    startPlayersCronJob();
    console.log('Backend initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize backend:', err);
    process.exit(1);
  }
};

init();
