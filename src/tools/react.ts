import { Tool } from '../models/Tool';
import { File } from '../models/File';
import { TemplateLib } from '../models/TemplateLib';

import type { ToolOptions } from '../models/Tool';

export interface ReactCreateOptions {
  projectName: string;
  version?: string;
}

export class ReactTool extends Tool {
  static toolName: string = 'react';

  constructor() {
    super(ReactTool.toolName);
  }

  static async create(templateLib: TemplateLib, options: ReactCreateOptions) {
    const { projectName } = options;

    const react: any = { name: 'react' };
    if (options.version) react.version = options.version;
    const reactDom: any = { name: 'react-dom' };
    if (options.version) reactDom.version = options.version;

    const publicHtml = await templateLib.getContentByToken(TemplateLib.TOKEN.REACT_SRC.TS.INDEX_HTML);
    const re = new RegExp('PH_MY_PROJECT_NAME', 'g');
    const publicHtmlContent = publicHtml.replace(re, projectName);

    const reactSrc = [
      {
        file: await File.newFileBySource(
          'index.tsx',
          templateLib.absPathByToken(TemplateLib.TOKEN.REACT_SRC.TS.INDEX_TSX)
        ),
        dir: './src',
      },
      {
        file: await File.newFileBySource(
          'index.less',
          templateLib.absPathByToken(TemplateLib.TOKEN.REACT_SRC.TS.INDEX_LESS)
        ),
        dir: './src',
      },
      {
        file: File.newFileByContent('index.html', publicHtmlContent),
        dir: './src',
      },
      {
        file: await File.newFileBySource('app.tsx', templateLib.absPathByToken(TemplateLib.TOKEN.REACT_SRC.TS.APP_TSX)),
        dir: './src',
      },
      {
        file: await File.newFileBySource(
          'typings.d.ts',
          templateLib.absPathByToken(TemplateLib.TOKEN.REACT_SRC.TS.TYPEINGS_D_TS)
        ),
        dir: './src',
      },
    ];

    const toolOpts: ToolOptions = {
      deps: [react, reactDom],
      configFiles: reactSrc,
    };

    const newTool = new ReactTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
