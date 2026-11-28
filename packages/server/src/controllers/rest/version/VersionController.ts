import { join } from 'node:path';

import { Constant, Controller } from '@tsed/di';
import { Get, object, Returns, string } from '@tsed/schema';
import fs from 'fs-extra';

import { APP_ENV_LEVEL } from '../../../config/utils/index.js';

@Controller('/version')
export class VersionController {
  @Constant('version')
  private version!: string;

  @Constant('rootDir')
  private rootDir!: string;

  /** integration / staging / production on the deployed servers (`APP_ENV_LEVEL`), `local` otherwise. */
  @Constant('APP_ENV_LEVEL', APP_ENV_LEVEL)
  private envLevel!: string;

  @Get('/')
  @(Returns(200)
    .ContentType('application/json')
    .Schema(
      object({
        branch: string().required(),
        version: string().required(),
        env_level: string().required().description('integration, staging, production or local'),
      }).label('VersionInfo'),
    ))
  async get() {
    return {
      branch: await this.getCurrentBranch(),
      version: this.version,
      env_level: this.envLevel,
    };
  }

  protected async getCurrentBranch() {
    const file = join(this.rootDir, 'resources', 'release.info');

    if (fs.existsSync(file)) {
      return (await fs.readFile(file, { encoding: 'utf-8' })).trim();
    }
  }
}
