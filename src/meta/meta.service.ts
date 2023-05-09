import { Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'

const META_FILE_PATH = "/app/shlokas-auth/.container/meta"

@Injectable()
export class MetaService {
  private _meta = ""

  constructor() {
    try {
      this._meta = readFileSync(META_FILE_PATH).toString()
    } catch (e) {
      this._meta = "VERSION=dev"
    }
  }

  getMeta() {
    return this._meta
  }
}
