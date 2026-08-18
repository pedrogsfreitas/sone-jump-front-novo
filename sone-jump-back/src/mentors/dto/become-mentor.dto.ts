import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class BecomeMentorDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  companyName?: string;

  /** Omit (or 0) for a free mentor. */
  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyPriceCents?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsInt({ each: true })
  skillIds: number[];
}
