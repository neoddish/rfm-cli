import path from "path";
import { spawn } from "child_process";

import { program } from "commander";

import { Maker } from "./models/Maker";

interface Options {
  target: string;
  exec: boolean;
}

function parseOptions(): Options {
  function parseTarget(value: string, _: any) {
    if (value.startsWith("/")) {
      return value;
    }
    return path.resolve(process.cwd(), value);
  }

  program
    .option("-t, --target <path>", "path to create project", parseTarget)
    .option("-e, --exec", "execute scripts after project created", false);

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
  const { target: projectRoot, exec: execute } = cliOptions;

  const maker = new Maker({ moduleRoot: Maker.getModuleRoot(__dirname) });

  await maker.mvpRepo();

  await maker.output(projectRoot);

  if (execute) {
    const postcreateCommands = [
      `cd ${projectRoot}`,
      "git init",
      "npm install",
      "npm run lint-fix",
      "npm run format",
      "npm run test",
      "npm run build",
    ].join(" && ");

    const result = spawn(postcreateCommands, { stdio: "inherit", shell: true });

    result.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }
}
