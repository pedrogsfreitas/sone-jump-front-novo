import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

/**
 * Mirrors MAX_BACKDATE_DAYS in progress.service.ts, which stays the authoritative
 * check (it also covers the request that omits occurredOn and defaults to now).
 * Kept duplicated rather than imported to avoid a DTO -> service circular import.
 */
const MAX_BACKDATE_DAYS = 3;

/** UTC calendar day — the same criterion progress.service.ts applyStreak uses. */
function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Accepts a date only between today and MAX_BACKDATE_DAYS ago. Future dates would
 * let a client bank XP ahead of time and poison lastStudyDate; unbounded past dates
 * let a streak be fabricated retroactively.
 */
function IsRecentPastDate(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isRecentPastDate',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          const parsed = new Date(value);
          if (Number.isNaN(parsed.getTime())) return false;
          const daysAgo = Math.round(
            (Date.parse(dateKey(new Date())) - Date.parse(dateKey(parsed))) /
              86_400_000,
          );
          return daysAgo >= 0 && daysAgo <= MAX_BACKDATE_DAYS;
        },
        defaultMessage(): string {
          return `Data da sessão deve estar entre hoje e ${MAX_BACKDATE_DAYS} dias atrás.`;
        },
      },
    });
  };
}

export class LogStudySessionDto {
  @IsString()
  @Length(2, 120)
  topic: string;

  @IsInt()
  @Min(1)
  @Max(600)
  durationMinutes: number;

  @IsOptional()
  @IsString()
  @Length(0, 40)
  subjectTag?: string;

  /** Defaults to today (server time) when omitted. */
  @IsOptional()
  @IsDateString()
  @IsRecentPastDate()
  occurredOn?: string;
}
