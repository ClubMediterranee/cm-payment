import { defineConfig } from '@cmflow/cli';

const jiraNotesConfig = {
  jiraHost: 'clubmed.atlassian.net',
  ticketPrefixes: ['GPAY'],
};

// Use the same configuration for releases plugin unless specific options are needed
const jiraReleasesConfig = { ...jiraNotesConfig };

export default defineConfig({
  npmPublish: false,
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'master',
    { name: 'next-release', prerelease: 'rc' },
    { name: 'develop', prerelease: 'beta' },
  ],
  verifyConditions: [
    '@cmflow/cli/semantic/core/verify-conditions',
    ['semantic-release-jira-notes', jiraNotesConfig],
    ['semantic-release-jira-releases-modern', jiraReleasesConfig],
  ],
  analyzeCommits: ['@cmflow/cli/semantic/core/analyze-commits'],
  verifyRelease: ['@cmflow/cli/semantic/core/verify-release'],
  generateNotes: [['semantic-release-jira-notes', jiraNotesConfig]],
  prepare: [
    '@cmflow/cli/semantic/core/prepare/bump-version',
    [
      '@cmflow/cli/semantic/core/prepare/release-info',
      {
        path: './resources/release.info',
      },
    ],
    [
      '@cmflow/cli/semantic/core/run', // add this task to trigger build npm task
      {
        command: 'build',
      },
    ],
    [
      '@cmflow/cli/semantic/core/conditional', // add this task to trigger build npm task
      {
        // when: (context) => context.branch.type === "release" //  default condition to run the task
        run: ['@cmflow/cli/semantic/core/prepare/commit'],
      },
    ],
  ],
  publish: ['@cmflow/cli/semantic/core/sync-repository'],
  success: [['semantic-release-jira-releases-modern', jiraReleasesConfig]],
  fail: [],
  writerOpts: {},
  // plugins: [
  //   '@semantic-release/commit-analyzer',
  //   [
  //     '@semantic-release/npm',
  //     {
  //       npmPublish: false,
  //     },
  //   ],
  //   [
  //     '@semantic-release/release-notes-generator',
  //     {
  //       // Preserving custom option from YAML; if unsupported by the plugin, it will be ignored.
  //       commit: '-/commit',
  //     },
  //   ],
  //   [
  //     '@semantic-release/changelog',
  //     {
  //       changelogFile: 'CHANGELOG.md',
  //       changelogTitle: '# ClubMed Payment SDK changelog',
  //     },
  //   ],
  //   [
  //     '@semantic-release/exec',
  //     {
  //       verifyReleaseCmd: 'echo "${nextRelease.version}" > /tmp/next_release_version',
  //     },
  //   ],
  //   [
  //     '@semantic-release/git',
  //     {
  //       assets: [
  //         'CHANGELOG.md',
  //         'package.json',
  //         './packages/sdk/package.json',
  //         './packages/sandbox/package.json',
  //         'pnpm-lock.yaml',
  //         'vitest.config.ts',
  //       ],
  //       message: 'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
  //     },
  //   ],
  //   [
  //     '@saithodev/semantic-release-backmerge',
  //     {
  //       clearWorkspace: true,
  //       restoreWorkspace: true,
  //       backmergeBranches: [{ from: 'main', to: 'develop' }],
  //     },
  //   ],
  // ],
});
