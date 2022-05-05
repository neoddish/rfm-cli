import path from "path";

export class TemplateLib {
  static TEMPLATE_ROOT = "templates";

  static TOKEN = {
    PACKAGE_JSON: {
      DEFAULT: "package-json/package.json",
    },
    README_MD: {
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
    ESLINTRC_JS: {
      DEFAULT: "eslintrc-js/.eslintrc.js",
    },
    ESLINTIGNORE: {
      DEFAULT: "eslintignore/.eslintignore",
    },
    PRETTIERRC_JS: {
      DEFAULT: "prettierrc-js/.prettierrc.js",
    },
    JEST_CONFIG_JS: {
      DEFAULT: "jest-config-js/jest.config.js",
    },
    ROLLUP_CONFIG_JS: {
      DEFAULT: "rollup-config-js/rollup.config.js",
    },
    MARKDOWNLINT_JSON: {
      DEFAULT: "markdownlint-json/.markdownlint.json",
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