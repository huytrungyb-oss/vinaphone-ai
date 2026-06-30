import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", UserSchema);
