import {spawnSync} from 'node:child_process';
import {syncContent} from './sync-content.mjs';
import {packageProjects} from './package-projects.mjs';
import {build,createServer,preview} from 'vite';
const mode=process.argv[2]||'dev';
function command(args){const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1)}
if(mode==='test'){command(['--test','tests/models.test.mjs','tests/foundation.test.mjs','tests/transient-measurement.test.mjs','tests/semiconductor.test.mjs','tests/advanced.test.mjs','tests/curriculum.test.mjs']);}
else if(mode==='build'){await syncContent();await packageProjects();command(['node_modules/typescript/bin/tsc','--noEmit']);await build();}
else if(mode==='dev'){
 await syncContent();const server=await createServer({server:{host:'127.0.0.1',port:5173,strictPort:true}});await server.listen();server.printUrls();
}
else if(mode==='preview'){const server=await preview({preview:{host:'127.0.0.1',port:4173,strictPort:true}});server.printUrls();}
else {console.error('用法：node scripts/run.mjs dev|build|test|preview');process.exit(1)}
