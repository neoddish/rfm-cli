import { Tool } from "../models/Tool";
import { TemplateLib } from "../models/TemplateLib";
import { File } from "../models/File";

import type { ToolOptions } from "../models/Tool";

export class PrettierTool extends Tool {
  static toolName: string = "prettier";

  constructor() {
    super(PrettierTool.toolName);
  }

  static async create(templateLib: TemplateLib) {
    const toolOpts: ToolOptions = {
      devDeps: [{ name: PrettierTool.toolName }],
      configFiles: [
        await File.newFileBySource(
          ".prettierrc.js",
          templateLib.absPathByToken(TemplateLib.TOKEN.PRETTIERRC_JS.DEFAULT)
        ),
      ],
    };

    const newTool = new PrettierTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
