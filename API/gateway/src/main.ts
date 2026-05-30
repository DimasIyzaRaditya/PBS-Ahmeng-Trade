import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ["http://localhost:3010", "http://localhost:8081"],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // buang field yang tidak ada di DTO
    forbidNonWhitelisted: false,
    transform: true,       // otomatis konversi tipe data (string -> number, dll)
  }));
  await app.listen(3000);
}
bootstrap();
