import { readFile, writeFile, mkdir, copyFile, readdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
async function atomicWrite(file,data){const temporary=file+'.tmp-'+randomUUID();await writeFile(temporary,data);await rename(temporary,file)}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function parseRows(markdown) {
  return markdown.split('\n').filter(line => /^\|\s*(?:[FADCEGTPXNS]\d{2,3})\s*\|/.test(line)).map(line => line.split(/(?<!\\)\|/).slice(1, -1).map(v => v.trim().replaceAll('\\|','|')));
}
async function loadLessons(){const base=JSON.parse(await readFile(path.join(root,'content/lessons.json'),'utf8'));const files=(await readdir(path.join(root,'content/courses'))).filter(f=>f.endsWith('.json')).sort();const groups=await Promise.all(files.map(f=>readFile(path.join(root,'content/courses',f),'utf8').then(JSON.parse)));return [...base,...groups.flat()];}
export async function syncContent() {
  const read = name => readFile(path.join(root, 'docs', name), 'utf8');
  const [outline, architecture, quality, lessons] = await Promise.all([read('01-课程大纲.md'), read('02-网站架构.md'), read('03-内容质量与来源规范.md'), loadLessons()]);
  const modules = parseRows(outline).map(r => {
    const id=r[0], type=id[0];
    const expected=type==='T'?6:['E','G'].includes(type)?3:4;
    if(r.length!==expected)throw Error(`规划 ${id} 应有 ${expected} 列，目前 ${r.length} 列。请检查表格格式或转义竖线。`);
    if(type==='T') return {id,type,priority:r[1],title:r[2].split('：')[0],summary:r[2],prerequisites:r[3],role:r[4],research:r[5]};
    return {id,type,title:r[1],summary:r[2],prerequisites:['F','A','D','C'].includes(type)?r[3]||'': '',deliverables:type==='P'?r[3]:''};
  });
  const ids=new Set();
  for(const m of modules){ if(ids.has(m.id)) throw Error(`重复模块 ID: ${m.id}`); ids.add(m.id); }
  for(const m of modules)for(const dependency of m.prerequisites?.match(/[FADCEGTP]\d{2}/g)||[])if(!ids.has(dependency))throw Error(`${m.id} 先修引用不存在: ${dependency}`);
  const nav=parseRows(architecture).filter(r=>r[0][0]==='N').map(r=>({id:r[0],title:r[1],summary:r[2]}));
  const experiments=parseRows(architecture).filter(r=>r[0][0]==='X').map(r=>({id:r[0],title:r[1],summary:r[2]}));
  const sources=parseRows(quality).filter(r=>r[0][0]==='S').map(r=>{
    const match=r[1].match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if(!match) throw Error(`来源链接格式错误: ${r[0]}`);
    return {id:r[0],title:match[1],url:match[2],summary:r[2],retrievedAt:r[3]||'2026-10-12'};
  });
  const sourceIds=new Set(sources.map(s=>s.id));if(sourceIds.size!==sources.length)throw Error('来源ID重复，请检查03文件');
  const lessonIds=new Set();
  for(const l of lessons){
    if(lessonIds.has(l.id)) throw Error(`重复讲义 ID: ${l.id}`); lessonIds.add(l.id);
    if(!ids.has(l.moduleId)) throw Error(`讲义 ${l.id} 的模块已删除: ${l.moduleId}。请同步讲义关联。`);
    for(const s of l.sourceIds) if(!sourceIds.has(s)) throw Error(`讲义 ${l.id} 来源不存在: ${s}`);
    if(l.experimentId && !experiments.some(e=>e.id===l.experimentId)) throw Error(`讲义 ${l.id} 实验不存在`);
    if(!['draft','reviewed','crosschecked'].includes(l.status))throw Error(`讲义 ${l.id} 状态无效`);
    const questions=[l.question,...(l.questions||[])];
    for(const q of questions)if(!q?.prompt||q.options.length<2||!Number.isInteger(q.correct)||q.correct<0||q.correct>=q.options.length||!q.explanation)throw Error(`讲义 ${l.id} 题目不完整`);
    const questionIds=(l.questions||[]).map(q=>q.id);if(questionIds.some(id=>!id)||new Set(questionIds).size!==questionIds.length)throw Error(`讲义 ${l.id} 补充题 ID 无效`);
    if(l.status==='crosschecked'&&l.sections.reduce((n,s)=>n+s.text.length,0)<350)throw Error(`讲义 ${l.id} 缺少实质讲解`);
    if(l.status==='reviewed'||l.status==='crosschecked'){
      if(l.status==='reviewed'&&!/^F0[1-4]$/.test(l.moduleId))throw Error(`目前仅 F01–F04 完成列明来源的核对，其余模块不能自动标为已核对`);
      if(!l.reviewedAt||!l.sourceChecks?.length||l.sections.length<4||!l.examples?.length||!l.pitfalls?.length||questions.length<2)throw Error(`讲义 ${l.id} 缺少核对记录或教学内容`);
      for(const check of l.sourceChecks)if(!l.sourceIds.includes(check.sourceId)||!check.locator||!check.scope)throw Error(`讲义 ${l.id} 核对范围缺失`);
      if(!l.sourceIds.every(id=>l.sourceChecks.some(check=>check.sourceId===id)))throw Error(`讲义 ${l.id} 来源尚未逐项记录`);
    }
  }
  const moduleOrder=new Map(modules.map((m,i)=>[m.id,i]));
  lessons.sort((a,b)=>moduleOrder.get(a.moduleId)-moduleOrder.get(b.moduleId)||(a.order||1)-(b.order||1)||a.id.localeCompare(b.id));
  await mkdir(path.join(root,'src/generated'),{recursive:true});
  await mkdir(path.join(root,'public/planning'),{recursive:true});
  for(const file of ['01-课程大纲.md','02-网站架构.md','03-内容质量与来源规范.md','04-修改与重新生成说明.md','08-全纲内容与核对清单.md']) await copyFile(path.join(root,'docs',file),path.join(root,'public/planning',file));
  const textbooks=JSON.parse(await readFile(path.join(root,'content/textbooks.json'),'utf8'));
  const extraNames=['sources-research','cases','glossary','tracks','projects'];
  const extra=await Promise.all(extraNames.map(name=>readFile(path.join(root,'content',name+'.json'),'utf8').then(JSON.parse)));
  const [sourceDetails,cases,glossary,tracks,projects]=extra;
  for(const d of sourceDetails)if(!sourceIds.has(d.id)||d.modules.some(id=>!ids.has(id)))throw Error('来源定位引用无效 '+d.id);
  for(const c of cases){if(!sourceIds.has(c.sourceId)||c.moduleIds.some(id=>!ids.has(id)))throw Error('案例引用无效 '+c.id);}
  for(const t of glossary)if(!ids.has(t.moduleId))throw Error('术语引用无效 '+t.id);
  for(const p of projects){if(!ids.has(p.id)||p.experimentIds.some(id=>!experiments.some(e=>e.id===id)))throw Error('项目关联无效 '+p.id);}
  const coverage=modules.map(m=>({moduleId:m.id,scope:m.summary,lessonIds:lessons.filter(l=>l.moduleId===m.id).map(l=>l.id),sections:lessons.filter(l=>l.moduleId===m.id).flatMap(l=>l.sections.map((s,i)=>({lessonId:l.id,section:i,title:s.title}))),writingStatus:lessons.some(l=>l.moduleId===m.id)?'讲义已编写':'尚未编写',textbookAudit:['A','D'].includes(m.type)?'指定教材正文待逐节核对':'见每节来源范围'}));
  const data={modules,nav,experiments,sources,lessons,textbooks,sourceDetails,cases,glossary,tracks,projects,coverage};
  await atomicWrite(path.join(root,'src/generated/catalog.json'),JSON.stringify(data,null,2)+'\n');
  await mkdir(path.join(root,'public/curriculum'),{recursive:true});
  for(const l of lessons)await atomicWrite(path.join(root,'public/curriculum',l.id+'.json'),JSON.stringify(l)+'\n');
  const index={...data,lessons:lessons.map(l=>({id:l.id,moduleId:l.moduleId,title:l.title,subtitle:l.subtitle,status:l.status,order:l.order,formula:l.formula,experimentId:l.experimentId,sections:l.sections.map(s=>({title:s.title}))}))};
  await atomicWrite(path.join(root,'src/generated/index.json'),JSON.stringify(index,null,2)+'\n');
  console.log(`同步完成：${modules.length} 个规划条目、${nav.length} 个入口、${lessons.length} 节讲义（${lessons.filter(l=>l.status==='reviewed').length} 节已核对列明内容）。`);
  return data;
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) await syncContent();
