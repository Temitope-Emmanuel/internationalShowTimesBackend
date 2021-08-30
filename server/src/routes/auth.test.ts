import mongoose from 'mongoose';
import supertest from 'supertest';
import { initDB, destroyDB } from '../utils/test-utils';
import app from '..';

const request = supertest(app);

// const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbName = 'test-db';
// const url = `mongodb://${dbHost}/${dbName}`;
const url = `mongodb://localhost:27017/${dbName}`;

beforeAll(async () => {
  await initDB();
  await mongoose.connect(url, { useNewUrlParser: true });
});

afterAll(async () => {
  await destroyDB();
  await mongoose.disconnect();

  await new Promise(resolve => setTimeout(() => resolve(null), 500));
});

describe('Auth Test', () => {
  it('Should successfully register', async done => {
    const username = 'user1',
      password = 'drowssap001';
    const res = await request.post('/register').send({ username, password });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Sign Up Successful');
    done();
  });
  it('Should login successfully', async done => {
    const username = 'user1';
    const password = 'drowssap001';
    const res = await request.post('/login').send({ username, password });
    console.log('This is teh req.body', res.body, res.status);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe(username);
    done();
  });
});
