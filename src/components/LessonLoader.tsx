import {useEffect,useState} from 'react';
import type {Lesson,Catalog,Navigate} from '../lib/types';
import type {Learning} from '../lib/useLearning';
import {LessonPage} from './LessonPage';
const cache=new Map<string,Lesson>();
export function LessonLoader({lessonId,catalog,navigate,learning}:{lessonId:string;catalog:Catalog;navigate:Navigate;learning:Learning}){
 const [lesson,setLesson]=useState<Lesson|undefined>(()=>cache.get(lessonId)),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 useEffect(()=>{const controller=new AbortController();let live=true;setError('');const cached=cache.get(lessonId);if(cached){setLesson(cached);return()=>{live=false;controller.abort()}}setLesson(undefined);fetch('/curriculum/'+encodeURIComponent(lessonId)+'.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('课程加载失败，请检查连接后重试');return r.json()}).then((data:Lesson)=>{if(data.id!==lessonId||!Array.isArray(data.sections))throw Error('课程文件与索引不一致');if(live){cache.set(lessonId,data);setLesson(data)}}).catch(e=>{if(live&&!controller.signal.aborted)setError(e instanceof Error?e.message:'加载失败')});return()=>{live=false;controller.abort()}},[lessonId,attempt]);
 if(error)return <div className="empty-state" role="alert"><h2>暂时无法读取课程</h2><p>{error}</p><button className="secondary" onClick={()=>setAttempt(a=>a+1)}>重试</button></div>;
 if(!lesson)return <div className="status-note" role="status">正在读取本地编写的课程内容…</div>;
 return <LessonPage lesson={lesson} catalog={catalog} navigate={navigate} learning={learning}/>;
}
