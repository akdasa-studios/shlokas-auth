import { Body, Controller, ForbiddenException, Logger, NotFoundException, Param, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { SessionsService } from './sessions.service'
import { AuthenticationService } from './authentication.service'
import { AuthenticationRequest, AuthenticationResponse, RefreshTokenRequest, RefreshTokenResponse } from '@akdasa-studios/shlokas-protocol'


@Controller("/")
export class AuthenticationController {
  private readonly logger = new Logger(AuthenticationController.name)

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Post(":strategy")
  async authenticate(
    @Param('strategy') strategy: string,
    @Body() request: AuthenticationRequest
  ): Promise<AuthenticationResponse|{}> {
    // Check if the strategy is registered
    if (!this.authenticationService.hasStrategy(strategy)) {
      throw new NotFoundException(`Unknown authentication strategy ${strategy}`)
    }

    // Authenticate the user using the strategy
    const result = await this.authenticationService.authenticate(strategy, {
      authorizationCode: request.authorizationCode
    })


    // Check if the authentication was successful
    if (result.status === "next")  { return { status: "next step is requred" } }
    if (result.status === "error") { throw new ForbiddenException("Invalid credentials") }
    if (!result.token?.idToken)    { throw new ForbiddenException("Invalid credentials") }
    if (!result.user?.email)       { throw new ForbiddenException("Email is not provided") }

    // Create user if it doesn't exist
    const isUserExists = await this.usersService.isUserExists(result.user.email)
    if (!isUserExists) {
      this.logger.log(`Creating user ${result.user.email}`)
      await this.usersService.createUser(result.user.email, result.user.id)
    }

    // Create a new session
    const session = await this.sessionsService.createSession(result.user.id, strategy, result.token.refreshToken)
    this.logger.debug(`Created session ${session} for user ${result.user.email}`)

    // Return the id token
    return {
      idToken: result.token.idToken,
      sessionId: session,
      collectionId: this.usersService.getGetUserCollectionName(result.user.email)
    }
  }

  @Post(":strategy/refresh")
  async refresh(
    @Param('strategy') strategy: string,
    @Body() request: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    this.logger.debug(`Refreshing session ${request.sessionId}`)

    // Check if the strategy is registered
    if (!this.authenticationService.hasStrategy(strategy)) {
      throw new NotFoundException(`Unknown authentication strategy ${strategy}`)
    }

    // Get the session
    const session = await this.sessionsService.getSession(request.sessionId)
    if (!session) {
      throw new ForbiddenException("Invalid session")
    }

    // Refresh the token
    const result = await this.authenticationService.refreshToken(strategy, {
      refreshToken: session.refreshToken,
      userId: session.userId,
    })

    // Return the id token
    return { idToken: result.idToken }
  }
}
