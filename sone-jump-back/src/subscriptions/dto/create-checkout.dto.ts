import { IsIn } from 'class-validator';
import { BillingCycle, PlanKey } from '../../../generated/prisma/enums';

export class CreateCheckoutDto {
  @IsIn([PlanKey.PRO, PlanKey.PREMIUM])
  planKey: typeof PlanKey.PRO | typeof PlanKey.PREMIUM;

  @IsIn([BillingCycle.MENSAL, BillingCycle.ANUAL])
  billingCycle: BillingCycle;
}
