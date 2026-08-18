import { IsString, Length } from 'class-validator';

export class ClaimReferralDto {
  @IsString()
  @Length(3, 30)
  code: string;
}
