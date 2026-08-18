import { IsInt, Max, Min } from 'class-validator';

export class UpdateGoalDto {
  @IsInt()
  @Min(0)
  @Max(100)
  currentPct: number;
}
