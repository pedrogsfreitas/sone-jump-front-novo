import { CanActivate, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Gates routes that only make sense before a real payment provider is wired in
 * (payment simulation). Throws NotFoundException rather than Forbidden in
 * production so the route's existence isn't even revealed — this must never be
 * reachable in prod, since it's effectively a "grant yourself a paid plan" endpoint.
 */
@Injectable()
export class DevOnlyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(): boolean {
    if (this.config.get<string>('NODE_ENV') === 'production') {
      throw new NotFoundException();
    }
    return true;
  }
}
