import { Tool } from "../models/Tool";
import { TemplateLib } from "../models/TemplateLib";
import { File } from "../models/File";

import type { ToolOptions, PackageJsonScript } from "../models/Tool";

export class PrettierTool extends Tool {
  static toolName: string = "prettier";

  constructor() {
    super(PrettierTool.toolName);
  }

  static async create(templateLib: TemplateLib) {
    // todo manifest
    // if ts or js; if src or __tests__
    const scripts: PackageJsonScript[] = [
      // "format": "prettier --write \"src/**/*.ts\" \"__tests__/**/*.ts\"",
      {
        scriptName: "format",
        value: 'prettier --write "src/**/*.ts" "__tests__/**/*.ts"',
        mode: "replace",
      },
      // "format-check": "prettier ./src/**/*.ts ./__tests__/**/*.ts --check",
      {
        scriptName: "format-check",
        value: "prettier ./src/**/*.ts ./__tests__/**/*.ts --check",
        mode: "replace",
      },
    ];

    const toolOpts: ToolOptions = {
      devDeps: [{ name: PrettierTool.toolName }],
      packageJsonScripts: scripts,
      configFiles: [
        {
          file: await File.newFileBySource(
            ".prettierrc.js",
            templateLib.absPathByToken(TemplateLib.TOKEN.PRETTIERRC_JS.DEFAULT)
          ),
        },
      ],
    };

    const newTool = new PrettierTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
