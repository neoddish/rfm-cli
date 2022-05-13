import { Tool } from '../models/Tool';
import { File } from '../models/File';
import { TemplateLib } from '../models/TemplateLib';

import type { ToolOptions } from '../models/Tool';

export interface ReactCreateOptions {
  projectName: string;
  language?: 'js' | 'ts';
  version?: string;
}

export class ReactTool extends Tool {
  static toolName: string = 'react';

  constructor() {
    super(ReactTool.toolName);
  }

  static async create(templateLib: TemplateLib, options: ReactCreateOptions) {
    const { projectName, language } = options;

    const lang = language || 'js';

    const react: any = { name: 'react' };
    if (options.version) react.version = options.version;
    const reactDom: any = { name: 'react-dom' };
    if (options.version) reactDom.version = options.version;

    const re = /PH_MY_PROJECT_NAME/g;

    const jsPublicHtml = await templateLib.getContentByToken(TemplateLib.TOKEN.REACT_SRC.JS.INDEX_HTML);
    const jsPublicHtmlContent = jsPublicHtml.replace(re, projectName);

    const tsPublicHtml = await templateLib.getContentByToken(TemplateLib.TOKEN.REACT_SRC.TS.INDEX_HTML);
    const tsPublicHtmlContent = tsPublicHtml.replace(re, projectName);

    const jsSrc = [
      {
        file: await File.newFileBySource(
          'index.jsx',
          templateLib.absPathByToken(TemplateLib.TOKEN.REACT_SRC.JS.INDEX_JSX)
        ),
        dir: './src',
      },
      {
        file: await File.newFileBySource(
          'index.less',
          templateLib.absPathByToken(TemplateLib.TOKEN.REACT_SRC.JS.INDEX_LESS)
        ),
        dir: './src',
      },
      {
        file: File.newFileByContent('index.html', jsPublicHtmlContent),
        dir: './src',
      },
      {
        file: await File.newFileBySource('app.jsx', templateLib.absPathByToken(TemplateLib.TOKEN.REACT_SRC.JS.APP_JSX)),
        dir: './src',
      },
    ];

    const tsSrc = [
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
        file: File.newFileByContent('index.html', tsPublicHtmlContent),
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

    const reactSrc = lang === 'ts' ? tsSrc : jsSrc;

    const toolOpts: ToolOptions = {
      deps: [react, reactDom],
      configFiles: reactSrc,
    };

    const newTool = new ReactTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
