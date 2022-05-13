import path from 'path';
import { spawn } from 'child_process';
import { access, readFile } from 'fs/promises';

export async function execScripts(target: string) {
  const postcreateCommands = [`cd ${target}`];

  let gitExist = false;

  try {
    await access(path.resolve(target, '.git'));
    gitExist = true;
  } catch (error) {
    gitExist = false;
  }

  if (!gitExist) {
    postcreateCommands.push('git init');
  }

  postcreateCommands.push('npm install');

  const packageJson: any = await readFile(path.resolve(target, 'package.json'));
  const packageJsonObj = JSON.parse(packageJson);

  ['lint-fix', 'format', 'test', 'build'].forEach((script) => {
    if (packageJsonObj.scripts && packageJsonObj.scripts[script]) {
      postcreateCommands.push(`npm run ${script}`);
    }
  });

  const result = spawn(postcreateCommands.join(' && '), { stdio: 'inherit', shell: true });

  result.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}
