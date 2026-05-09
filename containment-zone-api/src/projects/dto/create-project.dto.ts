import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { ContainmentStatus } from '../schemas/project.schema';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tech_stack: string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  description: string;

  @IsEnum(ContainmentStatus)
  containment_status: ContainmentStatus;
}
