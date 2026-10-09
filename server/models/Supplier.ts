import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  rating: number;
  deliveryTimeDays: number;
  returnRate: number;
  qualityScore: number;
  priceLevel: string; // Low, Medium, High
}

const SupplierSchema: Schema = new Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  deliveryTimeDays: { type: Number, required: true, min: 0 },
  returnRate: { type: Number, required: true, min: 0, max: 100 },
  qualityScore: { type: Number, required: true, min: 0, max: 100 },
  priceLevel: { type: String, required: true, enum: ['Low', 'Medium', 'High'] }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);
