import { IsOptional, IsUrl } from 'class-validator';

export class ConfirmSessionDto {
  @IsOptional()
  @IsUrl()
  meetingUrl?: string;
}
