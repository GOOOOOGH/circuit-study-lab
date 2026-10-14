const positive=(x,name)=>{if(!Number.isFinite(x)||x<=0)throw new RangeError(`${name}必须为有限正数`);return x};
const nonnegative=(x,name)=>{if(!Number.isFinite(x)||x<0)throw new RangeError(`${name}必须为有限非负数`);return x};
export const thermalVoltage=t=>positive(t,'温度')*1.380649e-23/1.602176634e-19;
// Candidate forward-active DC point; an invalid candidate is never a saturation solution.
export function bjtBias({vcc,r1,r2,rc,re,beta,vbe=.7}){
 for(const [n,x] of Object.entries({vcc,r1,r2,rc,re,beta,vbe}))positive(x,n);
 const vth=vcc*r2/(r1+r2),rth=r1*r2/(r1+r2);
 const ib=Math.max(0,(vth-vbe)/(rth+(beta+1)*re)),ic=beta*ib,ie=(beta+1)*ib;
 const ve=ie*re,vb=ib?vbe+ve:vth,vc=vcc-ic*rc,vce=vc-ve,vbc=vb-vc;
 const region=ib===0?'cutoff':vbc<0?'active':'invalid';
 return {vth,rth,ib,ic,ie,ve,vb,vc,vce,vbc,region,baseResidual:vth-ib*rth-vb,loopResidual:vcc-ic*rc-vce-ie*re};
}
export function bjtStage({ic,beta,rc,rl,reAC=0,rs=0,rbias=Infinity,temp=300}){
 for(const [n,x]of Object.entries({ic,beta,rc,rl}))positive(x,n);
 nonnegative(reAC,'reAC');nonnegative(rs,'rs');if(rbias!==Infinity)positive(rbias,'rbias');
 const gm=ic/thermalVoltage(temp),rpi=beta/gm,load=rc*rl/(rc+rl),rinBase=rpi+(beta+1)*reAC;
 const rin=1/(1/rinBase+1/rbias),inputRatio=rin/(rin+rs),gain=-beta*load/rinBase;
 return {gm,rpi,load,rinBase,rin,inputRatio,gain,sourceGain:gain*inputRatio};
}
// Long-channel, enhancement NMOS; body tied to source, lambda=0, nonnegative VDS.
export function mosPoint({vgs,vds,vth,k}){
 for(const [n,x]of Object.entries({vgs,vds}))nonnegative(x,n);positive(vth,'vth');positive(k,'k');
 const vov=vgs-vth,region=vov<=0?'cutoff':vds<vov?'linear':'saturation';
 const id=region==='cutoff'?0:region==='linear'?k*(vov*vds-vds*vds/2):k*vov*vov/2;
 const gm=region==='cutoff'?0:region==='linear'?k*vds:k*vov;
 return {vov,region,id,gm,gds:region==='linear'?k*(vov-vds):0};
}
export function jfetBias({idss,vp,rs,rd,vdd}){
 positive(idss,'idss');if(!Number.isFinite(vp)||vp>=0)throw new RangeError('vp必须为有限负数');
 nonnegative(rs,'rs');nonnegative(rd,'rd');positive(vdd,'vdd');
 // Let x=sqrt(ID/IDSS). x + a*x²=1; stable small physical root.
 const a=idss*rs/(-vp),x=2/(1+Math.sqrt(1+4*a)),id=idss*x*x;
 const vgs=-id*rs,vds=vdd-id*(rd+rs),boundary=vgs-vp,gm=2*idss*x/(-vp);
 return {id,vgs,vds,boundary,gm,valid:vds>=boundary,residual:id-idss*(1-vgs/vp)**2};
}
