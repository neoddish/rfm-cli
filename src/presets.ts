import type { RepoManifest } from './models/Maker';

export const PRESET_NAMES = ['mvp', 'js-lib', 'web-tool'] as const;
export type PresetName = typeof PRESET_NAMES[number];

export const PRESETS: Record<PresetName, RepoManifest> = {
  mvp: {
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
  },
  'js-lib': {
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
  },
  'web-tool': {
    typescript: { in: true },
    husky: { in: true, options: { selections: ['pre-commit', 'commit-msg'] } },
    eslint: { in: true },
    prettier: { in: true },
    markdownlint: { in: true },
    react: { in: true },
    webpack: { in: true },
  },
};
