import { defineConfig } from '@cmflow/cli';

const jiraNotesConfig = {
  jiraHost: 'clubmed.atlassian.net',
  ticketPrefixes: ['GPAY'],
};

const jiraReleasesConfig = {
  jiraHost: 'https://clubmed.atlassian.net',
  projectId: 'GPAY',
  releaseNameTemplate: 'SDK-PAYMENT-v${version}',
  released: false,
  ticketPrefixes: ['GPAY'],
};

export default defineConfig({
  npmPublish: false,
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    { name: 'next-release', prerelease: 'rc' },
    { name: 'develop', prerelease: 'beta' },
  ],
  verifyConditions: [
    '@cmflow/cli/semantic/core/verify-conditions',
    ['semantic-release-jira-notes', jiraNotesConfig],
    ['semantic-release-jira-releases-modern', jiraReleasesConfig],
  ],
  analyzeCommits: ['@semantic-release/commit-analyzer'],
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
    '@cmflow/cli/semantic/core/prepare/commit',
  ],
  publish: ['@cmflow/cli/semantic/core/sync-repository'],
  success: [['semantic-release-jira-releases-modern', jiraReleasesConfig]],
  fail: [],
  writerOpts: {},
});
