import {
  INestApplication,
  INestMicroservice,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { protobufPackage } from './auth/auth.pb';
// import { HttpExceptionFilter } from './auth/filter/http-exception.filter';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      url: `${process.env.URL}:${process.env.PORT}`,
      package: protobufPackage,
      protoPath: join('node_modules/proto/proto/auth.proto'),
    },
  });

  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.listen(+process.env.PORT || 3000);

  console.log(
    `Application is running on: ${process.env.URL}:${process.env.PORT}`,
  );
}

bootstrap();
