import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../../../generated/prisma/enums';
import { AuthenticatedUser } from '../strategies/jwt.strategy';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Must run after JwtAuthGuard (which populates req.user). This is what will finally
 * gate `/admin/*`-equivalent endpoints, which today have no protection at all on the
 * frontend.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    if (!request.user || !requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException('Acesso restrito.');
    }
    return true;
  }
}
