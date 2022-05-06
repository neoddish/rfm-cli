import { readFile } from 'fs/promises';

import lodashSet from 'lodash/set';
import { sortPackageJson } from 'sort-package-json';

import { formatJSONObject } from '../utils';

import { File } from './File';
import { TemplateLib } from './TemplateLib';

export interface PackageManagerOptions {
  privatePackage?: boolean;
  deps?: any;
  devDeps?: any;
  cfgs?: any;
}

export class PackageManager {
  private templateLib: TemplateLib;

  private contentObj: any;

  constructor(templateLib: TemplateLib) {
    this.templateLib = templateLib;
  }

  async init(options?: PackageManagerOptions) {
    // defaults
    const privatePackage = options?.privatePackage === true;
    const deps = options?.deps || {};
    const devDeps = options?.devDeps || {};
    const cfgs = options?.cfgs || [];

    const contentStr = await readFile(this.templateLib.absPathByToken(TemplateLib.TOKEN.PACKAGE_JSON.DEFAULT), 'utf-8');
    const contentObj = JSON.parse(contentStr);

    if (privatePackage) {
      contentObj.private = true;
    }

    contentObj.dependencies = { ...deps };
    contentObj.devDependencies = { ...devDeps };

    if (cfgs && Object.keys(cfgs).length) {
      Object.keys(cfgs).forEach((key) => {
        contentObj[key] = cfgs[key];
      });
    }

    this.contentObj = contentObj;
  }

  getPackageJsonFile(): File {
    const formatted = formatJSONObject(this.contentObj);
    const sorted = sortPackageJson(formatted);
    return new File('package.json', sorted);
  }

  addDep(name: string, version: string) {
    this.contentObj.dependencies[name] = version;
  }

  addDevDep(name: string, version: string) {
    this.contentObj.devDependencies[name] = version;
  }

  addConfig(key: string, value: any) {
    this.contentObj[key] = value;
  }

  updateScript(scriptName: string, value: string, mode: 'replace' | 'append') {
    const curScripts = this.contentObj.scripts;
    if (!curScripts) {
      lodashSet(this.contentObj, 'scripts', {});
    }

    const theScriptValue = curScripts[scriptName];

    if (!theScriptValue) {
      lodashSet(this.contentObj, `scripts.${scriptName}`, value);
    } else {
      if (mode === 'append') {
        lodashSet(this.contentObj, `scripts.${scriptName}`, `${theScriptValue} && ${value}`);
      }
      if (mode === 'replace') {
        lodashSet(this.contentObj, `scripts.${scriptName}`, value);
      }
    }
  }

  overwriteJson(dotPath: string, value: any) {
    lodashSet(this.contentObj, dotPath, value);
  }
}
