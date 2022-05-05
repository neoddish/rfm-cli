import { Tool } from "../models/Tool";
import { File } from "../models/File";

import type { ToolOptions, PackageJsonScript } from "../models/Tool";

type HuskyHook = "pre-commit" | "commit-msg";

export interface HuskyCreateOptions {
  hooks: HuskyHook[];
}

export class HuskyTool extends Tool {
  static toolName: string = "husky";

  constructor() {
    super(HuskyTool.toolName);
  }

  static async create(options: HuskyCreateOptions) {
    const configs: any = { husky: { hook: {} } };
    const deps: { name: string; version?: string }[] = [];

    options.hooks.forEach((hook) => {
      switch (hook) {
        case "commit-msg":
          configs.husky.hook["commit-msg"] =
            'npx --no-install commitlint --edit "$1"';
          deps.push({ name: "@commitlint/cli" });
          deps.push({ name: "@commitlint/config-conventional" });
          break;

        case "pre-commit":
          configs.husky.hook["pre-commit"] = "npm run lint-staged";
          deps.push({ name: "lint-staged" });
          break;

        default:
          break;
      }
    });

    const configFiles = [];

    // if commitlint
    if (
      deps.find((dep) => dep.name === "@commitlint/cli") &&
      deps.find((dep) => dep.name === "@commitlint/config-conventional")
    ) {
      const commitlintFile = new File(
        "commitlint.config.js",
        `module.exports = { extends: ['@commitlint/config-conventional'] };
`
      );
      configFiles.push({ file: commitlintFile });
    }

    // if lint-staged
    if (deps.find((dep) => dep.name === "lint-staged")) {
      configs["lint-staged"] = {
        "*.{js,jsx,ts,tsx}": [
          "eslint --fix",
          "prettier --write",
          "jest --bail --findRelatedTests",
        ],
      };
    }

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
      configFiles: configFiles,
    };

    const newTool = new HuskyTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
