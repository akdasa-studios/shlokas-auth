import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { ScheduleModule } from '@nestjs/schedule'
import { AuthenticationModule } from './authentication/authentication.module'
import { UsersService } from './authentication/users.service'
import { DbService } from './db.service'
import { MetaModule } from './meta/meta.module'


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
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('AUTH_EMAIL_HOST'),
          port: config.get('AUTH_EMAIL_PORT'),
          secure: false,
          auth: {
            user: config.get('AUTH_EMAIL_LOGIN'),
            pass: config.get('AUTH_EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get('AUTH_EMAIL_FROM')}>`,
          subject: "Shlokas"
        },
        // template: {
        //   dir: join(__dirname, 'templates'),
        //   adapter: new HandlebarsAdapter(),
        //   options: {
        //     strict: true,
        //   },
        // },
      }),
      inject: [ConfigService],
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
