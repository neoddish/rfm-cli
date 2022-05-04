import { File } from "./File";
import { Repo } from "./Repo";

export type PackageJsonScript = {
  scriptName: string;
  value: string;
  mode: "replace" | "append";
};

export interface ToolOptions {
  deps?: { name: string; version?: string }[];
  devDeps?: { name: string; version?: string }[];
  packageJsonConfig?: any;
  packageJsonScripts?: PackageJsonScript[];
  configFiles?: File[];
}

export class Tool {
  private name: string;
  private deps?: { name: string; version?: string }[];
  private devDeps?: { name: string; version?: string }[];
  private packageJsonConfig?: any;
  private configFiles?: File[];
  private packageJsonScripts?: PackageJsonScript[];

  constructor(name: string) {
    this.name = name;
  }

  init(options: ToolOptions) {
    // defaults
    this.deps = options.deps || [];
    this.devDeps = options.devDeps || [];
    this.packageJsonConfig = options.packageJsonConfig;
    this.configFiles = options.configFiles;
    this.packageJsonScripts = options.packageJsonScripts;
  }

  async dispatch(repo: Repo) {
    // deps
    if (this.deps && this.deps.length) {
      this.deps.forEach((dep) => {
        const { name, version } = dep;
        repo.packageManager.addDep(
          name,
          version || Tool.DEP_VERSIONS[name] || "latest"
        );
      });
    }

    // devDeps
    if (this.devDeps && this.devDeps.length) {
      this.devDeps.forEach((devDep) => {
        const { name, version } = devDep;
        repo.packageManager.addDevDep(
          name,
          version || Tool.DEP_VERSIONS[name] || "latest"
        );
      });
    }

    // package.json cfgs
    if (this.packageJsonConfig) {
      Object.keys(this.packageJsonConfig).forEach((key) => {
        repo.packageManager.addConfig(key, this.packageJsonConfig[key]);
      });
    }

    // package.json scripts
    if (this.packageJsonScripts && this.packageJsonScripts.length) {
      this.packageJsonScripts.forEach(({ scriptName, value, mode }) => {
        repo.packageManager.updateScript(scriptName, value, mode);
      });
    }

    // config file
    if (this.configFiles && this.configFiles.length) {
      await Promise.all(
        this.configFiles.map((file) => {
          async function add() {
            await repo.addFile("./", file);
          }
          return add();
        })
      );
    }
  }

  static DEP_VERSIONS: Record<string, string> = {
    typescript: "^4.6.3",
  };
}
