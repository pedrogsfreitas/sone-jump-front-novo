import { IsIn } from 'class-validator';

export class SimulatePaymentDto {
  @IsIn(['PAGO', 'FALHOU'])
  outcome: 'PAGO' | 'FALHOU';
}
