import { readFile } from "fs/promises";

import { outputFile, pathExists } from "fs-extra";

import { PATH_GETTERS } from "../utils";

import type { Generator } from "../types";

export const genReadme: Generator = async (targetPath: string) => {
  // no overwriting
  const fileExists = await pathExists(targetPath);
  if (fileExists) {
    console.warn(`File ${targetPath} EXISTS! will not overwrite it.`);
    return;
  }

  // load templates
  const readmeStr = await readFile(
    PATH_GETTERS.TEMPLATE.README.DEFAULT.get(),
    "utf-8"
  );

  // write
  try {
    await outputFile(targetPath, readmeStr);
  } catch (error) {
    console.error(error);
  }
};
