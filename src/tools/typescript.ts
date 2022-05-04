import { Tool } from "../models/Tool";
import { TemplateLib } from "../models/TemplateLib";
import { File } from "../models/File";

import type { ToolOptions } from "../models/Tool";

export class TypescriptTool extends Tool {
  static toolName: string = "typescript";

  constructor() {
    super(TypescriptTool.toolName);
  }

  static async createWithTemplateLib(templateLib: TemplateLib) {
    const options: ToolOptions = {
      devDeps: [{ name: TypescriptTool.toolName }],
      configFile: await File.newFileBySource(
        "tsconfig.json",
        templateLib.absPathByToken(TemplateLib.TOKEN.TSCONFIG_JSON.DEFAULT)
      ),
    };

    const newTool = new TypescriptTool();
    newTool.init(options);

    return newTool;
  }
}
