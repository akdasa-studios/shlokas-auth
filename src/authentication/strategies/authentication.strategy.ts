/**
 * Authentication request
 */
export class Credentials {
  authorizationCode: string
}

export interface AuthenticationSuccessfulResult {
  status: "ok"
  token: AuthenticationToken
  user: User
}

export interface AuthenticationFailedResult {
  status: "error"
}

export interface AuthenticationNextStepRequiredResult {
  status: "next"
}

export type AuthenticationResult =
  AuthenticationSuccessfulResult | AuthenticationFailedResult | AuthenticationNextStepRequiredResult

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