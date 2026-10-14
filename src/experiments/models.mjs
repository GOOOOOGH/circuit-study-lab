const positive = (value,name) => { if(!Number.isFinite(value)||value<=0) throw new RangeError(`${name} 必须为有限正数`); };
const finite = (value,name) => { if(!Number.isFinite(value)) throw new RangeError(`${name} 必须为有限数值`); };
export function resistor(v,r){ finite(v,'电压'); positive(r,'电阻'); return {current:v/r,power:v*v/r}; }
/** @param {number} v @param {number} r1 @param {number} r2 @param {number|null} rl */
export function divider(v,r1,r2,rl=null){ finite(v,'电压'); positive(r1,'R1'); positive(r2,'R2'); if(rl!==null) positive(rl,'RL'); const lower=rl===null?r2:r2*rl/(r2+rl); return {voltage:v*lower/(r1+lower),current:v/(r1+lower),lower}; }
export function rcVoltage(v,r,c,t,v0=0){ finite(v,'电压'); positive(r,'电阻'); positive(c,'电容'); finite(t,'时间'); finite(v0,'初值'); if(t<0) throw new RangeError('时间不能为负'); return v+(v0-v)*Math.exp(-t/(r*c)); }
export function amplifier(v,rf,rg,limit){ finite(v,'输入'); positive(rf,'Rf'); positive(rg,'Rg'); positive(limit,'限幅'); const gain=1+rf/rg,ideal=v*gain; return {gain,ideal,output:Math.max(-limit,Math.min(limit,ideal)),clipped:Math.abs(ideal)>limit}; }
export function logic(a,b,gate){ if(![0,1].includes(a)||![0,1].includes(b)) throw new RangeError('逻辑输入为 0 或 1'); switch(gate){case 'AND':return a&b;case 'OR':return a|b;case 'XOR':return a^b;default:throw new RangeError('未知逻辑门');} }
/** @param {(x:number)=>number} fn @param {number} count */
export function waveform(fn,count=160){ return Array.from({length:count+1},(_,i)=>[i/count,fn(i/count)]); }
export function prefixConvert(value,fromExponent,toExponent){finite(value,'数值');finite(fromExponent,'原指数');finite(toExponent,'目标指数');const result=value*10**(fromExponent-toExponent);if(!Number.isFinite(result))throw new RangeError('结果超过数值范围');return result;}
export function portBalance(v,i,t){finite(v,'电压');finite(i,'电流');finite(t,'时间');if(t<0)throw new RangeError('时间不能为负');return {power:v*i,charge:i*t,energy:v*i*t};}
/** @param {number} v @param {number} r1 @param {number} r2 @param {number|null} rl */
export function loadedDivider(v,r1,r2,rl=null){const base=divider(v,r1,r2,rl);const i1=(v-base.voltage)/r1,i2=base.voltage/r2,il=rl===null?0:base.voltage/rl;return {...base,i1,i2,il,kcl:i1-i2-il,kvl:v-r1*i1-base.voltage,powerIn:v*i1,powerR1:i1*i1*r1,powerR2:i2*i2*r2,powerLoad:rl===null?0:il*il*rl};}
export function nodeVoltage(v1,v2,r1,r2,r3){finite(v1,'V1');finite(v2,'V2');positive(r1,'R1');positive(r2,'R2');positive(r3,'R3');return (v1/r1+v2/r2)/(1/r1+1/r2+1/r3);}
export function meshCurrents(v1,v2,r1,r2,rs){finite(v1,'V1');finite(v2,'V2');positive(r1,'R1');positive(r2,'R2');positive(rs,'Rs');const a=r1+rs,d=r2+rs,det=a*d-rs*rs;return {i1:(v1*d+rs*v2)/det,i2:(a*v2+rs*v1)/det};}
export function rlCurrent(v,r,l,t,i0=0){finite(v,'电压');positive(r,'电阻');positive(l,'电感');finite(t,'时间');finite(i0,'初值');if(t<0)throw new RangeError('时间不能为负');return v/r+(i0-v/r)*Math.exp(-t*r/l);}
/** Normalized zero-state series RLC voltage step, u = omega0*t. */
export function rlcStep(zeta,u){finite(zeta,'阻尼');finite(u,'时间');if(zeta<0||u<0)throw new RangeError('阻尼与时间不能为负');if(u===0)return 0;if(Math.abs(zeta-1)<1e-8)return 1-(1+u)*Math.exp(-u);if(zeta<1){const b=Math.sqrt(1-zeta*zeta);return 1-Math.exp(-zeta*u)*(Math.cos(b*u)+zeta/b*Math.sin(b*u));}const b=Math.sqrt(zeta*zeta-1),s1=-1/(zeta+b),s2=-zeta-b;return 1+(s2*Math.exp(s1*u)-s1*Math.exp(s2*u))/(s1-s2);}
export function rlcParameters(r,l,c){positive(r,'R');positive(l,'L');positive(c,'C');const omega0=1/Math.sqrt(l*c),alpha=r/(2*l);return {omega0,alpha,zeta:alpha/omega0,criticalR:2*Math.sqrt(l/c),f0:omega0/(2*Math.PI)};}
export function rcFilter(r,c,f,kind='low'){positive(r,'R');positive(c,'C');positive(f,'频率');if(!['low','high'].includes(kind))throw new RangeError('未知滤波类型');const x=2*Math.PI*f*r*c,mag=(kind==='low'?1:x)/Math.hypot(1,x),phase=kind==='low'?-Math.atan(x):Math.PI/2-Math.atan(x);return {mag,phase,db:20*Math.log10(mag),fc:1/(2*Math.PI*r*c)};}
export function probeLoading(v,rs,rp,cp,f){finite(v,'电压');positive(rs,'源阻抗');positive(rp,'输入电阻');positive(cp,'输入电容');positive(f,'频率');const parallel=rs*rp/(rs+rp),tau=parallel*cp,dcGain=rp/(rs+rp),x=2*Math.PI*f*tau;return {dcGain,dcVoltage:v*dcGain,tau,fc:1/(2*Math.PI*tau),rise:Math.log(9)*tau,mag:dcGain/Math.hypot(1,x),phase:-Math.atan(x)};}
export function benchSupply(vset,limit,r){finite(vset,'设定电压');positive(limit,'限流');positive(r,'负载');if(vset<0)throw new RangeError('设定电压不能为负');const voltage=Math.min(vset,limit*r),current=voltage/r;return {voltage,current,power:voltage*current,mode:vset/r>limit?'CC':'CV',boundary:vset/limit};}
