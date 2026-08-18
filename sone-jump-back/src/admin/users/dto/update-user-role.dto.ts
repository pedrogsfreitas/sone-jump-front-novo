import { IsIn } from 'class-validator';
import { Role } from '../../../../generated/prisma/enums';

export class UpdateUserRoleDto {
  @IsIn([Role.STUDENT, Role.MENTOR, Role.ADMIN])
  role: Role;
}
