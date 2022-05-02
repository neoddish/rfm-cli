import path from "path";

export function getModuleRoot(loDirname: string) {
  let moduleRootPath = loDirname;
  if (loDirname.endsWith("/lib/src")) {
    moduleRootPath = loDirname.replace(/\/lib\/src$/, "");
  } else if (loDirname.endsWith("/lib")) {
    moduleRootPath = loDirname.replace(/\/lib$/, "");
  }

  return moduleRootPath;
}

/**
 * To store the module root path for inner calls of the module.
 *
 * @singleton
 */
export class ModuleRoot {
  static instance: any;
  static path: string;

  constructor(path?: string);
  constructor(path: string) {
    // avoid multi-instantiation
    if (!!ModuleRoot.instance) {
      return ModuleRoot.instance;
    }

    if (!path) {
      throw new Error(
        "MUST assign the path property at the first time of instantiation!"
      );
    }

    ModuleRoot.path = path;

    ModuleRoot.instance = this;
    return this;
  }

  get path(): string {
    return this.path;
  }
}

/* PATHS */

export function templateDir() {
  return path.resolve(ModuleRoot.path, "templates");
}

export const PATH_GETTERS = {
  TEMPLATE: {
    PACKAGE_JSON: {
      DEFAULT: {
        get: () => path.resolve(templateDir(), "package-json", "package.json"),
      },
    },
  },
};
