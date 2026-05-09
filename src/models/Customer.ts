import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  idNo: string;
  ite: string;
  name: string;
  surname: string;
  dateOfBirth?: Date;
  country: string;
  description: string;
  totalAmount: number;
  advancePayment: number;
  balancePayment: number;
  finishingDate?: Date;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    idNo: { type: String, required: true, unique: true },
    ite: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    country: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    totalAmount: { type: Number, default: 0 },
    advancePayment: { type: Number, default: 0 },
    balancePayment: { type: Number, default: 0 },
    finishingDate: { type: Date },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);
