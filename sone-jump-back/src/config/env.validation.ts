import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  Length,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number;

  @IsString()
  @MinLength(1)
  DATABASE_URL: string;

  @IsString()
  @MinLength(1)
  CORS_ORIGIN: string;

  @IsString()
  @MinLength(32, {
    message: 'JWT_ACCESS_SECRET deve ter ao menos 32 caracteres',
  })
  JWT_ACCESS_SECRET: string;

  @IsString()
  @MinLength(1)
  JWT_ACCESS_TTL: string;

  @IsString()
  @MinLength(32, {
    message: 'JWT_REFRESH_SECRET deve ter ao menos 32 caracteres',
  })
  JWT_REFRESH_SECRET: string;

  @IsInt()
  @Min(1)
  JWT_REFRESH_TTL_DAYS: number;

  @IsString()
  @MinLength(16)
  COOKIE_SECRET: string;

  // HMAC key for deterministic CPF hashing, 32 raw bytes encoded as hex.
  @IsString()
  @Length(64, 64, {
    message:
      'CPF_HMAC_SECRET deve ser uma string hex de 32 bytes (64 caracteres)',
  })
  CPF_HMAC_SECRET: string;

  // AES-256-GCM key for CPF encryption at rest, 32 raw bytes encoded as hex.
  @IsString()
  @Length(64, 64, {
    message: 'CPF_ENC_KEY deve ser uma string hex de 32 bytes (64 caracteres)',
  })
  CPF_ENC_KEY: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join('; '))
      .join(' | ');
    throw new Error(`Configuração de ambiente inválida: ${details}`);
  }

  return validated;
}
