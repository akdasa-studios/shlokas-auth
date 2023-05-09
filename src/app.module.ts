import { UsersService } from './authentication/users.service'
import { DbService } from './db.service'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthenticationModule } from './authentication/authentication.module'
import { MetaModule } from './meta/meta.module'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { MailerModule } from '@nestjs-modules/mailer'

@Module({
  imports: [
    JwtModule.register({}),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.data/.env',
        '.data/.env.local'
      ],
    }),
    MailerModule.forRoot({
      transport: {
        host: 'mail',
        port: 1025,
        auth: {
          user: '',
          pass: '',
        },
      }
    }),
    AuthenticationModule, MetaModule
  ],
  controllers: [],
  providers: [
    UsersService,
    DbService
  ],
})
export class AppModule { }
