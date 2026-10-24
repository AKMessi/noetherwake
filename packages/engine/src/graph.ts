import type {Concept,Learner} from './types';
import {effective,getKnowledge} from './model';
export function validateGraph(graph:Concept[]):string[]{
 const errors:string[]=[],ids=new Set(graph.map(c=>c.id));if(ids.size!==graph.length)errors.push('Duplicate concept IDs');const visiting=new Set<string>(),seen=new Set<string>();
 function visit(id:string){if(visiting.has(id)){errors.push(`Cycle at ${id}`);return;}if(seen.has(id))return;visiting.add(id);for(const p of graph.find(c=>c.id===id)?.prerequisites??[]){if(!ids.has(p))errors.push(`Missing prerequisite ${p} from ${id}`);else visit(p);}visiting.delete(id);seen.add(id);}
 for(const c of graph){visit(c.id);for(const p of c.softPrerequisites)if(!ids.has(p))errors.push(`Missing soft prerequisite ${p}`);if(c.generators.length<3)errors.push(`Insufficient items: ${c.id}`);}
 return [...new Set(errors)];
}
export function ancestors(graph:Concept[],id:string):Map<string,number>{const dist=new Map<string,number>([[id,0]]),queue=[id];while(queue.length){const n=queue.shift()!;for(const p of graph.find(c=>c.id===n)?.prerequisites??[]){if(!dist.has(p)){dist.set(p,dist.get(n)!+1);queue.push(p);}}}return dist;}
export function depth(graph:Concept[],id:string,memo=new Map<string,number>()):number{if(memo.has(id))return memo.get(id)!;const c=graph.find(c=>c.id===id);const d=c?.prerequisites.length?1+Math.max(...c.prerequisites.map(p=>depth(graph,p,memo))):0;memo.set(id,d);return d;}
export const missing=(graph:Concept[],s:Learner,id:string,now:number)=>graph.find(c=>c.id===id)?.prerequisites.filter(p=>effective(getKnowledge(s,p,now),now)<.8)??[];
export function routeToReady(graph:Concept[],s:Learner,id:string,now:number):string{const parents=missing(graph,s,id,now).sort((a,b)=>effective(getKnowledge(s,a,now),now)-effective(getKnowledge(s,b,now),now));return parents.length?routeToReady(graph,s,parents[0],now):id;}
