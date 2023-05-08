import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { DbService } from '../db.service'
import { AuthenticationController } from './authentication.controller'
import { AuthenticationService } from './authentication.service'
import { SessionsService } from './sessions.service'
import { AppleService } from './strategies/apple/apple.service'
import { AppleAuthenticationStrategy } from './strategies/apple/apple.strategy'
import { EmailAuthenticationStrategy } from './strategies/email/email.strategy'
import { TasksService } from './tasks.service'
import { UsersService } from './users.service'
import { readFileSync } from 'fs'
import { MailerService } from '@nestjs-modules/mailer'


const res = readFileSync(".data/email.auth.strategy.key").toString()

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      global: true,
      privateKey: res,
      signOptions: {
        keyid: 'shlokas',
        issuer: 'shlokas',
        algorithm: 'RS256',
        expiresIn: '120s'
      },
    }),
  ],
  providers: [
    AuthenticationService,
    AppleService,
    DbService,
    UsersService,
    SessionsService,
    TasksService
  ],
  controllers: [
    AuthenticationController
  ],
})
export class AuthenticationModule {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly appleService: AppleService,
    private readonly tasksService: TasksService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService
  ) {
    this.authenticationService.registerStrategy('apple', new AppleAuthenticationStrategy(appleService))
    this.authenticationService.registerStrategy('email', new EmailAuthenticationStrategy(jwtService, mailerService))
    tasksService.updateApplePublicKeys()
    tasksService.updateLocalKeys()
  }
}
