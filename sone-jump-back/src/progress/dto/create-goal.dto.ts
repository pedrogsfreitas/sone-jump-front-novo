import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateGoalDto {
  @IsString()
  @Length(2, 140)
  title: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  targetPct?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
