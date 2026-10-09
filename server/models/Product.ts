import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  cost: number;
  sellingPrice: number;
  additionalCost: number;
  rating: number;
  salesVolume: string; // High, Medium, Low
  supplierId: mongoose.Types.ObjectId;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  cost: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  additionalCost: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  salesVolume: { type: String, required: true, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true }
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

export default mongoose.model<IProduct>('Product', ProductSchema);
