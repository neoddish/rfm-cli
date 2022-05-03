import { readFile } from "fs/promises";

import { outputFile, pathExists } from "fs-extra";

import { formatJSONObject, PATH_GETTERS } from "../utils";

import type { Generator } from "../types";

interface GenTsconfigJsonOptions {
  outDir?: string;
}

export const genTsconfigJson: Generator = async (
  targetPath: string,
  options?: GenTsconfigJsonOptions
) => {
  // no overwriting
  const fileExists = await pathExists(targetPath);
  if (fileExists) {
    console.warn(`File ${targetPath} EXISTS! will not overwrite it.`);
    return;
  }

  // defaults
  const outDir = options?.outDir || "lib";

  // load templates
  const jsonStr = await readFile(
    PATH_GETTERS.TEMPLATE.TSCONFIG_JSON.DEFAULT.get(),
    "utf-8"
  );

  // modifying
  const json = JSON.parse(jsonStr);

  if (outDir) {
    json.compilerOptions.outDir = outDir;
  }

  // write
  try {
    await outputFile(targetPath, formatJSONObject(json));
  } catch (error) {
    console.error(error);
  }
};
