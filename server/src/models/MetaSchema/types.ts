import { Document } from 'mongoose';

interface MetaType {
  date: string;
  meta: {
    [key: string]: string;
  };
}

export interface Meta {
  url: string;
  meta: MetaType[];
  updatedAt: Date;
  createdAt: Date;
}
export interface MetaDoc extends Document, Meta {}
