import path from "path";

import { program } from "commander";

import { genPackageJson } from "./generators";
import { getModuleRoot, ModuleRoot } from "./utils";

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

  // to organize
  const packageJsonPath = path.resolve(projectRoot, "package.json");

  // to write
  await genPackageJson(packageJsonPath, { privatePackage: true });
}
