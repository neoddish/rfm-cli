import { Tool } from '../models/Tool';
import { TemplateLib } from '../models/TemplateLib';
import { File } from '../models/File';

import type { ToolOptions } from '../models/Tool';

export class MarkdownlintTool extends Tool {
  static toolName: string = 'markdownlint';

  constructor() {
    super(MarkdownlintTool.toolName);
  }

  static async create(templateLib: TemplateLib) {
    const toolOpts: ToolOptions = {
      configFiles: [
        {
          file: await File.newFileBySource(
            '.markdownlint.json',
            templateLib.absPathByToken(TemplateLib.TOKEN.MARKDOWNLINT_JSON.DEFAULT)
          ),
        },
      ],
    };

    const newTool = new MarkdownlintTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
