import { Express } from 'express';
import mongoose from 'mongoose';
import jwt, { Secret } from 'jsonwebtoken';
import { User } from '../models/UserSchema/types';
import dotenv from 'dotenv';
import {
  GetUserCreateRequest,
  GetUserCreateResponse,
  LoginRequest,
  LoginResponse,
} from './types';
import config from '../utils/config';

dotenv.config();

const User = mongoose.model<User>('User');
const jwtSecret: Secret = config.jwtSecret;

export default (app: Express) => {
  app.post<{}, GetUserCreateResponse, GetUserCreateRequest>(
    '/register',
    async (req, res) => {
      try {
        if (req.body.username && req.body.password) {
          const newUser = await new User(req.body);
          await newUser.save();
          res.status(200).json({
            message: 'Sign Up Successful',
          });
        } else {
          return res
            .status(401)
            .json({ message: 'Please fill in the required fields' });
        }
      } catch (err) {
        if (err.code == 11000) {
          return res.status(401).json({
            message: 'Error This username is already taken',
          });
        }
        res.status(401).json({
          message: 'Something Went Wrong :(',
        });
      }
    },
  );
  app.post<{}, LoginResponse, LoginRequest>('/login', async (req, res) => {
    try {
      if (req.body.password && req.body.username) {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
          return res.status(401).json({ error: 'User not Found !!!' });
        }
        if (!user.authenticate(req.body.password)) {
          return res.status(401).json({
            error: "Password don't match",
          });
        }
        const token = jwt.sign({ _id: user._id }, jwtSecret);
        return res.status(200).json({
          token,
          user: {
            username: user.username,
          },
        });
      } else {
        return res.status(401).json({
          error: 'Please submit the required fields username and password',
        });
      }
    } catch (err) {
      return res.status(401).json({ error: 'Could not sign in' });
    }
  });
};
