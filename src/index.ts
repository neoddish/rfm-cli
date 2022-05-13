import path from 'path';

import { Maker } from './models/Maker';
import { parseOptions } from './options';
import { execScripts } from './execScript';

export async function main() {
  const { target, manifest, execute } = await parseOptions();
  const projectName = path.basename(target);

  const maker = new Maker({ moduleRoot: Maker.getModuleRoot(__dirname) });
  const repo = await maker.assemble(projectName, manifest);
  await repo.output(target);

  if (execute) {
    await execScripts(target);
  }
}
