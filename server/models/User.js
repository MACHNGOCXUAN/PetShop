import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  birthDate: { type: Date },
  password: { type: String },
  role: { type: String, required: true, enum: ['admin', "user"], default: 'user' },
  avatar: { type: String },
  gender: { type: Boolean, default: false },
  address: { type: String },
  status: { type: String, default: 'Inactive', enum: ['Active', 'Inactive'] }, 
  lastActive: { type: Date, default: null },
  type: { type: String, required: true, enum: ['google', 'facebook', 'local'], default: 'local' },
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);
export default User;