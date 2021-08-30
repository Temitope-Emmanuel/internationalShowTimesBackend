import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import multer from 'multer';
import cors from 'cors';

const upload = multer();

import './models/UrlShorten';
import './models/UserSchema';
import './models/MetaSchema';

dotenv.config();

import authRoutes from './routes/auth';
import urlRoutes from './routes/urlShorten';
import metaRoutes from './routes/meta';
// const DB = process.env.DB;
const DB_HOST = process.env.DB_HOST;

// const dbURI = `mongodb://${DB_HOST}/${DB}`;
const dbURI = `mongodb://localhost:27017/${DB_HOST}`;
const PORT = process.env.PORT || 3000;
const connectOptions = {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  connectTimeoutMS: 10000,
  useNewUrlParser: true,
};
//Connect to MongoDB
mongoose.Promise = global.Promise;
mongoose
  .connect(dbURI, connectOptions)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const app = express();
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.none());
app.use(cors());
app.options('*', cors());
authRoutes(app);
metaRoutes(app);
urlRoutes(app);

app.listen(PORT, () => {
  console.log('Listening successfully, ', PORT);
});

export default app;
