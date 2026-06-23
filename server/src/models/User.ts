import { Schema, model, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { Role } from '@app/types';

// The shape of a User document. `password` stores the bcrypt HASH (never
// plaintext) and is `select: false`, so it is excluded from query results
// unless explicitly requested with `.select('+password')`.
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

// Instance methods available on a loaded user document.
interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true },
);

// Pre-save hook: hash the password, but ONLY when it has changed. This runs
// on every `.save()`; skipping unchanged passwords avoids re-hashing on
// unrelated updates (which would break login).
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a plaintext candidate against the stored hash.
userSchema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser, UserModel>('User', userSchema);
