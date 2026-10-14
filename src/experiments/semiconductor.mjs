const positive=(x,name)=>{if(!Number.isFinite(x)||x<=0)throw new RangeError(`${name} 必须为有限正数`);return x};
export function diodePoint(vs,r,is=1e-12,n=1){
 if(!Number.isFinite(vs)||vs<0)throw new RangeError('电源必须为有限非负值');
 positive(r,'R');positive(is,'IS');positive(n,'n');
 const vt=1.380649e-23*300/1.602176634e-19,a=n*vt;
 let lo=0,hi=vs/r;
 for(let k=0;k<100;k++){const i=(lo+hi)/2;const f=r*i+a*Math.log1p(i/is)-vs;if(f>0)hi=i;else lo=i;}
 const current=(lo+hi)/2,voltage=a*Math.log1p(current/is);
 return {current,voltage,vt,rd:a/(current+is),residual:vs-r*current-voltage};
}
export function diodeVoltage(i,is=1e-12,n=1){if(!Number.isFinite(i)||i<0)throw new RangeError('电流必须非负');positive(is,'IS');positive(n,'n');return n*(1.380649e-23*300/1.602176634e-19)*Math.log1p(i/is)}
