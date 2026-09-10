import { IsEnum } from 'class-validator';
import { JobApplicationStatus } from '../../../../generated/prisma/enums';

export class UpdateApplicationDto {
  @IsEnum(JobApplicationStatus, {
    message: 'status deve ser APLICADO, VISUALIZADO, REJEITADO ou ACEITO.',
  })
  status: JobApplicationStatus;
}
