import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isValidCpf } from '../../common/crypto/cpf.util';

@ValidatorConstraint({ name: 'isCpf', async: false })
class IsCpfConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && isValidCpf(value);
  }

  defaultMessage(): string {
    return 'CPF inválido.';
  }
}

const digitsOnly = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.replace(/\D/g, '') : value;

export class RegisterDto {
  @IsEmail({}, { message: 'e-mail inválido.' })
  email: string;

  @IsString()
  @Length(3, 30, { message: 'username deve ter entre 3 e 30 caracteres.' })
  @Matches(/^[a-zA-Z0-9_.]+$/, {
    message:
      'username deve conter apenas letras, números, ponto ou underscore.',
  })
  username: string;

  @IsString()
  @MinLength(8, { message: 'senha deve ter ao menos 8 caracteres.' })
  password: string;

  @IsString()
  @Length(2, 120, { message: 'nome completo inválido.' })
  fullname: string;

  @Transform(digitsOnly)
  @IsString()
  @Validate(IsCpfConstraint)
  cpf: string;

  @Transform(digitsOnly)
  @IsString()
  @Length(10, 11, { message: 'telefone inválido.' })
  phone: string;
}
