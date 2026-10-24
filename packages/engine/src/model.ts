import type {Concept,Evidence,Knowledge,Learner} from './types';
export const DAY=86400000;
export const clamp=(x:number,a=.001,b=.999)=>Math.max(a,Math.min(b,x));
export const initialKnowledge=(now:number):Knowledge=>({p:.25,n:0,stability:1,last:now,observations:0,fluent:0,effortful:0,failures:0,suspicion:0,confidenceError:0});
export const createLearner=(now:number,goal='newton-2'):Learner=>({version:1,goal,minutes:15,knowledge:{},history:[],diagnostic:[],onboarded:false,theme:'system',accessibleFont:false,sessions:[],reflection:''});
export const getKnowledge=(s:Learner,id:string,now:number)=>s.knowledge[id]??initialKnowledge(now);
export const retrievability=(k:Knowledge,now:number)=>Math.exp(-Math.LN2*Math.max(0,now-k.last)/DAY/k.stability);
export const effective=(k:Knowledge,now:number)=>k.p*(.35+.65*retrievability(k,now));
export const dueAt=(k:Knowledge)=>k.last-k.stability*Math.log(.9)/Math.LN2*DAY;
export function interval(k:Knowledge):[number,number]{const a=1+k.n*k.p,b=1+k.n*(1-k.p),sd=Math.sqrt(a*b/((a+b)**2*(a+b+1)));return [clamp(k.p-1.96*sd,0,1),clamp(k.p+1.96*sd,0,1)];}
export const predicted=(p:number,d:number,g=.12)=>p*(1-(.06+.16*d))+(1-p)*g;
export function posterior(p:number,d:number,correct:boolean,g=.12){const slip=.06+.16*d;return correct?p*(1-slip)/predicted(p,d,g):p*slip/(p*slip+(1-p)*(1-g));}
const logit=(p:number)=>Math.log(clamp(p)/(1-clamp(p)));
export function observe(state:Learner,e:Evidence,graph:Concept[]):Learner{
 const k=getKnowledge(state,e.concept,e.at),q=effective(k,e.at);
 let w=clamp((1-.22*e.hints)/(1+.18*(e.attempts-1)),.15,1);if(e.seconds<.18*e.expectedSeconds)w*=.35;
 // A fully revealed answer provides no independent evidence.
 if(e.hints>=3)w=0;
 const b=posterior(q,e.difficulty,e.correct,e.guess),z=logit(q)+w*(logit(b)-logit(q));let p=1/(1+Math.exp(-z));
 if(e.correct&&!e.diagnostic)p+=(1-p)*.025*w;
 if(e.correct&&e.hints>0&&k.p<.8)p=Math.min(p,.79);
 const fluent=e.correct&&e.hints===0&&e.attempts===1&&e.seconds<=1.5*e.expectedSeconds;
 const next:Knowledge={...k,p:clamp(p),n:k.n+w,last:e.at,observations:k.observations+(w>0?1:0),fluent:k.fluent+(fluent?1:0),effortful:k.effortful+(e.correct&&!fluent?1:0),failures:e.correct?0:k.failures+1,suspicion:k.suspicion*.35,confidenceError:(k.confidenceError*k.observations+(e.confidence-Number(e.correct))**2)/(k.observations+1),stability:w===0?k.stability:e.correct?k.stability*(e.hints?1.08:1.6+.6*retrievability(k,e.at)):Math.max(.2,k.stability*.5)};
 const knowledge={...state.knowledge,[e.concept]:next};
 for(const id of graph.find(c=>c.id===e.concept)?.prerequisites??[]){const parent={...getKnowledge(state,id,e.at)};if(e.correct&&e.hints===0)parent.p=clamp(parent.p+.05*w*(1-parent.p));else if(!e.correct)parent.suspicion=clamp(parent.suspicion+w*(.18+(e.confidence>.75?.08:0)),0,1);knowledge[id]=parent;}
 return {...state,knowledge,history:[...state.history,e].slice(-3000),diagnostic:e.diagnostic?[...state.diagnostic,e.concept]:state.diagnostic};
}
