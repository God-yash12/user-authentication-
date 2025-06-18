import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import  helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.use(cookieParser()); 
   app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Secure Registration API')
    .setDescription('Step 1: User Registration with Password Hashing')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
