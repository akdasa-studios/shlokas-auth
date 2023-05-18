import { Credentials, AuthenticationResult, AuthenticationStrategy, RefreshTokenRequest, RefreshTokenResponse } from '../authentication.strategy'
import { GoogleService } from './google.service'


export class GoogleAuthenticationStrategy implements AuthenticationStrategy {
  constructor(
    private readonly googleService: GoogleService,
  ) {}

  async authenticate(
    request: Credentials
  ): Promise<AuthenticationResult> {
    const authToken = await this.googleService.getAuthorizationToken(request.authorizationCode)
    const idToken = await this.googleService.verifyIdToken(authToken.idToken)

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
    const result = await this.googleService.refreshToken(request.refreshToken)
    return {
      idToken: result.idToken
    }
  }
}
