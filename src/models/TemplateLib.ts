import path from "path";

export class TemplateLib {
  static TEMPLATE_ROOT = "templates";

  static TOKEN = {
    PACKAGE_JSON: {
      DEFAULT: "package-json/package.json",
    },
    README: {
      DEFAULT: "readme-md/readme.md",
    },
    GITIGNORE: {
      LITE: "gitignore/gitignore-lite",
      PRO: "gitignore/gitignore-pro",
    },
    TSCONFIG_JSON: {
      DEFAULT: "tsconfig-json/tsconfig.json",
    },
    EDITORCONFIG: {
      DEFAULT: "editorconfig/.editorconfig",
    },
  };

  private templateDir: string;

  constructor(moduleRoot: string) {
    this.templateDir = path.resolve(moduleRoot, TemplateLib.TEMPLATE_ROOT);
  }

  absPathByToken(token: string) {
    return path.resolve(this.templateDir, token);
  }
}
