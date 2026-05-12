import express from 'express';
import cors from 'cors';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
  ],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
}));

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});
app.use(errorMiddleware);

const server = app.listen(port, () => {
    console.log(`Listening at http://${host}:${port}/api`);
});
server.on('error', (error) => {
    console.error('server error: ', error);
});
