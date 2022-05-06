import { Tool } from '../models/Tool';
import { TemplateLib } from '../models/TemplateLib';
import { File } from '../models/File';

import type { ToolOptions } from '../models/Tool';
import type { PackageJsonScript } from '../models/PackageManager';

export class TypescriptTool extends Tool {
  static toolName: string = 'typescript';

  constructor() {
    super(TypescriptTool.toolName);
  }

  static async create(templateLib: TemplateLib) {
    // todo manifest lib or esm
    // for build
    const scripts: PackageJsonScript[] = [
      // "build:cjs": "rimraf ./lib && tsc --module commonjs --outDir lib"
      {
        scriptName: 'build:cjs',
        value: 'rimraf ./lib && tsc --module commonjs --outDir lib',
        mode: 'replace',
      },
      // "build:esm": "rimraf ./esm && tsc --module ESNext --outDir esm"
      {
        scriptName: 'build:esm',
        value: 'rimraf ./esm && tsc --module ESNext --outDir esm',
        mode: 'replace',
      },
    ];

    const eslintDevDepsArr = ['rimraf'];

    const eslintDevDeps = eslintDevDepsArr.map((name) => {
      return { name };
    });

    const toolOpts: ToolOptions = {
      devDeps: [{ name: TypescriptTool.toolName }, ...eslintDevDeps],
      packageJsonScripts: scripts,
      configFiles: [
        {
          file: await File.newFileBySource(
            'tsconfig.json',
            templateLib.absPathByToken(TemplateLib.TOKEN.TSCONFIG_JSON.DEFAULT)
          ),
        },
      ],
      // todo manifest lib
      packageJsonConfig: { types: 'lib/index.d.ts' },
    };

    const newTool = new TypescriptTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
