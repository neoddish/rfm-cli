import { stat, readFile } from "fs/promises";

import { pathExists } from "fs-extra";

export class File {
  private _filename: string;
  private _content: string;

  constructor(filename: string, content: string) {
    this._filename = filename;
    this._content = content;
  }

  static newFileByContent(filename: string, content: string): File {
    return new File(filename, content);
  }

  /**
   * new file by read and copy an exist file
   */
  static async newFileBySource(
    filename: string,
    sourcePath: string
  ): Promise<File> {
    const sourceExists = await pathExists(sourcePath);
    if (!sourceExists) {
      throw new Error(`Source file ${sourcePath} NOT FOUND!`);
    }

    const sourceIsFile = (await stat(sourcePath)).isFile();
    if (!sourceIsFile) {
      throw new Error(`Source ${sourcePath} is NOT a file!`);
    }

    const contentStr = await readFile(sourcePath, "utf-8");

    return new File(filename, contentStr);
  }

  get filename() {
    return this._filename;
  }

  get content() {
    return this._content;
  }
}
