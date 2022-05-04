import { TemplateLib } from "../models/TemplateLib";
import { PackageJsonScript, Tool } from "../models/Tool";
import { File } from "../models/File";

import type { ToolOptions } from "../models/Tool";

export class EslintTool extends Tool {
  static toolName: string = "eslint";

  constructor() {
    super(EslintTool.toolName);
  }

  static async create(templateLib: TemplateLib) {
    const scripts: PackageJsonScript[] = [
      // "lint": "eslint --ext .js,.jsx,.ts,.tsx \"./\"",
      {
        scriptName: "lint",
        value: 'eslint --ext .js,.jsx,.ts,.tsx "./"',
        mode: "replace",
      },
      // "lint-fix": "npm run lint -- --fix",
      {
        scriptName: "lint-fix",
        value: "npm run lint -- --fix",
        mode: "replace",
      },
    ];

    const eslintDevDepsArr = [
      "eslint-config-airbnb",
      "eslint-config-prettier",
      "eslint-import-resolver-typescript",
      "eslint-plugin-import",
      "eslint-plugin-prettier",
      "prettier",
    ];

    // todo ts or js or react
    // if ts
    eslintDevDepsArr.push(
      ...["@typescript-eslint/eslint-plugin", "@typescript-eslint/parser"]
    );
    // if react
    eslintDevDepsArr.push(...["eslint-plugin-react"]);

    const eslintDevDeps = eslintDevDepsArr.map((name) => {
      return { name: name };
    });

    const toolOpts: ToolOptions = {
      devDeps: [{ name: EslintTool.toolName }, ...eslintDevDeps],
      packageJsonScripts: scripts,
      configFiles: [
        await File.newFileBySource(
          ".eslintrc.js",
          templateLib.absPathByToken(TemplateLib.TOKEN.ESLINTRC_JS.DEFAULT)
        ),
        await File.newFileBySource(
          ".eslintignore",
          templateLib.absPathByToken(TemplateLib.TOKEN.ESLINTIGNORE.DEFAULT)
        ),
      ],
    };

    const newTool = new EslintTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
