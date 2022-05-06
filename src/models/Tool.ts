import { File } from './File';
import { Repo } from './Repo';

import type { PackageJsonScript } from './PackageManager';

export interface ToolOptions {
  deps?: { name: string; version?: string }[];
  devDeps?: { name: string; version?: string }[];
  packageJsonConfig?: any;
  packageJsonScripts?: PackageJsonScript[];
  configFiles?: { file: File; dir?: string }[];
}

export class Tool {
  private name: string;

  private deps?: { name: string; version?: string }[];

  private devDeps?: { name: string; version?: string }[];

  private packageJsonConfig?: any;

  private configFiles?: { file: File; dir?: string }[];

  private packageJsonScripts?: PackageJsonScript[];

  constructor(name: string) {
    this.name = name;
  }

  init(options: ToolOptions) {
    // defaults
    this.deps = options.deps || [];
    this.devDeps = options.devDeps || [];
    this.packageJsonConfig = options.packageJsonConfig;
    this.configFiles = options.configFiles;
    this.packageJsonScripts = options.packageJsonScripts;
  }

  async dispatch(repo: Repo) {
    // deps
    if (this.deps && this.deps.length) {
      this.deps.forEach((dep) => {
        const { name, version } = dep;
        repo.packageManager.addDep(name, version || Tool.DEP_VERSIONS[name] || 'latest');
      });
    }

    // devDeps
    if (this.devDeps && this.devDeps.length) {
      this.devDeps.forEach((devDep) => {
        const { name, version } = devDep;
        repo.packageManager.addDevDep(name, version || Tool.DEP_VERSIONS[name] || 'latest');
      });
    }

    // package.json cfgs
    if (this.packageJsonConfig) {
      Object.keys(this.packageJsonConfig).forEach((key) => {
        repo.packageManager.addConfig(key, this.packageJsonConfig[key]);
      });
    }

    // package.json scripts
    if (this.packageJsonScripts && this.packageJsonScripts.length) {
      this.packageJsonScripts.forEach(({ scriptName, value, mode }) => {
        repo.packageManager.updateScript(scriptName, value, mode);
      });
    }

    // config file
    if (this.configFiles && this.configFiles.length) {
      await Promise.all(
        this.configFiles.map(({ file, dir }) => {
          async function add() {
            await repo.addFile(dir || './', file);
          }
          return add();
        })
      );
    }
  }

  static DEP_VERSIONS: Record<string, string> = {
    '@babel/plugin-proposal-class-properties': '^7.16.7',
    '@babel/plugin-proposal-object-rest-spread': '^7.17.3',
    '@babel/plugin-transform-runtime': '^7.17.0',
    '@babel/preset-env': '^7.16.11',
    '@babel/preset-react': '^7.16.7',
    '@babel/preset-typescript': '^7.16.7',
    '@commitlint/cli': '^16.2.3',
    '@commitlint/config-conventional': '^16.2.1',
    '@types/jest': '^27.4.1',
    '@types/react': '^17.0.43',
    '@types/react-dom': '^17.0.14',
    '@typescript-eslint/eslint-plugin': '^5.17.0',
    '@typescript-eslint/parser': '^5.17.0',
    'babel-loader': '^8.2.4',
    'babel-plugin-import': '^1.13.3',
    'css-loader': '^6.7.1',
    eslint: '^8.12.0',
    'eslint-config-airbnb': '^19.0.4',
    'eslint-config-prettier': '^8.5.0',
    'eslint-import-resolver-typescript': '^2.7.0',
    'eslint-plugin-import': '^2.25.4',
    'eslint-plugin-prettier': '^4.0.0',
    'eslint-plugin-react': '^7.29.4',
    'file-loader': '^6.2.0',
    'gh-pages': '^3.2.3',
    husky: '^7.0.4',
    jest: '^27.5.1',
    less: '^4.1.2',
    'less-loader': '^10.2.0',
    'lint-staged': '^12.3.7',
    'monaco-editor-webpack-plugin': '^7.0.1',
    prettier: '^2.6.1',
    'style-loader': '^3.3.1',
    'ts-jest': '^27.1.4',
    typescript: '^4.6.3',
    webpack: '^5.70.0',
    'webpack-cli': '^4.9.2',
    'webpack-dev-server': '^4.7.4',
    '@rollup/plugin-commonjs': '^20.0.0',
    '@rollup/plugin-node-resolve': '^13.0.4',
    '@rollup/plugin-typescript': '^8.2.5',
    rollup: '^2.56.2',
    'rollup-plugin-terser': '^7.0.2',
    'npm-run-all': '^4.1.5',
    'limit-size': '^0.1.4',
    rimraf: '^3.0.2',
  };
}
