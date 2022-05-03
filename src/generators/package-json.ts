import { readFile } from "fs/promises";

import { outputFile, pathExists } from "fs-extra";

import { formatJSONObject, PATH_GETTERS } from "../utils";

import type { Generator } from "../types";

export interface GenPackageJsonOptions {
  privatePackage?: boolean;
  deps?: any;
  devDeps?: any;
  cfgs?: any;
}

export const genPackageJson: Generator = async (
  targetPath: string,
  options?: GenPackageJsonOptions
) => {
  // no overwriting
  const fileExists = await pathExists(targetPath);
  if (fileExists) {
    console.warn(`File ${targetPath} EXISTS! will not overwrite it.`);
    return;
  }

  // defaults
  const privatePackage = options?.privatePackage === true ? true : false;
  const deps = options?.deps || {};
  const devDeps = options?.devDeps || {};
  const cfgs = options?.cfgs || [];

  // load templates
  const jsonStr = await readFile(
    PATH_GETTERS.TEMPLATE.PACKAGE_JSON.DEFAULT.get(),
    "utf-8"
  );

  // modifying
  const json = JSON.parse(jsonStr);

  if (privatePackage) {
    json.private = true;
  }

  if (deps && Object.keys(deps).length) {
    json.dependencies = { ...deps };
  }

  if (devDeps && Object.keys(devDeps).length) {
    json.devDependencies = { ...devDeps };
  }

  if (cfgs && Object.keys(cfgs).length) {
    Object.keys(cfgs).forEach((key) => {
      json[key] = cfgs[key];
    });
  }

  // write
  try {
    await outputFile(targetPath, formatJSONObject(json));
  } catch (error) {
    console.error(error);
  }
};
