import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import { MetaDoc } from './types';

const metaSchema: Schema = new Schema(
  {
    url: String,
    title: String,
    favicon: String,
    meta: [
      {
        type: mongoose.Schema.Types.Map,
        of: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

metaSchema.plugin(mongoosePaginate);

export default mongoose.model<MetaDoc>('Meta', metaSchema, 'metas');
