const path = require('path');
const { access, readFile, writeFile } = require('fs/promises');

async function switchShebang(env) {
  const MAIN_PATH = path.resolve(process.cwd(), 'bin/main.js');

  let fileContent;

  try {
    await access(MAIN_PATH);
    fileContent = await readFile(MAIN_PATH, 'utf-8');
  } catch (error) {
    throw new Error(`${MAIN_PATH} NOT FOUND!`);
  }

  let shebang = '#! /usr/bin/env node'; // default
  if (env === 'development') {
    shebang = '#! /usr/local/bin/node';
  }

  const fileArr = fileContent.split('\n');
  const firstline = fileArr[0];
  if (firstline.includes('#!')) {
    fileArr[0] = shebang;
  } else {
    throw new Error(`Check the first line of current file. It's not a shebang: ${firstline}`);
  }

  const newFileContent = fileArr.join('\n');
  await writeFile(MAIN_PATH, newFileContent);
}

switchShebang(process.env.NODE_ENV);
