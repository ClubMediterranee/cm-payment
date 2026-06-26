import { writeFile } from 'node:fs/promises';

export async function success(pluginConfig, context) {
  const version = context?.nextRelease?.version;

  if (!version) {
    return;
  }

  const prereleaseIdentifier = version.match(/-(.+?)\./)?.[1];
  const distTag = prereleaseIdentifier || 'latest';

  await writeFile(
    'release.env',
    `RELEASE_CREATED=true\nSDK_VERSION=${version}\nNPM_DIST_TAG=${distTag}\n`,
    'utf8',
  );
}
