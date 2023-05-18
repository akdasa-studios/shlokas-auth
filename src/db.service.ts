import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { default as nano, ServerScope } from 'nano'

@Injectable()
export class DbService {
  private readonly nano: ServerScope
  private readonly logger = new Logger(DbService.name)

  constructor(
    private readonly configService: ConfigService
  ) {
    this.nano = nano(this.configService.get('AUTH_DB_CONNECTION'))
  }

  async isCollectionExists(
    name: string,
  ): Promise<boolean> {
    try {
      await this.nano.db.get(name)
      this.logger.debug(`Collection ${name} exists`)
      return true
    } catch {
      this.logger.debug(`Collection ${name} does not exist`)
      return false
    }
  }

  /**
   * Create database for user
   * @param {object} nano Nano object
   * @param {string} name User ID
   * @returns {string} Database name
   */
  async createCollection(
    name: string,
  ) {
    await this.nano.db.create(name)
  }

  async setPermissions(
    collection: string,
    userId: string,
  ) {
    const currentPermissions = await this.nano.request({
      db: collection, method: 'get', path: '_security'
    })
    console.log("currentP", currentPermissions)
    const currentUses = currentPermissions.members.names || []
    const newUsers = new Set(currentUses)
    newUsers.add(userId)

    await this.nano.request({
      db: collection, method: 'put', path: '_security', body:
      {
        members: { names: Array.from(newUsers), roles: ['_admin'] },
        admins: { names: [], roles: ['_admin'] },
      }
    })
  }

  async setConfig(
    section: string,
    name: string,
    value: string,
  ) {
    // save to couchDb
    const url = new URL(this.configService.get('AUTH_DB_CONNECTION'))
    const credentials = btoa(`${url.username}:${url.password}`)

    await fetch(`${url.origin}/_node/nonode@nohost/_config/${section}/${name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Basic ${credentials}`
      },
      body: value,
    })
  }

  async insert(
    collection: string,
    document: any,
  ): Promise<string> {
    const doc = await this.nano.use(collection).insert(document)
    if (doc.ok && doc.id) {
      return doc.id
    } else {
      throw new Error("Can not insert document")
    }
  }

  async get(
    collection: string,
    id: string,
  ): Promise<any> {
    this.logger.debug(`Getting document ${id} from ${collection}`)
    const doc = await this.nano.use(collection).get(id)
    return doc
  }
}
