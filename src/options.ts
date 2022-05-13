import path from 'path';

import { program } from 'commander';
import inquirer from 'inquirer';
import lodashSet from 'lodash/set';

import { PRESETS, PRESET_NAMES } from './presets';
import { pathMakeable } from './utils';

import type { RepoManifest } from './models/Maker';
import type { PresetName } from './presets';

const manifestFlags: Record<string, { display: string; toolname: string }> = {
  w: { display: 'webpack', toolname: 'webpack' },
  r: { display: 'rollup', toolname: 'rollup' },
  R: { display: 'React', toolname: 'react' },
};

interface Options {
  skip: boolean;
  target: string;
  preset: PresetName;
  manifest: string;
  execute: boolean;
}

const defaultOptions: Options = {
  skip: false,
  target: process.cwd(),
  preset: 'mvp',
  manifest: '',
  execute: false,
};

export interface CliDemand {
  target: string;
  manifest: RepoManifest;
  execute: boolean;
}

async function checkTarget(options: Options): Promise<{ target: string }> {
  // default
  let { target } = defaultOptions;

  const valid = async (input: any) => {
    const result = await pathMakeable(input);
    return result;
  };

  let isValid = false;

  if (options.target) {
    isValid = await valid(options.target);

    if (isValid) {
      // by flags
      target = options.target;
    } else {
      console.warn(`Path ${options.target} is NOT valid target path.`);
    }
  }

  if (!isValid) {
    // skip - by default
    if (options.skip) {
      target = defaultOptions.target;
      console.log('Create repo at current directory...');
    } else {
      // by asking
      const questions = [];
      questions.push({
        type: 'input',
        name: 'target',
        message: 'Please specify the path to create the project:',
        validate(input: any) {
          return valid(input);
        },
      });
      const { target: ans } = await inquirer.prompt(questions);
      target = ans;
    }
  }

  // parse and return
  target = path.resolve(target);
  return { target };
}

async function checkPreset(options: Options): Promise<{ preset: RepoManifest }> {
  // default
  let preset: RepoManifest = PRESETS[defaultOptions.preset];

  const valid = (input: any) => {
    return PRESET_NAMES.includes(input);
  };

  let isValid = false;

  if (options.preset) {
    isValid = valid(options.preset);

    if (isValid) {
      // by flags
      preset = PRESETS[options.preset];
    } else {
      console.warn(`${options.preset} is NOT in valid presets: ${PRESET_NAMES}`);
    }
  }

  if (!isValid) {
    // skip - by default
    if (options.skip) {
      preset = PRESETS[defaultOptions.preset];
      console.log(`initialize repo with default preset: ${defaultOptions.preset}`);
    } else {
      // by asking
      const questions = [];
      questions.push({
        type: 'list',
        name: 'preset',
        message: 'Please choose a preset:',
        choices: ['none', 'mvp', 'js-lib', 'web-tool'],
        default: defaultOptions.preset,
        validate(input: any) {
          return input === 'none' || valid(input);
        },
      });
      const { preset: ans } = await inquirer.prompt(questions);
      preset = ans === 'none' ? {} : PRESETS[ans as PresetName];
    }
  }

  // parse and return
  return { preset };
}

