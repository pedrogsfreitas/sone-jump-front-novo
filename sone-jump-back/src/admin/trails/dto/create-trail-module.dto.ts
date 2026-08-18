import { IsInt, IsString, Length, Min } from 'class-validator';

export class CreateTrailModuleDto {
  @IsString()
  @Length(2, 160)
  title: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsInt()
  @Min(0)
  lessons: number;
}
