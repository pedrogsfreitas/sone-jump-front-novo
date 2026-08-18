import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const AVATAR_COLORS = ['purple', 'blue', 'green', 'orange', 'pink', 'yellow'];

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-zA-Z0-9_.]+$/, {
    message:
      'username deve conter apenas letras, números, ponto ou underscore.',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160)
  bio?: string;

  @IsOptional()
  @IsIn(AVATAR_COLORS)
  avatarColor?: string;

  @IsOptional()
  @IsBoolean()
  focusMode?: boolean;
}
