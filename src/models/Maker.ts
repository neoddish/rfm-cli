import { TypescriptTool } from '../tools/typescript';
import { ReactTool } from '../tools/react';
import { HuskyTool, HUSK_HOOKS } from '../tools/husky';
import { EslintTool } from '../tools/eslint';
import { PrettierTool } from '../tools/prettier';
import { JestTool } from '../tools/jest';
import { RollupTool } from '../tools/rollup';
import { MarkdownlintTool } from '../tools/markdownlint';
import { File } from './File';
import { TemplateLib } from './TemplateLib';
import { Repo } from './Repo';
import { WebpackTool } from '../tools/webpack';

import type { PackageJsonScript } from './PackageManager';
import type { HuskyHook } from '../tools/husky';

interface FileCast {
  type?: 'file';
  in: boolean;
  options?: { category?: string; [x: string]: any };
}

interface FolderCast {
  type?: 'folder';
  in: boolean;
  path: string;
  children?: (FileCast | FolderCast)[];
}

interface ToolCast {
  type?: 'tool';
  in: boolean;
  options?: { selections?: string[] };
}

interface PackageJsonCast {
  type?: 'package-json';
  scripts?: PackageJsonScript[];
  configs?: { key: string; value: any }[];
}

export interface RepoManifest {
  gitignore?: FileCast;
  readme?: FileCast;
  editorconfig?: FileCast;
  src?: FolderCast;
  typescript?: ToolCast;
  react?: ToolCast;
  husky?: ToolCast;
  eslint?: ToolCast;
  prettier?: ToolCast;
  markdownlint?: ToolCast;
  jest?: ToolCast;
  rollup?: ToolCast;
  webpack?: ToolCast;
  packageJson?: PackageJsonCast;
}

export interface MakerParams {
  moduleRoot: string;
}

export class Maker {
  /** location of the rfm-cli lib */
  private moduleRoot: string;

  /** where template paths stored */
  private templateLib: TemplateLib;

  constructor(params: MakerParams) {
    if (!params?.moduleRoot) {
      throw new Error('MUST assign module root path for Maker!');
    }

    this.moduleRoot = params.moduleRoot;

    this.templateLib = new TemplateLib(this.moduleRoot);
  }

  async assemble(projectName: string, manifest: RepoManifest): Promise<Repo> {
    const repo = new Repo(projectName, this.templateLib);
    await repo.init();

    /* =================== casts by default =================== */

    // .gitignore
    if (!(manifest.gitignore?.in === false)) {
      // default gitignore category = PRO
      let category = manifest.gitignore?.options?.category || 'PRO';
      if (!Object.keys(TemplateLib.TOKEN.GITIGNORE).includes(category)) {
        console.warn(`gitignore DO NOT have category ${category}, changed to 'PRO' by default.`);
        category = 'PRO';
      }

      await this.registerTemplateFile(
        '.gitignore',
        this.templateLib.absPathByToken((TemplateLib.TOKEN.GITIGNORE as any)[category]),
        repo,
        './'
      );
    }

    // README.md
    if (!(manifest.readme?.in === false)) {
      await this.registerTemplateFile(
        'README.md',
        this.templateLib.absPathByToken(TemplateLib.TOKEN.README_MD.DEFAULT),
        repo,
        './'
      );
    }

    // .editorconfig
    if (!(manifest.editorconfig?.in === false)) {
      await this.registerTemplateFile(
        '.editorconfig',
        this.templateLib.absPathByToken(TemplateLib.TOKEN.EDITORCONFIG.DEFAULT),
        repo,
        './'
      );
    }

    // src/
    if (!(manifest.src?.in === false) && !manifest.react?.in) {
      await repo.addFile(
        './src',
        new File(
          'index.ts',
          `export const greeting = 'hello world!';
`
        )
      );
    }

    /* =================== casts by optional =================== */

    // tools

    // typescript
    if (manifest.typescript?.in) {
      const typescriptTool = await TypescriptTool.create(this.templateLib);
      await typescriptTool.dispatch(repo);
    }

    // react
    if (manifest.react?.in) {
      const reactTool = await ReactTool.create(this.templateLib, { projectName });
      await reactTool.dispatch(repo);
    }

    // husky
    if (manifest.husky?.in) {
      const selections = manifest.husky.options?.selections;
      const hooks: HuskyHook[] = [];
      ((selections as HuskyHook[]) || []).forEach((hook) => {
        if (HUSK_HOOKS.includes(hook as any)) {
          hooks.push(hook);
        } else {
          console.warn(`Husky hook '${hook}' is not available.`);
        }
      });

      if (hooks.length) {
        const huskyTool = await HuskyTool.create({ hooks });
        await huskyTool.dispatch(repo);
      }
    }

    // eslint
    if (manifest.eslint?.in) {
      const eslintTool = await EslintTool.create(this.templateLib);
      await eslintTool.dispatch(repo);
    }

    // prettier
    if (manifest.prettier?.in) {
      const prettierTool = await PrettierTool.create(this.templateLib);
      await prettierTool.dispatch(repo);
    }

    // markdownlint
    if (manifest.markdownlint?.in) {
      const markdownlintTool = await MarkdownlintTool.create(this.templateLib);
      await markdownlintTool.dispatch(repo);
    }

    // jest
    if (manifest.jest?.in) {
      const jestTool = await JestTool.create(this.templateLib);
      await jestTool.dispatch(repo);
    }

    // rollup
    // todo: refactor tool override relations
    if (manifest.rollup?.in && !manifest.webpack?.in) {
      const rollupTool = await RollupTool.create(this.templateLib, { projectName });
      await rollupTool.dispatch(repo);
    }

    // webpack
    if (manifest.webpack?.in) {
      const webpackTool = await WebpackTool.create(this.templateLib, { projectName });
      await webpackTool.dispatch(repo);
    }

    /* =================== package.json =================== */

    // todo manifest: if lib or esm or dist

    // package.json scripts

    const scripts = manifest.packageJson?.scripts;
    if (scripts?.length) {
      scripts.forEach((script) => {
        const { scriptName, value, mode } = script;
        repo.packageManager.updateScript(scriptName, value, mode);
      });
    }

    // package.json configs
    const configs = manifest.packageJson?.configs;
    if (configs?.length) {
      configs.forEach((config) => {
        const { key, value } = config;
        repo.packageManager.overwriteJson(key, value);
      });
    }

    // result Repo

    return repo;
  }

  async registerTemplateFile(filename: string, template: string, repo: Repo, dir: string) {
    const file = await File.newFileBySource(filename, template);
    repo.addFile(dir, file);
  }

  /**
   * get location of the rfm-cli lib.
   * Call this at the exe file or the nearest file.
   *
   * @param loDirname
   * @returns
   */
  static getModuleRoot(loDirname: string) {
    let moduleRootPath = loDirname;
    if (loDirname.endsWith('/lib/src')) {
      moduleRootPath = loDirname.replace(/\/lib\/src$/, '');
    } else if (loDirname.endsWith('/lib')) {
      moduleRootPath = loDirname.replace(/\/lib$/, '');
    }

    return moduleRootPath;
  }
}
