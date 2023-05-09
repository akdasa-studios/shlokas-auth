/**
 * Authentication request
 */
export class Credentials {
  authorizationCode: string
}

export interface AuthenticationResult {
  /**
   * Authntication status:
   * - ok: Authentication was successful
   * - next: Authentication requires another step
   * - error: Authentication failed
   **/
  status: "ok"|"next"|"error"

  /**
   * Authentication token
   * - idToken: JWT token
   * - refreshToken: Refresh token
   * - email: User email
   * - userId: User ID
   */
  token?: AuthenticationToken
  user?: User
}

export interface AuthenticationToken {
  idToken: string
  refreshToken: string
}

export interface User {
  id: string
  email: string
}

export interface RefreshTokenRequest {
  refreshToken: string
  userId: string
}

export interface RefreshTokenResponse {
  idToken: string
}

export interface AuthenticationStrategy {
  authenticate(request: Credentials): Promise<AuthenticationResult>
  refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse>
}