export const STORAGE_KEY='circuit-lab-learning-v1';
export const emptyRecord=()=>({version:1,completed:[],bookmarks:[],notes:{},answers:{},lastLesson:null});
export function validateRecord(value){
  if(!value||typeof value!=='object'||value.version!==1) throw Error('学习记录版本或格式不支持');
  for(const key of ['completed','bookmarks']) if(!Array.isArray(value[key])||value[key].some(v=>typeof v!=='string')) throw Error('课程记录格式错误');
  for(const key of ['notes','answers']) if(!value[key]||Array.isArray(value[key])||typeof value[key]!=='object') throw Error('笔记或练习格式错误');
  if(Object.values(value.notes).some(v=>typeof v!=='string')) throw Error('笔记必须是文本');
  if(Object.values(value.answers).some(v=>!Number.isInteger(v)||v<0||v>30)) throw Error('练习答案格式错误');
  if(value.lastLesson!==null && typeof value.lastLesson!=='string') throw Error('最近课程格式错误');
  return {version:1,completed:[...new Set(value.completed)],bookmarks:[...new Set(value.bookmarks)],notes:{...value.notes},answers:{...value.answers},lastLesson:value.lastLesson};
}
export function mergeRecords(a,b){
  a=validateRecord(a);b=validateRecord(b);
  return {...a,completed:[...new Set([...a.completed,...b.completed])],bookmarks:[...new Set([...a.bookmarks,...b.bookmarks])],notes:{...a.notes,...b.notes},answers:{...a.answers,...b.answers},lastLesson:b.lastLesson||a.lastLesson};
}
