import path from 'path';
import { spawn } from 'child_process';

import { program } from 'commander';

import { Maker } from './models/Maker';

import type { RepoManifest } from './models/Maker';

interface Options {
  target: string;
  exec: boolean;
}

function parseOptions(): Options {
  function parseTarget(value: string) {
    if (value.startsWith('/')) {
      return value;
    }
    return path.resolve(process.cwd(), value);
  }

  program
    .option('-t, --target <path>', 'path to create project', parseTarget)
    .option('-e, --exec', 'execute scripts after project created', false);

  program.parse();

  const options: Options = program.opts();

  const { target } = options;

  if (!target) {
    throw new Error('MUST define a target path for new project by -t or --target argument.');
  }

  return options;
}

export async function main() {
  const cliOptions = parseOptions();
  const { target: projectRoot, exec: execute } = cliOptions;

  const maker = new Maker({ moduleRoot: Maker.getModuleRoot(__dirname) });

  const mvpRepoManifest: RepoManifest = {
    typescript: { in: true },
    husky: { in: true, options: { selections: ['pre-commit', 'commit-msg'] } },
    eslint: { in: true },
    prettier: { in: true },
    markdownlint: { in: true },
    jest: { in: true },
    rollup: { in: true },
    packageJson: {
      scripts: [
        { scriptName: 'build', value: 'run-p build:*', mode: 'append' },
        { scriptName: 'clean', value: 'rimraf lib esm dist', mode: 'append' },
      ],
      configs: [
        { key: 'main', value: 'lib/index.js' },
        { key: 'module', value: 'esm/index.js' },
        { key: 'unpkg', value: 'dist/index.js' },
        { key: 'files', value: ['src', 'esm', 'lib'] },
      ],
    },
  };

  const repo = await maker.assemble(mvpRepoManifest);

  repo.output(projectRoot);

  // await maker.mvpRepo();

  // await maker.output(projectRoot);

  if (execute) {
    const postcreateCommands = [
      `cd ${projectRoot}`,
      'git init',
      'npm install',
      'npm run lint-fix',
      'npm run format',
      'npm run test',
      'npm run build',
    ].join(' && ');

    const result = spawn(postcreateCommands, { stdio: 'inherit', shell: true });

    result.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }
}
