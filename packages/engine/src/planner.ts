import type {Action,Concept,Learner,Template} from './types';
import {ancestors,depth,missing,routeToReady} from './graph';
import {dueAt,effective,getKnowledge,predicted,posterior} from './model';
export function plan(graph:Concept[],s:Learner,now:number):Action[]{
 const target=ancestors(graph,s.goal),recent=s.history.slice(-3),failed=s.history.slice(-3).length===3&&s.history.slice(-3).every(e=>!e.correct);const candidates:Action[]=[];
 for(const c of graph){const k=getKnowledge(s,c.id,now),p=effective(k,now),ready=missing(graph,s,c.id,now).length===0;
 const risk=k.observations>0?1-p/k.p:0,relevance=target.has(c.id)?1/(1+.25*target.get(c.id)!):.08;
 let kind:Action['kind']=k.suspicion>.14?'repair':k.observations&&dueAt(k)<now?'review':k.observations===0?'learn':p>.93?'transfer':p>.65?'check':'mixed';
 if(!ready)continue;if(p>.93&&risk<.05&&k.suspicion<.14)continue;
 const success=predicted(p,c.difficulty),gain=(1-p)*success,overload=Math.max(0,c.difficulty-(s.minutes===5?.45:.75)),variety=recent.some(e=>e.concept===c.id)?0:1;
 const score=(2.8*gain+1.5*relevance+1.8*risk+1.6*k.suspicion+.25*variety-1.2*overload-(failed?c.difficulty*.7:0))/Math.sqrt(1+c.difficulty*2);
 let why=kind==='repair'?`A recent error suggests a gap here. Check this prerequisite before returning to the physics.`:kind==='review'?`Your memory is becoming less retrievable. A short recall now protects what you learned.`:kind==='learn'?`Your prerequisites are ready. This opens the next step toward ${graph.find(n=>n.id===s.goal)?.title??'your goal'}.`:kind==='check'?`You have evidence of understanding. An independent check will reduce uncertainty.`:`Mix this with recent work to strengthen retrieval across contexts.`;
 if(failed)why=`Let's reduce the load and use a visual representation. ${why}`;
 candidates.push({concept:c.id,kind,score,why,representation:failed?'geometric':'symbolic'});
 }
 // Suspected locked parent routes to the first ready ancestor rather than recommending locked work.
 for(const c of graph){const k=getKnowledge(s,c.id,now);if(k.suspicion>.14){const id=routeToReady(graph,s,c.id,now),a=candidates.find(a=>a.concept===id);if(a){a.score+=k.suspicion*2;a.kind='repair';a.why=`Check ${graph.find(n=>n.id===id)?.title}: a prerequisite gap may explain the difficulty in ${c.title}.`;}}}
 return candidates.sort((a,b)=>b.score-a.score||a.concept.localeCompare(b.concept));
}
const entropy=(p:number)=>p<=0||p>=1?0:-p*Math.log2(p)-(1-p)*Math.log2(1-p);
export function diagnosticNext(graph:Concept[],s:Learner,now:number):Concept|undefined{
 const relevant=ancestors(graph,s.goal),maxDepth=Math.max(...[...relevant.keys()].map(id=>depth(graph,id)),1);
 return graph.filter(c=>relevant.has(c.id)&&s.diagnostic.filter(id=>id===c.id).length<2).map(c=>{
 const d=depth(graph,c.id)/maxDepth,k=getKnowledge(s,c.id,now);let prior=k.p;
 if(!k.observations){const evidence=s.history.filter(e=>e.diagnostic);const lower=Math.max(0,...evidence.filter(e=>e.correct).map(e=>depth(graph,e.concept)/maxDepth));const upper=Math.min(1,...evidence.filter(e=>!e.correct).map(e=>depth(graph,e.concept)/maxDepth));prior=1/(1+Math.exp(7*(d-(lower+Math.max(lower,upper))/2)));}
 const pc=predicted(prior,c.difficulty),ig=entropy(prior)-pc*entropy(posterior(prior,c.difficulty,true))-(1-pc)*entropy(posterior(prior,c.difficulty,false));
 return {c,score:ig+.08*(1-Math.abs(d-.5))-.16*s.diagnostic.filter(id=>id===c.id).length};}).sort((a,b)=>b.score-a.score||a.c.id.localeCompare(b.c.id))[0]?.c;
}
export function selectTemplate(c:Concept,s:Learner,now:number):Template{return [...c.generators].sort((a,b)=>Math.abs(predicted(effective(getKnowledge(s,c.id,now),now),a.difficulty)-.78)-Math.abs(predicted(effective(getKnowledge(s,c.id,now),now),b.difficulty)-.78))[0];}
export const stage=(s:Learner,id:string,now:number)=>getKnowledge(s,id,now).observations===0?'worked':getKnowledge(s,id,now).observations===1?'faded':'independent';
export function sessionPlan(graph:Concept[],s:Learner,now:number):Action[]{const ranked=plan(graph,s,now),warm=ranked.find(a=>a.kind==='review'||a.kind==='mixed'),fresh=ranked.find(a=>a.kind==='learn'||a.kind==='repair'),result:Action[]=[];for(const a of [warm,fresh,...ranked])if(a&&!result.some(x=>x.concept===a.concept))result.push(a);return result.slice(0,Math.max(3,Math.floor(s.minutes/2)));}
export function estimateFrontier(graph:Concept[],s:Learner){const max=Math.max(...graph.map(c=>depth(graph,c.id)),1),evidence=s.history.filter(e=>e.diagnostic);let best=0,score=-Infinity;for(let frontier=0;frontier<=max;frontier++){let likelihood=0;for(const e of evidence){const pc=depth(graph,e.concept)<=frontier?.9:.12;likelihood+=Math.log(e.correct?pc:1-pc);}if(likelihood>score){score=likelihood;best=frontier;}}return {depth:best,max,probes:evidence.length,uncertain:evidence.length<8};}
