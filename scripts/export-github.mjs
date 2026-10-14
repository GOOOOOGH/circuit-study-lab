import {readdir,mkdir,readFile,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=process.argv[2]&&path.resolve(process.argv[2]);
if(!output)throw new Error('用法：node scripts/export-github.mjs <新的空目录绝对路径>');
if(output===root||output.startsWith(root+path.sep))throw new Error('导出目录必须位于项目目录之外');
await mkdir(output,{recursive:true});
if((await readdir(output)).length)throw new Error('只导出到空目录，避免覆盖已有文件');
const rootFiles=['README.md','AGENTS.md','package.json','pnpm-lock.yaml','tsconfig.json','vite.config.ts','index.html','.gitignore','启动网站.command','生成网站.command'];
const roots=['docs','content','src','scripts','tests','public'];
const excluded=p=>p.startsWith('src/generated/')||p.startsWith('public/curriculum/')||p.startsWith('public/planning/')||p.split('/').some(s=>s.startsWith('.env')||s==='.DS_Store'||s==='.openai'||s==='.git'||s==='node_modules'||s==='dist')||p.endsWith('.log')||p.includes('.tmp-');
const files=[];
async function visit(p){for(const entry of await readdir(path.join(root,p),{withFileTypes:true})){const rel=`${p}/${entry.name}`;if(excluded(rel))continue;if(entry.isDirectory())await visit(rel);else if(entry.isFile())files.push(rel);else throw new Error(`不导出符号链接或特殊文件：${rel}`);}}
for(const p of roots)await visit(p);
files.push(...rootFiles);
for(const rel of files.sort()){
 const source=path.join(root,rel),dest=path.join(output,rel);await mkdir(path.dirname(dest),{recursive:true});
 let data=await readFile(source);
 if(rel==='.gitignore')data=Buffer.from(data.toString()+'\n.openai/\n.env\n.env.*\n!.env.example\nsrc/generated/\npublic/curriculum/\npublic/planning/\n');
 if(rel==='README.md')data=Buffer.from(data.toString().replace('## 当前版本','## 克隆和运行\n\n目标公开仓库：https://github.com/GOOOOOGH/circuit-study-lab 。需要Node 20.19+或22.12+和pnpm：\n\n```sh\npnpm install --frozen-lockfile\npnpm run build\npnpm run test\npnpm run dev\n```\n\n详细操作见[GitHub源码与运行说明](docs/09-GitHub源码与运行说明.md)。生成缓存由构建重建，现有Sites身份不包含在这个导出中。\n\n## 当前版本'));
 const mode=(await stat(source)).mode&0o777;await writeFile(dest,data,{mode});
}
console.log(JSON.stringify({output,files:files.length,excluded:['站点身份','凭据/环境文件','Git内部','依赖/构建/生成缓存']}));
