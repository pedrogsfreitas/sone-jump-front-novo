import { IsIn } from 'class-validator';

export class UpdateLiveStatusDto {
  @IsIn(['AO_VIVO', 'ENCERRADA'])
  status: 'AO_VIVO' | 'ENCERRADA';
}
