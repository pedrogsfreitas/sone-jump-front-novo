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
import {
  dayKeyFromInput,
  daysBetween,
  today,
} from '../../common/time/calendar';
import { MAX_BACKDATE_DAYS } from '../progress.constants';

/**
 * Aceita só datas entre hoje e MAX_BACKDATE_DAYS atrás, no calendário de São Paulo.
 * Datas futuras deixariam o cliente acumular XP adiantado; datas sem limite no passado
 * permitiriam fabricar sequência retroativa. O service repete a checagem — ela também
 * cobre a requisição sem `occurredOn`, que usa hoje.
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
          if (Number.isNaN(new Date(value).getTime())) return false;
          const daysAgo = daysBetween(dayKeyFromInput(value), today());
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

  /** Sem o campo, vale o dia de hoje em São Paulo. */
  @IsOptional()
  @IsDateString()
  @IsRecentPastDate()
  occurredOn?: string;
}
