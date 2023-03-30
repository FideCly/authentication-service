import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { protobufPackage } from './auth/auth.pb';
// import { HttpExceptionFilter } from './auth/filter/http-exception.filter';

async function bootstrap() {
  const app: INestMicroservice = await NestFactory.createMicroservice(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `${process.env.URL}:${process.env.PORT}`,
        package: protobufPackage,
        protoPath: join('node_modules/proto/proto/auth.proto'),
      },
    },
  );

  // app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.listen();
}

bootstrap();
