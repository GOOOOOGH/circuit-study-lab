import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {divider} from '../src/experiments/models.mjs';
import {diodePoint} from '../src/experiments/semiconductor.mjs';
import {inversePark,clarkePark,svpwm,pipeline,socEstimate} from '../src/experiments/advanced.mjs';
export function projectVerification(){
 const p=divider(5,1000,1000,1000),tau=.001,rc=5*(1-Math.exp(-1)),diode=diodePoint(5,1000),v=inversePark(0,1,0),back=clarkePark(v.a,v.b,v.c,0),pwm=svpwm(4,0,12),flow=pipeline([5,4,15,2,1,1],1000/30),soc=socEstimate(.8,1,.5,2);
 const results={P00:{loadedDividerV:p.voltage,rcAtTauV:rc,tauSeconds:tau,diodeCurrentA:diode.current,kvlResidualV:diode.residual},P01:{bytesPerImuSample:20,payloadBytesPerSecond:20000,uart8N1MinimumBitsPerSecond:200000},P02:{phaseCurrentsA:[v.a,v.b,v.c],backDqA:[back.d,back.q],duties:pwm.duties,feasible:pwm.feasible},P03:{twoRaw10BitsPerSecond:1920*1080*10*30*2,pipelineServiceMs:flow.service,firstLatencyMs:flow.jobs[0].latency,lastQueueMs:flow.jobs.at(-1).queue},P04:{socAfterDischarge:soc.soc,regenerationCapEnergyJ:.5*.01*(26**2-24**2),staleResultAccepted:40<=30}};
 return {type:'原创教学模型验证；不是硬件实测',conditions:'条件见各键单位与对应项目讲义；无真实电池/机构/高压台架',results};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const data=projectVerification();const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');for(const [id,result]of Object.entries(data.results)){const dir=path.join(root,'public/projects',id);await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'教学模型预期结果.json'),JSON.stringify({type:data.type,conditions:data.conditions,result},null,2)+'\n');}console.log(JSON.stringify(data,null,2));}
