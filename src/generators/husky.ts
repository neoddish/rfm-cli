import type { Configurator } from "../types";

type HuskyHook = "pre-commit" | "commit-msg";

interface cfgHuskyOptions {
  hooks: HuskyHook[];
}

export const cfgHusky: Configurator<cfgHuskyOptions> = (options) => {
  const configs: any = { husky: {} };
  const deps: any[] = [];

  options.hooks.forEach((hook) => {
    switch (hook) {
      case "commit-msg":
        configs.husky["commit-msg"] = 'npx --no-install commitlint --edit "$1"';
        deps.push("commitlint");
        break;

      case "pre-commit":
        configs.husky["pre-commit"] = "npm run lint-staged";
        deps.push("lint-staged");
        break;

      default:
        break;
    }
  });

  return {
    cfgs: configs,
    deps,
  };
};
