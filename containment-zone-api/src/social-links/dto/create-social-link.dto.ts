import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { SocialIcon } from '../schemas/social-link.schema';

export class CreateSocialLinkDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(https?:\/\/|mailto:)/, {
    message: 'href must start with https://, http://, or mailto:',
  })
  href: string;

  @IsEnum(SocialIcon)
  icon: SocialIcon;

  @IsString()
  @IsNotEmpty()
  handle: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
