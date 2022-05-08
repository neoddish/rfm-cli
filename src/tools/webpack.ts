import { TemplateLib } from '../models/TemplateLib';
import { Tool } from '../models/Tool';
import { File } from '../models/File';

import type { ToolOptions } from '../models/Tool';
import type { PackageJsonScript } from '../models/PackageManager';

export interface WebpackCreateOptions {
  projectName: string;
  port?: number;
}

export class WebpackTool extends Tool {
  static toolName: string = 'webpack';

  constructor() {
    super(WebpackTool.toolName);
  }

  static async create(templateLib: TemplateLib, options: WebpackCreateOptions) {
    const { projectName } = options;
    const port = options.port || '8888';

    const scripts: PackageJsonScript[] = [
      // "start": "webpack serve --port 8888"
      {
        scriptName: 'start',
        value: `webpack serve --port ${port}`,
        mode: 'append',
      },
      // "build:site": "Webpack ./src"
      {
        scriptName: 'build:site',
        value: 'Webpack ./src',
        mode: 'append',
      },
    ];

    const webpackDevDepsArr = [
      'webpack-cli',
      'webpack-dev-server',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-transform-runtime',
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript',
      '@types/react',
      '@types/react-dom',
      'babel-loader',
      'babel-plugin-import',
      'css-loader',
      'file-loader',
      'less',
      'less-loader',
      'style-loader',
      'npm-run-all',
    ];

    const webpackDevDeps = webpackDevDepsArr.map((name) => {
      return { name };
    });

    const defaultContent = await templateLib.getContentByToken(TemplateLib.TOKEN.WEBPACK_CONFIG_JS.DEFAULT);

    const publicHtml = await templateLib.getContentByToken(TemplateLib.TOKEN.PUBLIC__INDEX.DEFAULT);
    const re = new RegExp('PH_MY_PROJECT_NAME', 'g');
    const publicHtmlContent = publicHtml.replace(re, projectName);

    const toolOpts: ToolOptions = {
      devDeps: [{ name: WebpackTool.toolName }, ...webpackDevDeps],
      packageJsonScripts: scripts,
      configFiles: [
        {
          file: File.newFileByContent('webpack.config.js', defaultContent),
        },
        {
          file: File.newFileByContent('index.html', publicHtmlContent),
          dir: './public',
        },
      ],
    };

    const newTool = new WebpackTool();
    newTool.init(toolOpts);

    return newTool;
  }
}
