import path from 'path';
import { spawn } from 'child_process';

import { program } from 'commander';

import { Maker, RepoManifest } from './models/Maker';
import { PRESETS } from './presets';

interface Options {
  target: string;
  preset: string;
  manifest: string;
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
    .option('-p, --preset <preset>', 'create preset repo', 'mvp')
    .option('-m, --manifest <chars>', 'manually set manifest', '')
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
  const { target: projectRoot, preset, manifest: cusManifest, exec: execute } = cliOptions;

  const projectName = path.basename(projectRoot);
  let cusManifestOptions = [...cusManifest]
    .map((char) => {
      switch (char) {
        case 'w':
          return 'webpack';

        case 'r':
          return 'rollup';

        case 'R':
          return 'react';

        default:
          console.warn(`No sense for manifest chart ${char}.`);
          return 'BAD';
      }
    })
    .filter((e) => e !== 'BAD');

  // overrides
  // webpack will override default rollup
  if (cusManifestOptions.includes('webpack')) {
    cusManifestOptions = cusManifestOptions.filter((tool) => tool !== 'rollup');
  }

  const defaultManifest: RepoManifest = (PRESETS as any)[preset] || PRESETS.mvp;
  const manifest: RepoManifest = { ...defaultManifest };
  cusManifestOptions.forEach((key) => {
    (manifest as any)[key] = { in: true };
  });

  const maker = new Maker({ moduleRoot: Maker.getModuleRoot(__dirname) });
  const repo = await maker.assemble(projectName, manifest);
  repo.output(projectRoot);

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
