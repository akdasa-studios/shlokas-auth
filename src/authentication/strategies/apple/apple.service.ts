import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getClientSecret, getAuthorizationToken, verifyIdToken, refreshAuthorizationToken } from 'apple-signin-auth'

export interface AuthorizationTokenResponse {
  idToken: string
  refreshToken: string
}

export interface IdToken {
  email: string
  userId: string
}

@Injectable()
export class AppleService {
  private readonly clientId: string
  private readonly teamId: string
  private readonly keyPath: string
  private readonly keyId: string

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.configService.get<string>('AUTH_APPLE_CLIENT_ID')
    this.teamId = this.configService.get<string>('AUTH_APPLE_TEAM_ID')
    this.keyPath = this.configService.get<string>('AUTH_APPLE_KEY_PATH')
    this.keyId = this.configService.get<string>('AUTH_APPLE_KEY_ID')

    if (!this.clientId) { throw new Error('AUTH_APPLE_CLIENT_ID is required') }
    if (!this.teamId) { throw new Error('AUTH_APPLE_TEAM_ID is required') }
    if (!this.keyPath) { throw new Error('AUTH_APPLE_KEY_PATH is required') }
    if (!this.keyId) { throw new Error('AUTH_APPLE_KEY_ID is required') }
  }

  /**
   * Get client secret
   * @param clientId Client ID
   * @param teamId Team ID
   * @param privateKeyPath Path to the private key file
   * @param privateKeyId Private key ID
   * @returns Client secret
   */
  getClientSecret(): string {
    return getClientSecret({
      clientID: this.clientId,
      teamID: this.teamId,
      privateKeyPath: this.keyPath,
      keyIdentifier: this.keyId,
    })
  }

  /**
   * Get authorization token
   * @param authorizationCode Authorization code
   * @param clientId Client ID
   * @param clientSecret Client secret
   * @returns Authorization token
   */
 async getAuthorizationToken(
    authorizationCode: string
  ): Promise<AuthorizationTokenResponse> {
    const response = await getAuthorizationToken(authorizationCode, {
      clientID: this.clientId,
      clientSecret: this.getClientSecret(),
      redirectUri: undefined
    })
    return {
      idToken: response.id_token,
      refreshToken: response.refresh_token,
    }
  }

  /**
   * Verify ID token
   * @param idToken ID token
   * @returns ID token payload
   */
  async verifyIdToken(
    idToken: string
  ): Promise<IdToken> {
    const result = await verifyIdToken(idToken)
    return {
      email: result.email,
      userId: result.sub
    }
  }


  async refreshToken(
    refreshToken: string,
  ) {
    const result = await refreshAuthorizationToken(
      refreshToken, {
        clientID: this.clientId,
        clientSecret: this.getClientSecret()
      }
    )
    return {
      idToken: result.id_token,
    }
  }
}
