import { resolve, dirname } from 'path';
import { access } from 'fs/promises';
import { constants } from 'fs';

export async function pathMakeable(path: string) {
  let makeable = false;
  let testPath = resolve(path);
  while (testPath && testPath !== '/') {
    let readable = false;
    try {
      await access(testPath, constants.R_OK);
      readable = true;
    } catch (error) {
      readable = false;
    }

    if (readable) {
      try {
        await access(testPath, constants.X_OK);
        makeable = true;
      } catch (error) {
        makeable = false;
      }

      break;
    }

    if (testPath === dirname(testPath)) {
      console.error(`Invalid path string segment ${testPath}.`);
      return false;
    }
    testPath = dirname(testPath);
  }

  return makeable;
}
