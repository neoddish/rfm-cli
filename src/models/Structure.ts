import path from "path";

import lodashSet from "lodash/set";

import { File } from "./File";

const DOT_SUB = `!<#>!`;

export class Structure {
  protected tree: any;

  constructor() {
    this.tree = { root: {} };
  }

  addFile(dir: string, file: File) {
    const filename = file.filename;
    const dotPath = path
      .join("root", dir, filename)
      .replace(/\./g, DOT_SUB)
      .replace(/\//g, ".");

    lodashSet(this.tree, dotPath, file);
  }

  outputList() {
    const list: { path: string; file: File }[] = [];

    getFromTree(this.tree.root, list, "");

    const formattedList = list.map(({ path, file }) => {
      const re = new RegExp(DOT_SUB, "g");
      return { path: path.replace(re, "."), file: file };
    });

    return formattedList;
  }
}

function getFromTree(
  node: any,
  arr: { path: string; file: File }[],
  dir: string
) {
  if (node instanceof File) {
    arr.push({ path: dir, file: node });
  } else {
    Object.keys(node).forEach((key) => {
      getFromTree(node[key], arr, path.join(dir, key));
    });
  }
}
