import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @Length(2, 60)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 8)
  icon?: string;
}
