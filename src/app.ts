import express, { Application, Request, Response } from "express";
import cors from 'cors';
import path from 'path';
import routes from './route/index';


const app:Application = express();

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://climate-change-forntend-rknk.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// handle preflight
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/pdfs', express.static(path.join(__dirname, '../public/pdfs')));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Climate Hazard Calculator API is running' });
});

export default app;


