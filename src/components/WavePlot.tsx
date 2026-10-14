export function Plot({series,max=1,axis='t / τ',marker,signed=false,unit='V'}:{series:{name:string;color:string;points:number[][]}[];max?:number;axis?:string;marker?:number;signed?:boolean;unit?:string}){
 const sy=(v:number)=>signed?130-v/max*85:190-v/max*130;
 return <><svg viewBox="0 0 480 265" className="plot" role="img" aria-label={series.map(s=>s.name).join('与')+'波形；横轴 '+axis}>
  {(signed?[-1,-.5,0,.5,1]:[0,.25,.5,.75,1]).map(n=><g key={n}><path d={`M55 ${sy(n*max)}H445`} stroke="#e2e9e6" strokeDasharray="3 5"/><text x="7" y={sy(n*max)+4} fill="#6b787e" fontSize="11">{(n*max).toFixed(1)} {unit}</text></g>)}
  <path d="M55 35V220H445" stroke="#a7b8b0" fill="none"/>
  {series.map(s=><path key={s.name} d={s.points.map(([x,y],i)=>`${i?'L':'M'}${55+x*390},${sy(y)}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2.4"/>)}
  {marker!==undefined&&<path d={`M${55+marker*390} 40V220`} stroke="#a37937" strokeDasharray="5 4"/>}
  <text x="250" y="252" textAnchor="middle" fill="#657571" fontSize="10">{axis}</text>
 </svg><div className="legend">{series.map(s=><span key={s.name}><i style={{background:s.color}}/>{s.name}</span>)}</div></>;
}
