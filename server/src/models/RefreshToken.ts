import { Schema, model, type Types } from 'mongoose';

// We store a HASH of each issued refresh token (never the token itself), so a
// leaked database can't be used to forge sessions. `revoked` + `expiresAt`
// let us invalidate tokens on logout or expiry — this is what gives stateless
// JWTs the revocability they normally lack.
export interface IRefreshToken {
  user: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
