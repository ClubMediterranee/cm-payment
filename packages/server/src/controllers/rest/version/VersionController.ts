import { join } from 'node:path';

import { Constant, Controller } from '@tsed/di';
import { Get, object, Returns, string } from '@tsed/schema';
import fs from 'fs-extra';

@Controller('/version')
export class VersionController {
  @Constant('version')
  private version!: string;

  @Constant('rootDir')
  private rootDir!: string;

  @Get('/')
  @(Returns(200)
    .ContentType('application/json')
    .Schema(
      object({
        branch: string().required(),
        version: string().required(),
      }).label('VersionInfo'),
    ))
  async get() {
    return {
      branch: await this.getCurrentBranch(),
      version: this.version,
    };
  }

  protected async getCurrentBranch() {
    const file = join(this.rootDir, 'resources', 'release.info');

    if (fs.existsSync(file)) {
      return (await fs.readFile(file, { encoding: 'utf-8' })).trim();
    }
  }
}
