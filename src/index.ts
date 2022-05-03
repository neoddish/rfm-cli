import path from "path";

import { program } from "commander";

import {
  genPackageJson,
  genReadme,
  genGitignore,
  genTsconfigJson,
  cfgHusky,
  genEditorconfig,
} from "./generators";
import { getModuleRoot, ModuleRoot } from "./utils";

import type { GenPackageJsonOptions } from "./generators";

interface Options {
  target: string;
}

function parseOptions(): Options {
  function parseTarget(value: string, _: any) {
    if (value.startsWith("/")) {
      return value;
    }
    return path.resolve(process.cwd(), value);
  }

  program.option("-t, --target <path>", "path to create project", parseTarget);

  program.parse();

  const options: Options = program.opts();

  const { target } = options;

  if (!target) {
    throw new Error(
      "MUST define a target path for new project by -t or --target argument."
    );
  }

  return options;
}

export async function main() {
  // globally set module root path
  new ModuleRoot(getModuleRoot(__dirname));

  const options = parseOptions();

  const { target: projectRoot } = options;

  // to organize - paths

  const packageJsonPath = path.resolve(projectRoot, "package.json");
  const readmePath = path.resolve(projectRoot, "README.md");
  const gitignorePath = path.resolve(projectRoot, ".gitignore");
  const tsconfigJsonPath = path.resolve(projectRoot, "tsconfig.json");
  const editorconfigPath = path.resolve(projectRoot, ".editorconfig");

  // to compute - configs

  const packageJsonOption: GenPackageJsonOptions = {
    deps: {},
    devDeps: {},
    cfgs: {},
  };

  // typescript
  packageJsonOption.devDeps.typescript = "latest";

  // husky
  const { cfgs: cfgsFromHusky, deps: depsFromHusky } = cfgHusky({
    hooks: ["commit-msg", "pre-commit"],
  });
  depsFromHusky.forEach((dep) => {
    packageJsonOption.devDeps[dep] = "latest";
  });
  Object.keys(cfgsFromHusky).forEach((key) => {
    packageJsonOption.cfgs[key] = cfgsFromHusky[key];
  });

  // to write

  await genPackageJson(packageJsonPath, packageJsonOption);
  await genReadme(readmePath);
  await genGitignore(gitignorePath);
  await genTsconfigJson(tsconfigJsonPath);
  await genEditorconfig(editorconfigPath);
}
