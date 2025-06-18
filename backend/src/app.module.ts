import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import configuration from './config/configuration';
import { HttpModule } from '@nestjs/axios';
import { SignupModule } from './signup/signup.module';
import { LoginModule } from './login/login.module';
import { EmailModule } from './email/email.module';
import { OtpModule } from './otp/otp.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 5,   // 5 requests per minute
      },
    ]),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '15m' },
    }),

    HttpModule,
    // TypeORM Configuration
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    SignupModule,
    LoginModule,
    EmailModule,
    OtpModule,
    UsersModule,
    CommonModule,

    
  ],
  controllers: [AppController],
  providers: [
    AppService,
     {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
      
    },
  ],
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