async function checkManifest(options: Options, preset: RepoManifest): Promise<{ manifest: RepoManifest }> {
  // default
  const manifest: RepoManifest = preset;

  let buildBy: 'chars' | 'askme' | 'no' = 'no';
  const cusChars: string[] = [];
  let cusAskmeAnswers: any = {};

  let isValid = false;

  interface ValidResult {
    pass: boolean;
    error?: string;
    parsed: string[];
  }
  const valid = (input: string): ValidResult => {
    const result: ValidResult = {
      pass: false,
      parsed: [],
    };

    const chars = [...input];
    const valids: string[] = [];
    const invalids: string[] = [];
    chars.forEach((char) => {
      if (Object.keys(manifestFlags).includes(char)) {
        valids.push(char);
      } else {
        invalids.push(char);
      }
    });
    if (!valids.length) {
      console.warn('No manifest char.');
    }
    result.parsed = valids.map((char) => manifestFlags[char].toolname);

    if (invalids.length) {
      result.pass = false;
      result.error =
        `These chars are invalid: ${Array.from(new Set(invalids))}` +
        '\n' +
        'Valid chars:' +
        `\n${Object.keys(manifestFlags)
          .map((key) => `${key} - ${manifestFlags[key].display}`)
          .join('\n')}`;
    } else {
      result.pass = true;
    }

    return result;
  };

  if (options.manifest) {
    const { pass, error, parsed } = valid(options.manifest);
    isValid = pass;

    if (isValid) {
      // by flags
      buildBy = 'chars';
      cusChars.push(...parsed);
    } else {
      console.warn(error);
    }
  }

  if (!isValid) {
    // skip - by default
    if (options.skip) {
      console.log('Custom manifest not required.');
    } else {
      // by asking
      const questions = [];

      // mode
      questions.push({
        type: 'list',
        name: 'manifest.use',
        message: 'Do you need to customise with manifest?',
        choices: ['no', 'chars', 'askme'],
        default: 'no',
      });

      // manifest with chars
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'chars';
        },
        type: 'input',
        name: 'manifest.chars',
        message: 'Enter manifest flag chars:',
        validate(answer: any) {
          const { pass, error } = valid(answer);
          return pass || error;
        },
      });

      // manifest by asking one by one

      // .gitignore
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme';
        },
        type: 'list',
        name: 'manifest.askme.gitignore',
        message: 'Add .gitignore?',
        choices: ['no', 'LITE', 'PRO'],
        default: 'PRO',
      });

      // README.md
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme';
        },
        type: 'list',
        name: 'manifest.askme.readme',
        message: 'Add README.md?',
        choices: ['yes', 'no'],
        default: 'yes',
      });

      // .editorconfig
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme';
        },
        type: 'list',
        name: 'manifest.askme.editorconfig',
        message: 'Add editorconfig?',
        choices: ['yes', 'no'],
        default: 'yes',
      });

      // js or ts
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme';
        },
        type: 'list',
        name: 'manifest.askme.language',
        message: 'Choose language:',
        choices: ['JavaScript', 'TypeScript'],
        default: 'JavaScript',
      });

      // react
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme';
        },
        type: 'list',
        name: 'manifest.askme.react',
        message: 'Add React?',
        choices: ['no', 'yes'],
        default: 'no',
      });

      // husky
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme';
        },
        type: 'list',
        name: 'manifest.askme.useHusky',
        message: 'Add husky?',
        choices: ['no', 'yes'],
        default: 'no',
      });
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme' && answers.manifest.askme.useHusky === 'yes';
        },
        type: 'checkbox',
        name: 'manifest.askme.husky',
        message: 'Check husky hooks:',
        choices: ['pre-commit', 'commit-msg'],
        default: ['pre-commit', 'commit-msg'],
      });

      // linting
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme';
        },
        type: 'list',
        name: 'manifest.askme.useLint',
        message: 'Linting your repo?',
        choices: ['yes', 'no'],
        default: 'yes',
      });
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme' && answers.manifest.askme.useLint === 'yes';
        },
        type: 'checkbox',
        name: 'manifest.askme.lint',
        message: 'Check lint tools:',
        choices: ['eslint', 'prettier', 'markdownlint'],
        default: ['eslint', 'prettier', 'markdownlint'],
      });

      // testing - jest
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme';
        },
        type: 'list',
        name: 'manifest.askme.jest',
        message: 'Add jest?',
        choices: ['no', 'yes'],
        default: 'no',
      });

      // building
      questions.push({
        when(answers: any) {
          return answers.manifest.use === 'askme';
        },
        type: 'list',
        name: 'manifest.askme.build',
        message: 'How to build your project?',
        choices: ['rollup', 'webpack', 'no'],
        default: 'rollup',
      });

      const { manifest: ans } = await inquirer.prompt(questions);

      // parse all results

      if (ans.use === 'chars' && ans.chars) {
        const { parsed } = valid(ans.chars);
        buildBy = 'chars';
        cusChars.push(...parsed);
      }

      if (ans.use === 'askme' && ans.askme) {
        buildBy = 'askme';
        cusAskmeAnswers = ans.askme;
      }
    }
  }

  if (buildBy === 'chars') {
    cusChars.forEach((toolname) => {
      lodashSet(manifest, `${toolname}.in`, true);
    });
  }

  if (buildBy === 'askme') {
    // .gitignore
    if (cusAskmeAnswers.gitignore) {
      if (cusAskmeAnswers.gitignore === 'no') {
        lodashSet(manifest, 'gitignore.in', false);
      } else {
        lodashSet(manifest, 'gitignore.in', true);
        lodashSet(manifest, 'gitignore.options.category', cusAskmeAnswers.gitignore);
      }
    }
    // readme
    if (cusAskmeAnswers.readme) {
      lodashSet(manifest, 'readme.in', cusAskmeAnswers.readme === 'yes');
    }
    // editorconfig
    if (cusAskmeAnswers.editorconfig) {
      lodashSet(manifest, 'editorconfig.in', cusAskmeAnswers.editorconfig === 'yes');
    }
    // typescript
    if (cusAskmeAnswers.language) {
      lodashSet(manifest, 'typescript.in', cusAskmeAnswers.language === 'TypeScript');
    }
    // react
    if (cusAskmeAnswers.react) {
      lodashSet(manifest, 'react.in', cusAskmeAnswers.react === 'yes');
    }
    // husky
    if (cusAskmeAnswers.useHusky) {
      lodashSet(manifest, 'husky.in', cusAskmeAnswers.useHusky === 'yes');
      if (cusAskmeAnswers.useHusky === 'yes' && cusAskmeAnswers.husky) {
        lodashSet(manifest, 'husky.options.selections', cusAskmeAnswers.husky);
      }
    }
    // eslint
    if (cusAskmeAnswers.useLint) {
      lodashSet(manifest, 'eslint.in', cusAskmeAnswers.useLint === 'yes' && cusAskmeAnswers.lint?.includes('eslint'));
    }
    // prettier
    if (cusAskmeAnswers.useLint) {
      lodashSet(
        manifest,
        'prettier.in',
        cusAskmeAnswers.useLint === 'yes' && cusAskmeAnswers.lint?.includes('prettier')
      );
    }
    // markdownlint
    if (cusAskmeAnswers.useLint) {
      lodashSet(
        manifest,
        'markdownlint.in',
        cusAskmeAnswers.useLint === 'yes' && cusAskmeAnswers.lint?.includes('markdownlint')
      );
    }
    // jest
    if (cusAskmeAnswers.jest) {
      lodashSet(manifest, 'jest.in', cusAskmeAnswers.jest === 'yes');
    }
    // rollup
    if (cusAskmeAnswers.build) {
      lodashSet(manifest, 'rollup.in', cusAskmeAnswers.build === 'rollup');
    }
    // webpack
    if (cusAskmeAnswers.build) {
      lodashSet(manifest, 'webpack.in', cusAskmeAnswers.build === 'webpack');
    }
  }

  return { manifest };
}

