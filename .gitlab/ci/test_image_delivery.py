import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[2]


class Loader(yaml.SafeLoader):
    pass


class Reference(list):
    pass


Loader.add_constructor('!reference', lambda loader, node: Reference(loader.construct_sequence(node)))


def load(path):
    return yaml.load(path.read_text(), Loader=Loader)


def expand(value, config):
    if isinstance(value, Reference):
        target = config
        for key in value:
            target = target[key]
        return expand(target, config)
    if isinstance(value, list):
        return '\n'.join(expand(item, config) for item in value)
    return value


class ImageDeliveryTests(unittest.TestCase):
    def setUp(self):
        self.config = load(ROOT / '.gitlab-ci.yml')
        for name in ['deploy.yml', 'switch-branch.yml', 'dotenv-source.yml', 'quality.yml', 'images.yml']:
            path = ROOT / '.gitlab/ci' / name
            if path.exists():
                self.config.update(load(path))
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.cwd = Path(self.temp.name)
        (self.cwd / '.gitlab/envs').mkdir(parents=True)
        (self.cwd / 'packages/server/resources').mkdir(parents=True)
        (self.cwd / 'bin').mkdir()
        for env in ['integration', 'staging', 'production']:
            (self.cwd / f'.gitlab/envs/.env.{env}').write_text(
                f'PROVIDER=aws\nECR_REPOSITORY=api-caps\nSTACK=api-caps\nNODE_ENV={env}\n'
            )
        for command in ['git', 'docker', 'aws']:
            path = self.cwd / 'bin' / command
            path.write_text(
                f'#!/bin/sh\nprintf "%s\\n" "{command} $*" >> "$COMMAND_LOG"\n'
                f'if [ "$MOCK_FAIL_COMMAND" = "{command}" ]; then exit 1; fi\n'
            )
            path.chmod(0o755)
        date = self.cwd / 'bin/date'
        date.write_text('#!/bin/sh\nprintf "20261029080610\\n"\n')
        date.chmod(0o755)
        self.env = {
            **os.environ,
            'PATH': f'{self.cwd}/bin:{os.environ["PATH"]}',
            'COMMAND_LOG': str(self.cwd / 'commands.log'),
            'WORKFLOW': 'deploy',
            'ENV': 'staging',
            'VERSION': 'feature-checkout',
            'DOCKER_TAG': '',
            'MOCK_FAIL_COMMAND': '',
            'CI_PIPELINE_SOURCE': 'push',
            'CI_MERGE_REQUEST_IID': '4',
            'DOCKER_IMAGE': 'api-caps',
            'DOCKER_REGISTRY': 'registry.example',
            'CI_PIPELINE_ID': '123',
            'CI_COMMIT_SHORT_SHA': 'abcdef01',
            'AWS_REGION': 'eu-west-1',
        }

    def run_prepare(self, **env):
        script = expand(self.config['.caps_image_prepare']['script'], self.config)
        return subprocess.run(
            ['bash', '-eo', 'pipefail', '-c', script],
            cwd=self.cwd, env={**self.env, **env}, capture_output=True, text=True,
        )

    def test_source_build_uses_selected_environment(self):
        result = self.run_prepare()
        self.assertEqual(result.returncode, 0, result.stderr)
        output = (self.cwd / 'image.env').read_text()
        self.assertIn('IMAGE_ENV=staging', output)
        self.assertIn('DOCKER_TAG=feature-checkout-', output)
        self.assertIn('NODE_ENV=staging', output)
        self.assertIn('feature-checkout', (self.cwd / 'commands.log').read_text())
        self.assertTrue((self.cwd / 'packages/server/resources/release.info').read_text().strip())

    def test_release_deployment_builds_selected_source(self):
        result = self.run_prepare(VERSION='v1.2.3')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('DOCKER_TAG=v1.2.3\n', (self.cwd / 'image.env').read_text())
        self.assertIn('tags/v1.2.3', (self.cwd / 'commands.log').read_text())

    def test_no_existing_image_deployment_parameter(self):
        root = load(ROOT / '.gitlab-ci.yml')
        self.assertNotIn('IMAGE_TAG', root['variables'])
        image_config = (ROOT / '.gitlab/ci/images.yml').read_text()
        self.assertNotIn('IMAGE_TAG', image_config)
        self.assertNotIn('IMAGE_REUSE', image_config)

    def test_mr_build_uses_integration_and_does_not_switch_source(self):
        result = self.run_prepare(WORKFLOW='build', ENV='production', DOCKER_TAG='mr-4-123')
        self.assertEqual(result.returncode, 0, result.stderr)
        output = (self.cwd / 'image.env').read_text()
        self.assertIn('IMAGE_ENV=integration', output)
        self.assertIn('NODE_ENV=integration', output)
        self.assertIn('DOCKER_TAG=mr-4-123', output)
        self.assertFalse((self.cwd / 'commands.log').exists())

    def test_invalid_tag_fails_before_external_commands(self):
        result = self.run_prepare(WORKFLOW='build', DOCKER_TAG='bad/tag')
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.cwd / 'commands.log').exists())

    def test_heroku_keeps_original_execution_rules(self):
        job = self.config['deploy:heroku']
        self.assertEqual(job['extends'], '.node_dind')
        self.assertNotIn('needs', job)
        self.assertEqual(job['dependencies'], [])
        self.assertEqual(job['rules'][0]['when'], 'always')

    def test_heroku_writes_release_metadata_before_build(self):
        (self.cwd / '.gitlab/envs/.env.staging').write_text(
            'PROVIDER=heroku\nNODE_ENV=staging\nHEROKU_APP=test-app\nHEROKU_TEAM=test-team\n'
        )
        bunx = self.cwd / 'bin/bunx'
        bunx.write_text('#!/bin/sh\nprintf "%s\\n" "bunx $*" >> "$COMMAND_LOG"\n')
        bunx.chmod(0o755)
        script = expand(self.config['deploy:heroku']['script'], self.config)
        for version, expected in [
            ('feature-checkout', 'feature-checkout-20261029080610'),
            ('v1.2.3', 'v1.2.3'),
        ]:
            with self.subTest(version=version):
                result = subprocess.run(
                    ['bash', '-eo', 'pipefail', '-c', script],
                    cwd=self.cwd, env={**self.env, 'VERSION': version},
                    capture_output=True, text=True,
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(
                    (self.cwd / 'packages/server/resources/release.info').read_text(),
                    expected + '\n',
                )
        commands = (self.cwd / 'commands.log').read_text()
        self.assertIn('docker build . -t registry.heroku.com/test-app/web', commands)
        self.assertIn('--build-arg NODE_ENV=staging', commands)
        self.assertIn('bunx heroku@7.67.2 container:release web --app test-app', commands)
        self.assertNotIn('aws ', commands)
        self.assertNotIn('ecr', commands)

    def test_heroku_skips_aws_environment_without_checkout(self):
        script = expand(self.config['deploy:heroku']['script'], self.config)
        result = subprocess.run(
            ['bash', '-eo', 'pipefail', '-c', script], cwd=self.cwd,
            env=self.env, capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse((self.cwd / 'commands.log').exists())
        self.assertFalse((self.cwd / 'packages/server/resources/release.info').exists())

    def test_heroku_does_not_prepare_an_aws_build(self):
        (self.cwd / '.gitlab/envs/.env.staging').write_text('PROVIDER=heroku\nNODE_ENV=staging\n')
        result = self.run_prepare()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('PROVIDER=heroku', (self.cwd / 'image.env').read_text())
        self.assertFalse((self.cwd / 'commands.log').exists())

    def test_publisher_uses_shared_template(self):
        job = self.config['build:image']
        self.assertEqual(job['extends'], '.docker_tag_and_push.aws')
        self.assertIn('image.env', job['artifacts']['paths'])
        script = expand(job['script'], {**self.config, '.docker_tag_and_push.aws': {'script': 'TEMPLATE_BUILD_PUSH'}})
        self.assertIn('TEMPLATE_BUILD_PUSH', script)
        self.assertNotIn('docker build', script)
        self.assertNotIn('IMAGE_REUSE', script)
        self.assertIn('WORKFLOW', script)
        self.assertIn('latest', script)

    def test_deploy_only_calls_shared_infrastructure_helper(self):
        script = expand(self.config['.deploy-on-aws-with-parameters']['script'], {
            **self.config, '.deploy_docker_image_to_aws': {'script': 'TEMPLATE_INFRA_DEPLOY'},
        })
        self.assertIn('TEMPLATE_INFRA_DEPLOY', script)
        self.assertNotIn('docker build', script)
        self.assertNotIn('docker push', script)
        self.assertNotIn('echo "Token:', script)

    def test_deployment_waits_for_all_image_checks(self):
        needs = self.config['deploy']['needs']
        names = [item if isinstance(item, str) else item['job'] for item in needs]
        for job in ['build:image', 'cm-bot:scan:docker:trivy', 'cm-bot:scan:docker:dockle', 'cm-bot:scan:docker:sbom.aws']:
            self.assertIn(job, names)
        self.assertNotIn('when: always', json.dumps(self.config['deploy']['rules']))
        self.assertEqual(self.config['deploy']['rules'][0].get('when', 'on_success'), 'on_success')

    def test_scanners_consume_published_image(self):
        for name in ['cm-bot:scan:docker:trivy', 'cm-bot:scan:docker:dockle', 'cm-bot:scan:docker:sbom.aws']:
            job = self.config[name]
            needs = job.get('needs', self.config['.caps_image_scan']['needs'])
            self.assertIn({'job': 'build:image', 'artifacts': True}, needs)
            before = expand(job['before_script'], {
                **self.config,
                '.setup_proxy_linux': {'script': ''},
                '.setup_docker_aws.alpine': {'script': ''},
                '.sbom-generation.aws': {'before_script': ''},
            })
            self.assertIn('image.env', before)

    def test_no_local_aws_login_override(self):
        self.assertNotIn('.docker_aws_login', self.config)


if __name__ == '__main__':
    unittest.main()
