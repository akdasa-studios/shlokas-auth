import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { readFileSync } from "fs"
import jwkToPem from "jwk-to-pem"
import { DbService } from "../db.service"


@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name)
  private readonly applePublikKeysUrl = "https://appleid.apple.com/auth/keys"

  constructor(private readonly dbService: DbService) {
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateApplePublicKeys() {
    this.logger.debug('Updating Apple public keys')
    const response = await fetch(this.applePublikKeysUrl)
    const keys = (await response.json()).keys

    for (const key of keys) {
      const pem = jwkToPem(key)
      const keyId = key.kty.toLowerCase() + ":" + key.kid
      this.dbService.setConfig(
        "jwt_keys", keyId, `"${pem.replaceAll('\n', '\\\\n')}"`
      )
    }
  }

  @Cron(CronExpression.EVERY_YEAR)
  async updateLocalKeys() {
    this.logger.debug('Updating local public keys')
    const publicKey: any = readFileSync(".data/email.auth.strategy.key.pub").toString()
    this.dbService.setConfig(
      "jwt_keys", "shlokas", `"${publicKey.replaceAll('\n', '\\\\n')}"`
    )
  }
}