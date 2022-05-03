import { readFile } from "fs/promises";

import { outputFile, pathExists } from "fs-extra";

import { PATH_GETTERS } from "../utils";

import type { Generator } from "../types";

interface GenGitignoreOptions {
  category: "LITE" | "PRO";
}

export const genGitignore: Generator = async (
  targetPath: string,
  options?: GenGitignoreOptions
) => {
  // no overwriting
  const fileExists = await pathExists(targetPath);
  if (fileExists) {
    console.warn(`File ${targetPath} EXISTS! will not overwrite it.`);
    return;
  }

  // defaults
  const category = options?.category || "PRO";

  // load templates
  const gitignoreStr = await readFile(
    PATH_GETTERS.TEMPLATE.GITIGNORE[category].get(),
    "utf-8"
  );

  // write
  try {
    await outputFile(targetPath, gitignoreStr);
  } catch (error) {
    console.error(error);
  }
};
