import { Schema, model, models, type Document } from 'mongoose'

export type UserRole = 'owner' | 'superadmin'

export interface IUser extends Document {
  email: string
  passwordHash: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name:         { type: String, required: true, trim: true },
    role:         { type: String, enum: ['owner', 'superadmin'], default: 'owner' },
  },
  { timestamps: true }
)

export const UserModel = models.User ?? model<IUser>('User', UserSchema)
