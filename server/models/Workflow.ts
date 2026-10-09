import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowStep {
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
}

export interface IWorkflow extends Document {
  productId: mongoose.Types.ObjectId;
  status: 'In Progress' | 'Completed' | 'Needs Review';
  steps: IWorkflowStep[];
  updatedAt: Date;
}

const WorkflowStepSchema: Schema = new Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], required: true },
  progress: { type: Number, required: true, min: 0, max: 100 }
});

const WorkflowSchema: Schema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  status: { type: String, enum: ['In Progress', 'Completed', 'Needs Review'], required: true },
  steps: [WorkflowStepSchema],
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      ret.updatedAt = new Date(ret.updatedAt).getTime();
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
