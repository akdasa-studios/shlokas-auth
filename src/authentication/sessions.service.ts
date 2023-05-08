import { Injectable } from '@nestjs/common'
import { DbService } from '../db.service'

export interface Session {
  userId: string
  createdAt: number
  refreshToken: string
  strategy: string
}

@Injectable()
export class SessionsService {
  constructor(
    private readonly dbService: DbService
  ) {
  }

  /**
   * Creates a new session
   * @param userId User ID
   * @param strategy Authentication strategy
   * @param refreshToken Refresh token
   * @returns Session ID
   */
  async createSession(
    userId: string,
    strategy: string,
    refreshToken: string,
  ): Promise<string> {
    return await this.dbService.insert("sessions", {
      userId: userId,
      createdAt: new Date().getTime(),
      refreshToken: refreshToken,
      strategy: strategy,
    })
  }

  async getSession(
    sessionId: string,
  ): Promise<Session> {
    return await this.dbService.get("sessions", sessionId)
  }
}
