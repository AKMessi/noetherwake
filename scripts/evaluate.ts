import {writeFileSync} from 'node:fs';
import {createLearner,observe,initialKnowledge,rng,plan,diagnosticNext,depth,estimateFrontier} from '../packages/engine/src/index';
import {fixture} from '../packages/engine/test/fixtures';
const graph=fixture(),now=1700000000000,students=160;let error=0,brier=0,total=0,placement=0;
for(let seed=1;seed<=students;seed++){const random=rng(seed);let state=createLearner(now,'n7');const frontier=seed%8;
 for(let j=0;j<18;j++){const c=diagnosticNext(graph,state,now);if(!c)break;state=observe(state,{concept:c.id,item:'diagnostic',correct:random()<(depth(graph,c.id)<=frontier?.9:.12),seconds:60,expectedSeconds:60,hints:0,attempts:1,confidence:.7,difficulty:c.difficulty,at:now,diagnostic:true},graph);}placement+=Math.abs(estimateFrontier(graph,state).depth-frontier)/7;
 for(const c of graph){const known=random()<.5;let s=createLearner(now);for(let j=0;j<28;j++)s=observe(s,{concept:c.id,item:'static',correct:random()<(known?.9:.12),seconds:60,expectedSeconds:60,hints:0,attempts:1,confidence:.7,difficulty:c.difficulty,at:now,diagnostic:true},graph);const p=s.knowledge[c.id].p;error+=Math.abs(p-Number(known));brier+=(p-Number(known))**2;total++;}}
function policy(kind:'planner'|'linear'|'random'){
 let sum=0,reached=0;const lengths:number[]=[];
 for(let seed=1;seed<=students;seed++){const random=rng(seed+1000),latent=Object.fromEntries(graph.map(c=>[c.id,seed%4===0&&Number(c.id.slice(1))%8<2]));let state=createLearner(now,'n23'),step=0;
 for(;step<400;step++){
 const ready=graph.filter(c=>c.prerequisites.every(id=>(state.knowledge[id]?.p??.25)>=.8));
 let id:string|undefined;
 if(kind==='planner')id=plan(graph,state,now)[0]?.concept;
 if(kind==='linear')id=ready.find(c=>(state.knowledge[c.id]?.p??.25)<.93)?.id;
 if(kind==='random')id=ready[Math.floor(random()*ready.length)]?.id;
 if(!id)break;
 const c=graph.find(c=>c.id===id)!;const prepared=c.prerequisites.every(p=>latent[p]);
 if(!latent[id]&&random()<(prepared?.38:.015))latent[id]=true;
 const correct=random()<(latent[id]?.9:.12);
 state=observe(state,{concept:id,item:'policy',correct,seconds:60,expectedSeconds:60,hints:0,attempts:1,confidence:.7,difficulty:c.difficulty,at:now},graph);
 if(latent.n23&&Array.from({length:8},(_,i)=>`n${16+i}`).every(p=>latent[p])){reached++;step++;break;}}
 sum+=step;lengths.push(step);}
 lengths.sort((a,b)=>a-b);return {meanSteps:sum/students,medianSteps:lengths[Math.floor(students/2)],goalRate:reached/students};}
const policies={planner:policy('planner'),linear:policy('linear'),random:policy('random')};
const metrics={seedRange:[1,students],students,estimatorMAE:error/total,estimatorBrier:brier/total,diagnosticNormalizedDepthMAE:placement/students,policies};
console.log(JSON.stringify(metrics,null,2));writeFileSync('docs/eval-results.json',JSON.stringify(metrics,null,2)+'\n');
writeFileSync('docs/EVAL.md',`# Synthetic evaluation\n\nReproduce: \`npm run eval\`. Fixed seeds 1–${students}; ${students} synthetic students. These are simulations, not people or evidence of classroom efficacy.\n\n| Measure | Result |\n| --- | ---: |\n| Estimator absolute error after 28 probes | ${(error/total).toFixed(4)} |\n| Estimator Brier error | ${(brier/total).toFixed(4)} |\n| Diagnostic frontier depth MAE / max depth (18 probes) | ${(placement/students).toFixed(4)} |\n| Planner mean / median actions | ${policies.planner.meanSteps.toFixed(1)} / ${policies.planner.medianSteps} |\n| Linear syllabus mean / median actions | ${policies.linear.meanSteps.toFixed(1)} / ${policies.linear.medianSteps} |\n| Random ready-node mean / median actions | ${policies.random.meanSteps.toFixed(1)} / ${policies.random.medianSteps} |\n| Goal completion: planner / linear / random | ${Object.values(policies).map(p=>(100*p.goalRate).toFixed(1)+'%').join(' / ')} |\n\n## Protocol and limitations\n\nThe benchmark graph has three disjoint eight-node chains. The target is the last chain. The linear baseline follows all chains in syllabus order; random samples unlocked concepts; the planner knows the goal. All share the same mastery gate, transition probability, response noise, seeds and 400-action cap. Baselines are deliberately simple and do not represent a modern adaptive competitor. Goal relevance gives a structural advantage here; this is an implementation sanity check, not a general theorem about speed.\n\nHidden mastery is binary. Prepared students learn with probability .38 per opportunity, unprepared .015; mastered correctness .90, unmastered .12. One quarter start knowing two concepts per chain. Policy metrics include capped failures. Static estimator tests use independent Bernoulli responses with no learning transition; 3,840 concept/student pairs. Diagnostic tests use hidden frontier depths 0–7, with .90/.12 response noise; the MLE frontier is compared against the true frontier. The estimator is deliberately tested under slight slip-model mismatch.\n\nThe graph is smaller and simpler than the authored curriculum. No benchmark models human fatigue, partial knowledge, hint seeking, transfer or differential item functioning. Content parameters require real calibration. Timing/LCP and accessibility results are recorded in docs/VERIFICATION.md after browser checks.\n`);
if(error/total>.18||placement/students>.24||policies.planner.meanSteps>=policies.linear.meanSteps||policies.planner.meanSteps>=policies.random.meanSteps||policies.planner.goalRate<.9)throw Error('Simulation acceptance threshold failed; inspect results.');
