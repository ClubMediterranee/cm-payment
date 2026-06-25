import { writeFile } from 'node:fs/promises';

export async function success(pluginConfig, context) {
  const version = context?.nextRelease?.version;

  if (!version) {
    return;
  }

  await writeFile('release.env', `RELEASE_CREATED=true\nSDK_VERSION=${version}\n`, 'utf8');
}
