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
    @Body() request: AuthenticationRequest,
  ): Promise<AuthenticationResponse> {
    // Check if the strategy is registered
    if (!this.authenticationService.hasStrategy(strategy)) {
      throw new NotFoundException(`Unknown authentication strategy ${strategy}`)
    }

    // Authenticate the user using the specified strategy
    const result = await this.authenticationService.authenticate(strategy, {
      authorizationCode: request.authorizationCode
    })

    // Check if the authentication was successful
    if (result.status === "next")  { return { status: "next", message: "Next step is required" } }
    if (result.status === "error") { throw new ForbiddenException("Invalid credentials") }
    if (!result.token.idToken)     { throw new ForbiddenException("Invalid credentials") }
    if (!result.user.email)        { throw new ForbiddenException("Email is not provided") }

    // Create user if it doesn't exist
    const userEmail = result.user.email.toLowerCase()
    const isUserExists = await this.usersService.isUserExists(userEmail)
    if (!isUserExists) {
      this.logger.log(`Creating user ${userEmail}`)
      await this.usersService.createUser(userEmail, result.user.id)
    } else {
      this.logger.log(`Updating permissions for user ${userEmail}: ${result.user.id}`)
      await this.usersService.updatePermissions(userEmail, result.user.id)
    }

    // Create a new session, if the user is not a test user
    const session = userEmail !== "test@shlokas.app"
      ? await this.sessionsService.createSession(result.user.id, strategy, result.token.refreshToken)
      : "test-session"
    this.logger.debug(`Created session ${session} for user ${userEmail}`)

    // Debug
    this.logger.debug(`Token: ${result.token.idToken}`)

    // Return the id token
    return {
      status: "ok",
      idToken: result.token.idToken,
      sessionId: session,
      collectionId: this.usersService.getGetUserCollectionName(userEmail)
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

    // Mark session as live
    await this.sessionsService.markSessionLive(request.sessionId)

    // Return the id token
    return {
      idToken: result.idToken,
    }
  }
}
