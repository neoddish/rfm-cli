import { TemplateLib } from '../models/TemplateLib';
import { PackageJsonScript, Tool } from '../models/Tool';
import { File } from '../models/File';

import type { ToolOptions } from '../models/Tool';

export class RollupTool extends Tool {
  static toolName: string = 'rollup';

  constructor() {
    super(RollupTool.toolName);
  }

  static async create(templateLib: TemplateLib) {
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

    const eslintDevDepsArr = [
      '@rollup/plugin-node-resolve',
      '@rollup/plugin-commonjs',
      '@rollup/plugin-typescript',
      'rollup-plugin-terser',
      'rimraf',
      'npm-run-all',
      'limit-size',
    ];

    const eslintDevDeps = eslintDevDepsArr.map((name) => {
      return { name };
    });

    const toolOpts: ToolOptions = {
      devDeps: [{ name: RollupTool.toolName }, ...eslintDevDeps],
      packageJsonScripts: scripts,
      packageJsonConfig: sizeConfig,
      configFiles: [
        {
          file: await File.newFileBySource(
            'rollup.config.js',
            templateLib.absPathByToken(TemplateLib.TOKEN.ROLLUP_CONFIG_JS.DEFAULT)
          ),
        },
      ],
    };

    const newTool = new RollupTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
