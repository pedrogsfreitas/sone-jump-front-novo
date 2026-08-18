import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateTrailDto {
  @IsString()
  @Length(2, 120)
  name: string;

  @IsString()
  @Length(2, 60)
  category: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
