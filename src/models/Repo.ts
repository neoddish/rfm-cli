import path from "path";

import { outputFile, pathExists } from "fs-extra";

import { Structure } from "./Structure";
import { PackageManager } from "./PackageManager";
import { File } from "./File";
import { TemplateLib } from "./TemplateLib";

export class Repo {
  private structure: Structure;
  /** manager for package.json */
  private _packageManager: PackageManager;

  constructor(templateLib: TemplateLib) {
    this.structure = new Structure();
    this._packageManager = new PackageManager(templateLib);
  }

  async init() {
    await this._packageManager.init();
  }

  async output(outputRoot: string) {
    // add updated package.json
    this.addFile(".", this._packageManager.getPackageJsonFile());

    const outputList = this.structure.outputList();

    await Promise.all(
      outputList.map(({ path: relPath, file }) => {
        async function write() {
          const absPath = path.resolve(outputRoot, relPath);

          const fileExists = await pathExists(absPath);
          if (fileExists) {
            console.warn(`File ${absPath} EXISTS! will not overwrite it.`);
            return;
          }

          try {
            await outputFile(absPath, file.content);
          } catch (error) {
            console.error(error);
          }
        }
        return write();
      })
    );
  }

  async addFile(dir: string, file: File) {
    this.structure.addFile(dir, file);
  }

  get packageManager() {
    return this._packageManager;
  }
}
