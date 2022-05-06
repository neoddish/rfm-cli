import { TemplateLib } from '../models/TemplateLib';
import { Tool } from '../models/Tool';
import { File } from '../models/File';

import type { ToolOptions } from '../models/Tool';
import type { PackageJsonScript } from '../models/PackageManager';

export class JestTool extends Tool {
  static toolName: string = 'jest';

  constructor() {
    super(JestTool.toolName);
  }

  static async create(templateLib: TemplateLib) {
    const scripts: PackageJsonScript[] = [
      // "test": "jest",
      {
        scriptName: 'test',
        value: 'jest',
        mode: 'replace',
      },
    ];

    const eslintDevDepsArr = ['@types/jest', 'ts-jest'];

    const eslintDevDeps = eslintDevDepsArr.map((name) => {
      return { name };
    });

    const toolOpts: ToolOptions = {
      devDeps: [{ name: JestTool.toolName }, ...eslintDevDeps],
      packageJsonScripts: scripts,
      configFiles: [
        {
          file: await File.newFileBySource(
            'jest.config.js',
            templateLib.absPathByToken(TemplateLib.TOKEN.JEST_CONFIG_JS.DEFAULT)
          ),
        },
        {
          file: File.newFileByContent(
            'index.test.ts',
            `import { greeting } from '../src';

describe('init test', () => {
  test('good start', () => {
    expect(greeting).toBe('hello world!');
  });
});
          `
          ),
          dir: './__tests__',
        },
      ],
    };

    const newTool = new JestTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
