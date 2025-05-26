import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PasswordModule } from './password/password.module';
import { CaptchaModule } from './captcha/captcha.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import configuration from './config/configuration';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true,
    }),

    HttpModule,
    // TypeORM Configuration
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    PasswordModule,
    CaptchaModule],
  controllers: [AppController],
  providers: [AppService],
})


export class AppModule implements OnModuleInit {
  constructor(private configService: ConfigService) { }
  async onModuleInit() {
    try {
      console.log("Database Connected ")
    } catch (error) {
      console.log("Error connecting database", error)
    }
  }
}
