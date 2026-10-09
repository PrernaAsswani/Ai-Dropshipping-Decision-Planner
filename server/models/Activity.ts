import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  message: string;
  timestamp: Date;
}

const ActivitySchema: Schema = new Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      ret.timestamp = new Date(ret.timestamp).getTime();
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model<IActivity>('Activity', ActivitySchema);
