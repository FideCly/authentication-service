import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME, AUTH_SERVICE_NAME } from './auth/auth.pb';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.dev', 'env.local'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      migrationsRun: true,
      synchronize: Boolean(process.env.SYNCHRONIZE),
      logging: false,
      autoLoadEntities: true,
    }),
    ClientsModule.register([
      {
        name: AUTH_SERVICE_NAME,
        transport: Transport.TCP,
        options: {
          // package: AUTH_PACKAGE_NAME,
          // protoPath: 'node_modules/proto/proto/auth.proto',
          // url: process.env.API_URL,
          host: process.env.API_HOST,
          port: +process.env.API_PORT,
        },
      },
    ]),
    AuthModule,
  ],
})
export class AppModule {}
