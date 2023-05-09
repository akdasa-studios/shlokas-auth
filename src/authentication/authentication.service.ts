import { Injectable, Logger } from '@nestjs/common'
import { Credentials, AuthenticationResult, AuthenticationStrategy, RefreshTokenRequest } from './strategies/authentication.strategy'

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name)
  private readonly strategies = new Map<string, AuthenticationStrategy>()

  /**
   * Register a new authentication strategy
   * @param strategyName Strategy name
   * @param strategy Strategy instance
   */
  registerStrategy(
    strategyName: string,
    strategy: AuthenticationStrategy
  ) {
    this.logger.debug(`Registering authentication strategy ${strategyName}`)
    this.strategies.set(strategyName, strategy)
  }

  /**
   * Check if a strategy is registered
   * @param strategyName Strategy name
   * @returns True if the strategy is registered, otherwise false
   */
  hasStrategy(strategyName: string): boolean {
    return this.strategies.has(strategyName)
  }

  /**
   * Authenticate a user using a specific strategy
   * @param strategyName Strategy name to use
   * @param request Authentication request
   */
  async authenticate(
    strategyName: string,
    request: Credentials
  ): Promise<AuthenticationResult> {
    const strategy = this.strategies.get(strategyName)
    return await strategy.authenticate(request)
  }

  async refreshToken(
    strategyName: string,
    request: RefreshTokenRequest,
  ) {
    const strategy = this.strategies.get(strategyName)
    return await strategy.refreshToken(request)
  }
}
