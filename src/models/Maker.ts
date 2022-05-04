import { Repo } from "./Repo";
import { TemplateLib } from "./TemplateLib";
import { File } from "./File";

import { TypescriptTool } from "../tools/typescript";
import { HuskyTool } from "../tools/husky";
import { EslintTool } from "../tools/eslint";
import { PrettierTool } from "../tools/prettier";
import { JestTool } from "../tools/jest";

export interface MakerParams {
  moduleRoot: string;
}

export class Maker {
  /** location of the rfm-cli lib */
  private moduleRoot: string;
  /** location where this command is called */
  private processCwd: string;
  /** where template paths stored */
  private templateLib: TemplateLib;
  /** the repo to be created */
  private repo: Repo | undefined;

  constructor(params: MakerParams) {
    if (!params?.moduleRoot) {
      throw new Error("MUST assign module root path for Maker!");
    }

    this.moduleRoot = params.moduleRoot;
    this.processCwd = process.cwd();

    this.templateLib = new TemplateLib(this.moduleRoot);
  }

  async mvpRepo() {
    const repo = new Repo(this.templateLib);

    await repo.init();

    // .gitignore
    await this.registerTemplateFile(
      ".gitignore",
      this.templateLib.absPathByToken(TemplateLib.TOKEN.GITIGNORE.PRO),
      repo,
      "./"
    );

    // README.md
    await this.registerTemplateFile(
      "README.md",
      this.templateLib.absPathByToken(TemplateLib.TOKEN.README_MD.DEFAULT),
      repo,
      "./"
    );

    // .editorconfig
    await this.registerTemplateFile(
      ".editorconfig",
      this.templateLib.absPathByToken(TemplateLib.TOKEN.EDITORCONFIG.DEFAULT),
      repo,
      "./"
    );

    // src
    await repo.addFile(
      "./src",
      new File(
        "index.ts",
        `export const greeting = 'hello world!';
`
      )
    );

    // typescript
    const typescriptTool = await TypescriptTool.create(this.templateLib);
    await typescriptTool.dispatch(repo);

    // husky
    const huskyTool = await HuskyTool.create({
      hooks: ["commit-msg", "pre-commit"],
    });
    await huskyTool.dispatch(repo);

    // eslint
    const eslintTool = await EslintTool.create(this.templateLib);
    await eslintTool.dispatch(repo);

    // prettier
    const prettierTool = await PrettierTool.create(this.templateLib);
    await prettierTool.dispatch(repo);

    // jest
    const jestTool = await JestTool.create(this.templateLib);
    await jestTool.dispatch(repo);

    this.repo = repo;
  }

  async output(outputRoot: string) {
    if (this.repo) {
      await this.repo.output(outputRoot);
    } else {
      throw new Error("repo has not been initialized!");
    }
  }

  async registerTemplateFile(
    filename: string,
    template: string,
    repo: Repo,
    dir: string
  ) {
    const file = await File.newFileBySource(filename, template);
    repo.addFile(dir, file);
  }

  /**
   * get location of the rfm-cli lib.
   * Call this at the exe file or the nearest file.
   *
   * @param loDirname
   * @returns
   */
  static getModuleRoot(loDirname: string) {
    let moduleRootPath = loDirname;
    if (loDirname.endsWith("/lib/src")) {
      moduleRootPath = loDirname.replace(/\/lib\/src$/, "");
    } else if (loDirname.endsWith("/lib")) {
      moduleRootPath = loDirname.replace(/\/lib$/, "");
    }

    return moduleRootPath;
  }
}
