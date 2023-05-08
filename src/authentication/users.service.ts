import { Injectable, Logger } from '@nestjs/common'
import { DbService } from '../db.service'
import { default as getUuidByString } from 'uuid-by-string'


@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  /**
   * Initializes the new instance of the UsersService class
   * @param dbService Database service
   */
  constructor(
    private readonly dbService: DbService
  ) {
  }

  /**
   * Checks if a user exists
   * @param email Email address of the user
   * @returns True if the user exists, otherwise false
   */
  async isUserExists(email: string): Promise<boolean> {
    const result = await this.dbService.isCollectionExists(
      this.getGetUserCollectionName(email)
    )
    this.logger.debug(`User ${email} exists: ${result}`)
    return result
  }

  /**
   * Creates a new user
   * @param email Email address of the user
   * @param userId User ID of the user
   */
  async createUser(
    email: string,
    userId: string,
  ): Promise<void> {
    if (!email) { throw new Error('Email is required') }

    const collectionName = this.getGetUserCollectionName(email)

    await this.dbService.createCollection(collectionName)
    await this.dbService.setPermissions(collectionName, userId)

    await this.dbService.insert("users", {
      email: email.toLowerCase(),
      userId: userId,
    })
  }

  public getGetUserCollectionName(email: string): string {
    const dbUserId = getUuidByString(email.toLowerCase())
    const collectionName = `user_${dbUserId}`
    return collectionName
  }
}