async function checkExecute(options: Options): Promise<{ execute: boolean }> {
  // default
  let { execute } = defaultOptions;

  if (options.execute) {
    // by flags
    execute = options.execute;
  } else {
    // skip - by default -- pass
    // by asking

    const questions = [];
    questions.push({
      type: 'list',
      name: 'execute',
      message: 'Would you like to execute init scripts after repo created?',
      choices: ['no', 'yes'],
      default: 'no',
    });
    const { execute: ans } = await inquirer.prompt(questions);
    execute = ans === 'yes';
  }

  // parse and return
  return { execute };
}

/**
 * Parse cli args as rfm options.
 */
export async function parseOptions(): Promise<CliDemand> {
  const cliOptions: CliDemand = {
    target: defaultOptions.target,
    manifest: PRESETS[defaultOptions.preset],
    execute: defaultOptions.execute,
  };

  program
    .option('-s, --skip', 'skip prompts and use defaults')
    .option('-t, --target <path>', 'path to create project')
    .option('-p, --preset <preset>', 'create preset repo')
    .option('-m, --manifest <chars>', 'manually set manifest')
    .option('-e, --execute', 'execute scripts after project created');

  program.parse();

  const options: Options = program.opts();

  // target
  const { target } = await checkTarget(options);
  cliOptions.target = target;

  // preset
  const { preset } = await checkPreset(options);
  cliOptions.manifest = preset;
  // manifest
  const { manifest } = await checkManifest(options, preset);
  cliOptions.manifest = manifest;

  // execute
  const { execute } = await checkExecute(options);
  cliOptions.execute = execute;

  return cliOptions;
}
