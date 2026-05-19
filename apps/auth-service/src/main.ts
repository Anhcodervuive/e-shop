import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route';
import { closeOtpEmailQueue } from './queues/mail.queue';
import { startMailWorker, stopMailWorker } from './workers/mail.worker';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
startMailWorker();

app.use(cors({
  origin: [
    'http://localhost:3000',
  ],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});
app.use('/auth', authRouter);
app.use(errorMiddleware);

const server = app.listen(port, () => {
    console.log(`Listening at http://${host}:${port}/api`);
});
server.on('error', (error) => {
    console.error('server error: ', error);
});

const shutdown = async () => {
  await stopMailWorker();
  await closeOtpEmailQueue();
  server.close();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
