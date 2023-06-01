import { JwtService } from '@nestjs/jwt'
import { Credentials, AuthenticationResult, AuthenticationStrategy, RefreshTokenRequest, RefreshTokenResponse } from '../authentication.strategy'
import { MailerService } from '@nestjs-modules/mailer'

const codes = new Map<string, string>()


export class EmailAuthenticationStrategy implements AuthenticationStrategy {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailer: MailerService
  ) { }

  async authenticate(
    request: Credentials
  ): Promise<AuthenticationResult> {
    const authorizationCodeTokens = request.authorizationCode.split(" ")
    const email = authorizationCodeTokens[0]
    const isTester = email === "test@shlokas.app"

    if (authorizationCodeTokens.length === 1) {
      const validationCode = this.getValidationCode()
      this.sendEmailWithValidationCode(email, validationCode)
      codes.set(email, validationCode)

      return { status: "next" }
    } else if (authorizationCodeTokens.length === 2) {
      const validationToken = authorizationCodeTokens[1]

      if (!isTester && codes.get(email) !== validationToken) {
        return { status: "error" }
      }

      const token = await this.jwtService.signAsync({
        sub: email,
      })

      return {
        status: "ok",
        token: {
          idToken: token,
          refreshToken: token,
        },
        user: {
          email: email,
          id: email
        }
      }
    }

  }

  async refreshToken(
    request: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const expiresAt = new Date().getTime() + 60*60*1000
    const token = await this.jwtService.signAsync({
      sub: request.userId,
      exp: expiresAt
    })
    return { idToken: token }
  }

  private getValidationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  private sendEmailWithValidationCode(email: string, code: string) {
    this.mailer.sendMail({
      to: email,
      subject: `${code} is your confirmation code`,
      template: 'auth-email',
      context: {
        code: code
      },
    })
  }
}
