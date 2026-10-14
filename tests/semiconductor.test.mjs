import test from 'node:test';import assert from 'node:assert/strict';
import {diodePoint,diodeVoltage} from '../src/experiments/semiconductor.mjs';
import {syncContent} from '../scripts/sync-content.mjs';
import {bjtBias,bjtStage,mosPoint,jfetBias,thermalVoltage} from '../src/experiments/transistors.mjs';
const close=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('BJT偏置满足原始节点电流与回路，失效解不标作饱和结果',()=>{
 for(const beta of [40,100,200])for(const rc of [500,2000,8000]){
  const p={vcc:5,r1:33000,r2:18000,rc,re:1000,beta},q=bjtBias(p);
  close((p.vcc-q.vb)/p.r1-q.vb/p.r2,q.ib);close(q.ie,q.ic+q.ib);close(q.ve/p.re,q.ie);close((p.vcc-q.vc)/p.rc,q.ic);close(q.loopResidual,0);close(q.baseResidual,0);
  assert.equal(q.region,q.vbc<0?'active':'invalid');
 }
 assert.equal(bjtBias({vcc:2,r1:100000,r2:2000,rc:2000,re:1000,beta:100}).region,'cutoff');
 assert.equal(bjtBias({vcc:5,r1:10000,r2:50000,rc:8000,re:200,beta:200}).region,'invalid');
});
test('共射源加载由独立小信号KCL核对；旁路不改变DC偏置',()=>{
 for(const reAC of [0,100,1000]){
  const s=bjtStage({ic:.001,beta:100,rc:2000,rl:2000,reAC,rs:1000,rbias:10000});
  const source=.001,vb=source*s.inputRatio,ib=vb/s.rinBase,ve=101*ib*reAC,ic=s.gm*(vb-ve);
  close(ic,100*ib);close((source-vb)/1000,vb/10000+ib);close(-ic*s.load,source*s.sourceGain);
 }
 const s=bjtStage({ic:.001,beta:100,rc:2000,rl:2000,reAC:100,rs:1000,rbias:10000});
 close(s.sourceGain,-6.687299224346761);close(s.gain,-7.883202485444234);
});
test('MOS工作区、电流连续性和gm/gds用数值导数独立验证',()=>{
 for(const [vgs,vds]of [[3,.5],[3,3]]){
  const p={vgs,vds,vth:1,k:.002},q=mosPoint(p),h=1e-6;
  close((mosPoint({...p,vgs:vgs+h}).id-mosPoint({...p,vgs:vgs-h}).id)/(2*h),q.gm);
  close((mosPoint({...p,vds:vds+h}).id-mosPoint({...p,vds:vds-h}).id)/(2*h),q.gds);
 }
 close(mosPoint({vgs:3,vds:2,vth:1,k:.002}).id,.004);
 close(mosPoint({vgs:3,vds:2-1e-7,vth:1,k:.002}).id,.004);
 assert.equal(mosPoint({vgs:1,vds:5,vth:1,k:.002}).region,'cutoff');
});
test('JFET物理根、负载KVL与饱和有效性跨参数核对',()=>{
 for(const idss of [.002,.008,.012])for(const vp of [-6,-4,-1])for(const rs of [0,100,2000]){
  const q=jfetBias({idss,vp,rs,rd:1000,vdd:10});assert.ok(q.vgs>=vp&&q.vgs<=0);assert.ok(q.id>=0&&q.id<=idss);
  close(q.id,idss*(1-q.vgs/vp)**2);close(10-q.vds,q.id*(1000+rs));
  assert.equal(q.valid,q.vds>=q.vgs-vp);
 }
 const p={idss:.008,vp:-4,rs:500,rd:1000,vdd:10},q=jfetBias(p);
 close(q.id,.003055728090000841);close(q.gm,.0024721359549995796);
 assert.equal(q.valid,true);assert.equal(jfetBias({...p,vdd:3}).valid,false);
});
test('新模型拒绝非有限、零除与错误极性',()=>{
 const b={vcc:5,r1:33000,r2:18000,rc:2000,re:1000,beta:100};
 for(const key of Object.keys(b))for(const value of [0,-1,NaN,Infinity])assert.throws(()=>bjtBias({...b,[key]:value}));
 assert.throws(()=>thermalVoltage(0));assert.throws(()=>bjtStage({ic:0,beta:100,rc:1000,rl:1000}));
 assert.throws(()=>mosPoint({vgs:3,vds:-1,vth:1,k:.002}));
 assert.throws(()=>jfetBias({idss:.008,vp:4,rs:500,rd:1000,vdd:10}));
});
test('新增驱动/能量/摆幅/跟随例题独立复算',()=>{
 close(2/(.00048*1.01),4125.412541254126,1e-8);close(2.75/(.001*.99),2777.777777777778,1e-8);
 close(.5*.1*.05**2,.000125);close(.1*.05/20,.00025);close(3**2*.05,.45);close(20e-9*100e3*5,.01);
 const ib=(1.7-.7)/(10000+101000),ic=100*ib,ie=101*ib,vce=5-2000*ic-1000*ie;
 close(vce,2.288288288288288);close(Math.min(ic*1000,vce-.2),.9009009009009009);
 const rpi=100*thermalVoltage(300)/.001;close(50500/(rpi+50500),.9513009279482116);close(1/(1/1000+101/(1000+rpi)),34.28018476204718);
 close(.002*(1.1**2)/2,.00121);close(.002*(.9**2)/2,.00081);
});
test('七节深化保留题目键、直接来源及工作区边界说明',async()=>{
 const c=await syncContent();for(const id of ['L-A01-07','L-A01-08','L-A01-09','L-A01-10','L-A02-01','L-A02-02','L-A02-03']){
  const l=c.lessons.find(l=>l.id===id);assert.equal(l.status,'crosschecked');assert.match(l.review,/正文.*待/);assert.equal(l.examples.length,3);assert.equal(l.questions.length,3);assert.equal(l.sections.length,8);
 }
 for(const [id,s] of [['L-A02-01','S151'],['L-A02-02','S152'],['L-A02-02','S153']])assert.ok(c.lessons.find(l=>l.id===id).sourceChecks.some(x=>x.sourceId===s));
});
test('工作点满足两条方程，零电源及参数边界',()=>{for(const vs of [0,.1,5])for(const r of [100,5000])for(const n of [1,2])for(const is of [1e-15,1e-8]){const q=diodePoint(vs,r,is,n);assert.ok(Math.abs(q.residual)<1e-12);assert.ok(q.current>=0&&q.current<=vs/r);assert.equal(q.voltage,diodeVoltage(q.current,is,n));}for(const args of [[-1,100],[1,0],[NaN,100],[1,100,0],[1,100,1e-12,0]])assert.throws(()=>diodePoint(...args));});
test('增量电阻等于反解曲线局部导数；增加限流电阻降低电流',()=>{const i=.001,h=1e-8,q=diodePoint(diodeVoltage(i)+i*1000,1000);const slope=(diodeVoltage(i+h)-diodeVoltage(i-h))/(2*h);assert.ok(Math.abs(slope/q.rd-1)<1e-8);assert.ok(diodePoint(5,5000).current<diodePoint(5,1000).current);});
test('A01按顺序且不冒充指定教材正文已核对',async()=>{const c=await syncContent(),a=c.lessons.filter(l=>l.moduleId==='A01');assert.equal(a.length,10);assert.deepEqual(a.map(l=>l.order),[1,2,3,4,5,6,7,8,9,10]);for(const l of a.slice(0,6)){assert.equal(l.status,'crosschecked');assert.ok(l.sections.length>=4&&l.examples.length&&l.questions.length);assert.ok(l.sourceChecks.length);assert.match(l.review,/正文仍待/);}assert.equal(c.textbooks[0].isbn,'9787040595338');});
