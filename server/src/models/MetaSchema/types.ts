import { Document } from 'mongoose';

export interface Meta {
  url: string;
  meta: {
    [key: string]: string;
  }[];
  title: string;
  favicon: string;
}
export interface MetaDoc extends Document, Meta {}
