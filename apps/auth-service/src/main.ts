import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';
import authRouter from '@auth/routes/auth.route';
import { closeOtpEmailQueue } from '@auth/queues/mail.queue';
import { startMailWorker, stopMailWorker } from '@auth/workers/mail.worker';

const swaggerDocPathCandidates = [
  path.join(__dirname, 'swagger-output.json'),
  path.join(__dirname, 'apps/auth-service/src/swagger-output.json'),
  path.join(__dirname, '../../../src/swagger-output.json'),
];

const swaggerDocPath = swaggerDocPathCandidates.find((candidate) =>
  fs.existsSync(candidate)
);

if (!swaggerDocPath) {
  throw new Error('Cannot find swagger-output.json');
}

const swaggerDoc = require(swaggerDocPath);

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.get('/api-docs-json', (req, res) => {
  res.json(swaggerDoc);
});
app.use('/auth', authRouter);
app.use(errorMiddleware);

const server = app.listen(port, () => {
    console.log(`Listening at http://${host}:${port}/api`);
    console.log(`Swagger UI available at http://${host}:${port}/api-docs`);
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
