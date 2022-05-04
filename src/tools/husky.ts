import { Tool } from "../models/Tool";
import { TemplateLib } from "../models/TemplateLib";
import { File } from "../models/File";

import type { ToolOptions, PackageJsonScript } from "../models/Tool";

type HuskyHook = "pre-commit" | "commit-msg";

interface HuskyToolOptions {
  hooks: HuskyHook[];
}

export class HuskyTool extends Tool {
  static toolName: string = "husky";

  constructor() {
    super(HuskyTool.toolName);
  }

  static async create(options: HuskyToolOptions) {
    const configs: any = { husky: { hook: {} } };
    const deps: { name: string; version?: string }[] = [];

    options.hooks.forEach((hook) => {
      switch (hook) {
        case "commit-msg":
          configs.husky.hook["commit-msg"] =
            'npx --no-install commitlint --edit "$1"';
          deps.push({ name: "commitlint" });
          break;

        case "pre-commit":
          configs.husky.hook["pre-commit"] = "npm run lint-staged";
          deps.push({ name: "lint-staged" });
          break;

        default:
          break;
      }
    });

    // "prepare": "husky install"
    const script: PackageJsonScript = {
      scriptName: "prepare",
      value: "husky install",
      mode: "append",
    };

    const toolOpts: ToolOptions = {
      devDeps: [{ name: HuskyTool.toolName }, ...deps],
      packageJsonConfig: configs,
      packageJsonScripts: [script],
    };

    const newTool = new HuskyTool();
    newTool.init(toolOpts);

    return newTool;
  }

  static async createWithTemplateLib(templateLib: TemplateLib) {
    const options: ToolOptions = {
      devDeps: [{ name: HuskyTool.toolName }],
      configFile: await File.newFileBySource(
        "tsconfig.json",
        templateLib.absPathByToken(TemplateLib.TOKEN.TSCONFIG_JSON.DEFAULT)
      ),
    };

    const newTool = new HuskyTool();
    newTool.init(options);

    return newTool;
  }
}
