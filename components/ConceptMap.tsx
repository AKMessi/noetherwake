'use client';
import { useMemo, useRef, useState } from 'react';
import { Minus, Plus, Maximize2, LockKeyhole } from 'lucide-react';
import { ancestors, depth, effective, getKnowledge, missing, plan, type Learner } from '@noetherwake/engine';
import { catalog, concept } from '@/lib/catalog';
interface Props {state:Learner;onSelect:(id:string)=>void;compact?:boolean;selected?:string}
export default function ConceptMap({state,onSelect,compact=false,selected}:Props){
 const [zoom,setZoom]=useState(.65),[mode,setMode]=useState('goal'),[query,setQuery]=useState(''),[graph,setGraph]=useState(false);
 const scroll=useRef<HTMLDivElement>(null),now=Date.now(),path=ancestors(catalog,state.goal),focus=selected??plan(catalog,state,now)[0]?.concept??state.goal;
 const layout=useMemo(()=>{
  const goal=ancestors(catalog,state.goal);goal.add(state.goal);
  let nodes=catalog.filter(c=>mode==='all'||goal.has(c.id));
  if(mode==='near') nodes=catalog.filter(c=>c.id===focus||concept(focus).prerequisites.includes(c.id)||c.prerequisites.includes(focus));
  if(query.trim()) nodes=nodes.filter(c=>c.title.toLowerCase().includes(query.toLowerCase())||c.strand.toLowerCase().includes(query.toLowerCase()));
  if(compact){const root=catalog.find(c=>goal.has(c.id)&&!missing(catalog,state,c.id,now).length&&getKnowledge(state,c.id,now).p<.93);const center=root?.id??focus;const nearby=new Set([center,...concept(center).prerequisites,...catalog.filter(c=>c.prerequisites.includes(center)&&goal.has(c.id)).map(c=>c.id)]);nearby.add(state.goal);nodes=catalog.filter(c=>nearby.has(c.id));}
  const memo=new Map<string,number>(),bands=[...new Set(nodes.map(c=>`${c.domain} / ${c.strand}`))].sort((a,b)=>a.localeCompare(b));
  const pos=new Map<string,{x:number;y:number}>(),labels:{title:string;y:number}[]=[];let y=55;
  const depths=[...new Set(nodes.map(c=>depth(catalog,c.id,memo)))].sort((a,b)=>a-b);
  for(const band of bands){labels.push({title:band,y});const grouped=new Map<number,typeof nodes>();for(const c of nodes.filter(c=>`${c.domain} / ${c.strand}`===band)){const d=depth(catalog,c.id,memo);grouped.set(d,[...(grouped.get(d)??[]),c]);}let rows=1;for(const [d,items]of grouped){items.sort((a,b)=>a.id.localeCompare(b.id));rows=Math.max(rows,items.length);items.forEach((c,i)=>pos.set(c.id,{x:110+depths.indexOf(d)*205,y:y+45+i*75}));}y+=rows*75+55;}
  return{nodes,pos,labels,w:Math.max(440,depths.length*205+100),h:Math.max(220,y)};
 },[state,mode,query,focus,compact]);
 const {nodes,pos,labels,w,h}=layout;
 const fit=()=>setZoom(Math.min(1,(scroll.current?.clientWidth??700)/w));
 return <div className={`concept-map ${compact?'compact-map':''} ${graph?'show-graph':''}`}>
 {!compact&&<><div className="atlas-filter">{[['goal','Goal dependencies'],['all','All concepts'],['near','Selected neighborhood']].map(([id,label])=><button key={id} aria-pressed={mode===id} onClick={()=>{setMode(id);setQuery('');}}>{label}</button>)}<input aria-label="Search atlas" placeholder="Find an idea…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="map-toolbar"><div className="segmented"><button aria-label="Zoom out" onClick={()=>setZoom(Math.max(.12,zoom-.15))}><Minus size={16}/></button><output>{Math.round(zoom*100)}%</output><button aria-label="Zoom in" onClick={()=>setZoom(Math.min(1.8,zoom+.15))}><Plus size={16}/></button></div><button className="text-button" onClick={fit}><Maximize2 size={16}/>Overview</button><button className="text-button" onClick={()=>{setGraph(!graph);scroll.current?.scrollTo({left:0,top:0});}}>Graph / outline</button><span>○ Mathematics · ◇ Physics</span></div><div className="atlas-outline">{nodes.map(c=><button key={c.id} aria-pressed={focus===c.id} onClick={()=>onSelect(c.id)}><span>{c.domain==='math'?'○':'◇'} {c.title}</span><small>{missing(catalog,state,c.id,now).length?'Needs foundations':getKnowledge(state,c.id,now).observations?'Assessed':'Ready'}</small></button>)}{!nodes.length&&<p>No matching ideas. Try a broader search.</p>}</div></>}
 <div ref={scroll} className="map-scroll" tabIndex={compact?undefined:0} aria-label={compact?'Learning frontier preview':'Scrollable knowledge graph'}>
 <svg role="group" aria-label={`${nodes.length} concepts. Dashed outlines mean unassessed. Outer rings mean ready. Copper dashed lines connect mathematics to physics.`} viewBox={`0 0 ${w} ${h}`} style={compact?{width:'100%',height:'100%'}:{width:w*zoom,height:h*zoom,minWidth:'100%'}}>
 {labels.map(l=><text className="atlas-label" key={l.title} x={25} y={l.y}>{l.title.toUpperCase()}</text>)}
 {nodes.flatMap(c=>c.prerequisites.filter(p=>pos.has(p)).map(p=>{const a=pos.get(p)!,b=pos.get(c.id)!,cross=concept(p).domain!==c.domain,related=c.id===focus||p===focus;return <path key={`${p}-${c.id}`} d={`M${a.x},${a.y}C${(a.x+b.x)/2},${a.y} ${(a.x+b.x)/2},${b.y} ${b.x},${b.y}`} fill="none" stroke={cross?'var(--ochre)':path.has(c.id)?'var(--path-line)':'var(--map-line)'} strokeDasharray={cross?'6 4':undefined} strokeWidth={related?3:1.3} opacity={selected&&!related?.35:1}/>;}))}
 {nodes.map((c,index)=>{const pt=pos.get(c.id)!,k=getKnowledge(state,c.id,now),p=effective(k,now),ready=!missing(catalog,state,c.id,now).length,known=k.observations>0;return <g key={c.id} transform={`translate(${pt.x},${pt.y})`} className={`map-node ${focus===c.id?'selected':''}`} role="button" tabIndex={compact||focus===c.id||(!nodes.some(n=>n.id===focus)&&index===0)?0:-1} aria-label={`${c.title}: ${known?`${Math.round(p*100)}% estimated mastery`:'unassessed'}, ${ready?'ready':'prerequisites needed'}`} onClick={()=>onSelect(c.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(c.id);}if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();const next=nodes[(index+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)+nodes.length)%nodes.length];onSelect(next.id);(e.currentTarget.parentElement?.querySelectorAll('[role=button]')[(index+(e.key==='ArrowRight'||e.key==='ArrowDown'?1:-1)+nodes.length)%nodes.length] as SVGElement)?.focus();}}}>
 {ready&&<circle r={22} stroke="var(--green)" fill="none" strokeWidth={1.5}/>}
 {c.domain==='math'?<circle r={15} fill="var(--surface)" stroke="var(--map-node)" strokeWidth={1.5} strokeDasharray={known?undefined:'3 3'}/>:<path d="M0 -17L17 0L0 17L-17 0Z" fill="var(--surface)" stroke="var(--map-node)" strokeWidth={1.5} strokeDasharray={known?undefined:'3 3'}/>}
 {known&&<circle r={10} fill="none" stroke="var(--green)" strokeWidth={4} pathLength={100} strokeDasharray={`${p*100} 100`} transform="rotate(-90)"/>}
 {focus===c.id&&<circle r={4} fill="var(--ochre)"/>}
 <text y={37} textAnchor="middle" fill="var(--ink)" fontSize={12}>{c.title.length>30?c.title.slice(0,28)+'…':c.title}</text>
 </g>;})}
 </svg></div>
 <div className="map-legend"><span>◎ Ready</span><span>◌ Unassessed</span><span>Arc = estimated mastery</span><span>{nodes.length} / {catalog.length} ideas{compact?' · local excerpt':''}</span></div>
 {!compact&&<details className="map-alternative"><summary>Accessible concept list</summary><div className="accessible-map-list">{nodes.map(c=><button key={c.id} onClick={()=>onSelect(c.id)}>{c.title}{missing(catalog,state,c.id,now).length>0&&<LockKeyhole size={12}/>}</button>)}</div></details>}
 </div>;
}
