import { TemplateLib } from '../models/TemplateLib';
import { Tool } from '../models/Tool';
import { File } from '../models/File';

import type { ToolOptions } from '../models/Tool';
import type { PackageJsonScript } from '../models/PackageManager';

export interface RollupCreateOptions {
  projectName: string;
}

export class RollupTool extends Tool {
  static toolName: string = 'rollup';

  constructor() {
    super(RollupTool.toolName);
  }

  static async create(templateLib: TemplateLib, options: RollupCreateOptions) {
    const scripts: PackageJsonScript[] = [
      // "build:umd": "rimraf ./dist && rollup -c && npm run size",
      {
        scriptName: 'build:umd',
        value: 'rimraf ./dist && rollup -c && npm run size',
        mode: 'replace',
      },
      // "size": "limit-size",
      {
        scriptName: 'size',
        value: 'limit-size',
        mode: 'append',
      },
    ];

    // if limit-size
    // todo set limit n kb
    const sizeConfig = {
      'limit-size': [
        {
          path: 'dist/index.min.js',
          limit: '8 Kb',
          gzip: true,
        },
        {
          path: 'dist/index.min.js',
          limit: '24 Kb',
        },
      ],
    };

    const rollupDevDepsArr = [
      '@rollup/plugin-node-resolve',
      '@rollup/plugin-commonjs',
      '@rollup/plugin-typescript',
      'rollup-plugin-terser',
      'rimraf',
      'npm-run-all',
      'limit-size',
    ];

    const rollupDevDeps = rollupDevDepsArr.map((name) => {
      return { name };
    });

    const defaultContent = await templateLib.getContentByToken(TemplateLib.TOKEN.ROLLUP_CONFIG_JS.DEFAULT);
    const re = new RegExp('PH_MY_PROJECT_NAME', 'g');
    const content = defaultContent.replace(re, options.projectName);

    const toolOpts: ToolOptions = {
      devDeps: [{ name: RollupTool.toolName }, ...rollupDevDeps],
      packageJsonScripts: scripts,
      packageJsonConfig: sizeConfig,
      configFiles: [
        {
          file: File.newFileByContent('rollup.config.js', content),
        },
      ],
    };

    const newTool = new RollupTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
