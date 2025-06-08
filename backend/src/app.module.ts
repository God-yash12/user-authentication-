import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import configuration from './config/configuration';
import { HttpModule } from '@nestjs/axios';
import { MailerModule } from './mailer/mailer.module';
import { LoginModule } from './login/login.module';
import { ResetPasswordModule } from './reset-password/reset-password.module';
import { UserInfoModule } from './user-info/user-info.module';

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
    MailerModule,
    LoginModule,
    ResetPasswordModule,
    UserInfoModule
  ],
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
