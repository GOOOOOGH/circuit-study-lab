import {useEffect,useState} from 'react';
import {Play,Pause,SkipForward,RotateCcw} from 'lucide-react';
export function Slider({label,value,onChange,min,max,step=1,unit}:{label:string;value:number;onChange:(v:number)=>void;min:number;max:number;step?:number;unit:string}){
 return <label className="slider-field"><span>{label}<strong>{Number(value.toFixed(3))} {unit}</strong></span><input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>;
}
export function Metrics({items}:{items:[string,string][]}){return <div className="metrics">{items.map(([name,value])=><div key={name}><span>{name}</span><strong>{value}</strong></div>)}</div>}
export function Transport({playing,setPlaying,step,reset}:{playing:boolean;setPlaying:(b:boolean)=>void;step:()=>void;reset:()=>void}){
 const [systemReduced,setSystemReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches),[manualReduced,setManualReduced]=useState(false);const reduced=systemReduced||manualReduced;
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{setSystemReduced(media.matches);if(media.matches)setPlaying(false)};media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[setPlaying]);
 return <div className="transport"><button className="primary small" disabled={reduced} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'暂停':'播放'}</button><button className="secondary small" onClick={()=>{setPlaying(false);step()}}><SkipForward size={15}/>单步</button><button className="text-button" onClick={()=>{setPlaying(false);reset()}}><RotateCcw size={14}/>重置</button><label className="check-label motion-control"><input type="checkbox" checked={reduced} disabled={systemReduced} onChange={e=>{setManualReduced(e.target.checked);if(e.target.checked)setPlaying(false)}}/>减少连续动态</label></div>}
