import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  app.use(helmet());
  app.use(cookieParser(config.get<string>('COOKIE_SECRET')));
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN'),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  if (!isProduction) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('JUMP API')
        .setDescription('Back-end da plataforma JUMP')
        .setVersion('0.1')
        .addBearerAuth()
        .build(),
    );
    // SwaggerModule.setup() ignores setGlobalPrefix(), so the mount path must
    // already include "api/" to end up at the documented /api/docs URL.
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = config.get<number>('PORT') ?? 8080;
  await app.listen(port);

  console.log(
    `API rodando em http://localhost:${port}/api${isProduction ? '' : `, docs em http://localhost:${port}/api/docs`}`,
  );
}

void bootstrap();
