import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminUserDocument = AdminUser & Document;

@Schema({ collection: 'admin_users' })
export class AdminUser {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password_hash: string; // bcrypt hash, salt rounds >= 12

  @Prop({ type: Date, default: null })
  last_login_at: Date | null;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
