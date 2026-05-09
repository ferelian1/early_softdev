import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SocialLinkDocument = SocialLink & Document;

export enum SocialIcon {
  Github = 'Github',
  Instagram = 'Instagram',
  Twitter = 'Twitter',
  Globe = 'Globe',
  Gamepad2 = 'Gamepad2',
  Mail = 'Mail',
  Linkedin = 'Linkedin',
  Youtube = 'Youtube',
}

@Schema({ timestamps: true, collection: 'social_links' })
export class SocialLink {
  @Prop({ required: true, trim: true })
  label: string;

  @Prop({ required: true })
  href: string;

  @Prop({ required: true, enum: SocialIcon })
  icon: SocialIcon;

  @Prop({ required: true, trim: true })
  handle: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  createdAt: Date;
  updatedAt: Date;
}

export const SocialLinkSchema = SchemaFactory.createForClass(SocialLink);
