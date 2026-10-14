import {thermalVoltage} from './transistors.mjs';
const positive=(x,n)=>{if(!Number.isFinite(x)||x<=0)throw new RangeError(n+'必须为有限正数');return x};
export function cascade({a1=10,a2=10,rout=1000,rin=1000,c=1e-6,f=1000}){
 for(const [n,x]of Object.entries({a1,a2,rout,rin,c,f}))positive(x,n);
 const loading=rin/(rout+rin),fc=1/(2*Math.PI*(rout+rin)*c),ratio=f/fc;
 const highpass=ratio/Math.sqrt(1+ratio*ratio);
 return {loading,fc,highpass,phase:Math.atan(fc/f),midband:a1*a2*loading,gain:a1*a2*loading*highpass};
}
// isum is the sum of collector currents, not the emitter tail current.
export function differential({vd,isum=1e-3,rc=1000,temp=300,rt=100000}){
 if(!Number.isFinite(vd))throw new RangeError('vd必须有限');for(const [n,x]of Object.entries({isum,rc,rt}))positive(x,n);
 const vt=thermalVoltage(temp),split=Math.tanh(vd/(2*vt)),ic1=isum/2*(1+split),ic2=isum-ic1,gm=isum/(2*vt);
 return {vt,ic1,ic2,gm,output:-rc*(ic1-ic2),linear:-gm*rc*vd,adSingle:-gm*rc/2,adDouble:-gm*rc,acmSingle:-gm*rc/(1+2*gm*rt)};
}
export function mirror({iref=1e-3,beta=100,vout=2,vbe=.7}){
 for(const [n,x]of Object.entries({iref,beta,vbe}))positive(x,n);if(!Number.isFinite(vout))throw new RangeError('vout必须有限');
 const candidate=iref/(1+2/beta),active=vout>vbe;
 return {candidate,active,output:active?candidate:null,baseCurrent:candidate/beta,errorPercent:(iref-candidate)/iref*100};
}
// Hypothetical voltage-feedback, single dominant pole; checks do not emulate clipping or slew limiting.
export function opampBudget({gain=11,gbw=1e6,sr=.5e6,f=10000,vin=.1,vos=.001,center=2.5,min=.2,max=4.8}){
 for(const [n,x]of Object.entries({gain,gbw,sr,f,vin}))positive(x,n);if(![vos,center,min,max].every(Number.isFinite)||min>=max)throw new RangeError('输出边界无效');
 const fcl=gbw/gain,attenuation=1/Math.sqrt(1+(f/fcl)**2),idealPeak=gain*vin,peak=idealPeak*attenuation,offset=vos*gain,dc=center+offset;
 const requiredSr=2*Math.PI*f*peak,headroom=Math.min(max-dc,dc-min);
 return {fcl,attenuation,idealPeak,peak,offset,dc,requiredSr,headroom,slewOK:requiredSr<=sr,swingOK:peak<=headroom,phase:-Math.atan(f/fcl)};
}
