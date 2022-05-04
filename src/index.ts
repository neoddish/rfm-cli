import path from "path";

import { program } from "commander";

import { Maker } from "./models/Maker";

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
  const cliOptions = parseOptions();
  const { target: projectRoot } = cliOptions;

  const maker = new Maker({ moduleRoot: Maker.getModuleRoot(__dirname) });

  await maker.mvpRepo();

  await maker.output(projectRoot);
}
