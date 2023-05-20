import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'


export interface AuthorizationTokenResponse {
  idToken: string
  refreshToken: string
}

export interface IdToken {
  email: string
  userId: string
}

@Injectable()
export class GoogleService {
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly client: OAuth2Client

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.configService.get<string>('AUTH_GOOGLE_CLIENT_ID')
    this.clientSecret = this.configService.get<string>('AUTH_GOOGLE_CLIENT_SECRET')

    if (!this.clientId) { throw new Error('AUTH_GOOGLE_CLIENT_ID is required') }
    if (!this.clientSecret) { throw new Error('AUTH_GOOGLE_CLIENT_SECRET is required') }

    this.client = new google.auth.OAuth2({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
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
    const response = await this.client.getToken(authorizationCode)
    return {
      idToken: response.tokens.id_token,
      refreshToken: response.tokens.refresh_token
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
    const result = await this.client.verifyIdToken({
      idToken
    })
    return {
      userId: result.getUserId(),
      email: result.getAttributes().payload.email,
    }
  }


  async refreshToken(
    refreshToken: string,
  ) {
    const requestBody = `client_secret=${this.clientSecret}&client_id=${this.clientId}&refresh_token=${refreshToken}&grant_type=refresh_token`
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: requestBody
    })
    const data = await res.json()

    return {
      idToken: data.id_token,
      expires: new Date().getTime() + data.expires
    }
  }
}
