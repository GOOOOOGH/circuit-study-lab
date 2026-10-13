import {defineConfig} from 'vite';
import {syncContent} from './scripts/sync-content.mjs';
import path from 'node:path';
export default defineConfig({build:{rollupOptions:{output:{manualChunks(id){if(id.includes('/src/generated/index.json'))return 'curriculum-index';if(id.includes('/node_modules/react')||id.includes('/node_modules/scheduler'))return 'react-runtime';}}}},plugins:[{name:'local-curriculum',async buildStart(){await syncContent()},configureServer(server){
  const directories=['docs','content'].map(dir=>path.resolve(dir));
  server.watcher.add(directories);let timer:ReturnType<typeof setTimeout>;
  server.watcher.on('all',(_event,file)=>{if(directories.some(dir=>file.startsWith(dir+path.sep))){clearTimeout(timer);timer=setTimeout(()=>syncContent().catch(error=>server.config.logger.error('课程目录同步失败：'+error.message)),250)}});
}}]});
