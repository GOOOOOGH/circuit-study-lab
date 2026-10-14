import {useState} from 'react';
import {STORAGE_KEY,emptyRecord,validateRecord,mergeRecords} from './storage.mjs';
import type {LearningRecord} from './types';
export function useLearning(){
 const [initial]=useState(()=>{try{const text=localStorage.getItem(STORAGE_KEY);return {record:text?validateRecord(JSON.parse(text)):emptyRecord(),writable:true,error:''}}catch{return {record:emptyRecord(),writable:false,error:'已有学习记录无法读取。原始数据已保留，请先导出原始记录，再开始保存。'}}});
 const [error,setError]=useState(initial.error);
 const [record,setRecord]=useState<LearningRecord>(initial.record);
 const writable=initial.writable;
 function update(fn:(r:LearningRecord)=>LearningRecord){setRecord(r=>{const next=fn(r);if(writable)try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setError('')}catch{setError('浏览器存储写入失败。本次记录暂存在页面中，请导出备份。')}return next})}
 function toggle(key:'completed'|'bookmarks',id:string){update(r=>({...r,[key]:r[key].includes(id)?r[key].filter(x=>x!==id):[...r[key],id]}))}
 function setNote(id:string,text:string){update(r=>({...r,notes:{...r.notes,[id]:text}}))}
 function setAnswer(id:string,value:number){update(r=>({...r,answers:{...r.answers,[id]:value}}))}
 function clearAnswer(id:string){update(r=>{const answers={...r.answers};delete answers[id];return {...r,answers}})}
 function visit(id:string){update(r=>({...r,lastLesson:id}))}
 function importRecord(value:unknown){const imported=validateRecord(value);if(!writable)throw Error('请先备份浏览器中无法读取的原始记录，避免覆盖');update(r=>mergeRecords(r,imported));}
 function exportRecord(){download('circuit-lab-learning.json',JSON.stringify(record,null,2),'application/json')}
 function exportRaw(){try{download('circuit-lab-raw-record.txt',localStorage.getItem(STORAGE_KEY)||'无原始记录','text/plain')}catch{setError('无法读取原始记录')}}
 return {record,error,toggle,setNote,setAnswer,clearAnswer,visit,importRecord,exportRecord,exportRaw};
}
export function download(name:string,text:string,type='text/plain'){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export type Learning=ReturnType<typeof useLearning>;
