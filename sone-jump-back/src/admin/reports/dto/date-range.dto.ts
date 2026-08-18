import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  get fromDate(): Date {
    return this.from ? new Date(this.from) : new Date(0);
  }

  get toDate(): Date {
    return this.to ? new Date(this.to) : new Date();
  }
}
