import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class LogStudySessionDto {
  @IsString()
  @Length(2, 120)
  topic: string;

  @IsInt()
  @Min(1)
  @Max(600)
  durationMinutes: number;

  @IsOptional()
  @IsString()
  @Length(0, 40)
  subjectTag?: string;

  /** Defaults to today (server time) when omitted. */
  @IsOptional()
  @IsDateString()
  occurredOn?: string;
}
