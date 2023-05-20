import { Credentials, AuthenticationResult, AuthenticationStrategy, RefreshTokenRequest, RefreshTokenResponse } from '../authentication.strategy'
import { AppleService } from './apple.service'


export class AppleAuthenticationStrategy implements AuthenticationStrategy {
  constructor(
    private readonly appleService: AppleService,
  ) {}

  async authenticate(
    request: Credentials
  ): Promise<AuthenticationResult> {
    const authToken = await this.appleService.getAuthorizationToken(request.authorizationCode)
    const idToken = await this.appleService.verifyIdToken(authToken.idToken)

    return {
      status: "ok",
      token: {
        idToken: authToken.idToken,
        refreshToken: authToken.refreshToken,
      },
      user: {
        email: idToken.email,
        id: idToken.userId
      }
    }
  }

  async refreshToken(
    request: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const result = await this.appleService.refreshToken(request.refreshToken)
    return {
      idToken: result.idToken
    }
  }
}
