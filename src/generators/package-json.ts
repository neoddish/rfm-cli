import { readFile } from "fs/promises";

import { outputFile } from "fs-extra";

import { formatJSONObject, PATH_GETTERS } from "../utils";

interface GenPackageJsonOptions {
  privatePackage: boolean;
}

export async function genPackageJson(
  targetPath: string,
  options?: GenPackageJsonOptions
) {
  // defaults
  const privatePackage = options?.privatePackage === true ? true : false;

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

  // write
  try {
    await outputFile(targetPath, formatJSONObject(json));
  } catch (error) {
    console.error(error);
  }
}
