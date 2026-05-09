import mongoose, { Schema, Document } from "mongoose";

export interface IJobCategory extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobCategorySchema = new Schema<IJobCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.JobCategory ||
  mongoose.model<IJobCategory>("JobCategory", JobCategorySchema);
