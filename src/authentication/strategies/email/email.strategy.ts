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

    if (authorizationCodeTokens.length === 1) {
      const validationToken = Math.floor(100000 + Math.random() * 900000).toString()
      this.mailer.sendMail({
        to: email,
        html: `<span title='code'>${validationToken}</span>`
      })

      codes.set(email, validationToken)

      return { status: "next" }
    } else if (authorizationCodeTokens.length === 2) {
      const validationToken = authorizationCodeTokens[1]

      if (codes.get(email) !== validationToken) {
        return { status: "error" }
      }

      const token = await this.jwtService.signAsync({
        sub: email,
      })
      console.log("token", token)

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
    const token = await this.jwtService.signAsync({
      sub: request.userId,
    })
    return { idToken: token }
  }
}
