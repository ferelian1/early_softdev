import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

export enum ContainmentStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  CLASSIFIED = 'CLASSIFIED',
}

@Schema({ timestamps: true, collection: 'projects' })
export class Project {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length >= 1,
      message: 'tech_stack must have at least 1 element',
    },
  })
  tech_stack: string[];

  @Prop({ required: true, trim: true, maxlength: 120 })
  description: string;

  @Prop({ required: true, enum: ContainmentStatus })
  containment_status: ContainmentStatus;

  // Provided by { timestamps: true }
  createdAt: Date;
  updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
