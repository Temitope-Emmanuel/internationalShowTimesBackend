import { PaginateResult } from 'mongoose';
import { Request } from 'express';

export interface GetUserCreateRequest {
  username: string;
  password: string;
}
export interface GetUserCreateResponse {
  message: string;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
interface UserResponse {
  username: string;
}
export interface LoginResponse {
  token?: string;
  user?: UserResponse;
  error?: string;
}
export interface UrlDataResponse {
  originalUrl: string;
  shortUrl: string;
  updatedAt: Date;
  urlCode: string;
  user?: string;
}
