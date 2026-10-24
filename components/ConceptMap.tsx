'use client';
import {useMemo,useState} from 'react';
import {Minus,Plus,Maximize2,ArrowUpRight,LockKeyhole} from 'lucide-react';
import {ancestors,depth,effective,getKnowledge,missing,type Learner} from '@noetherwake/engine';
import {catalog,concept} from '@/lib/catalog';
interface Props{state:Learner;onSelect:(id:string)=>void;compact?:boolean;selected?:string}
export default function ConceptMap({state,onSelect,compact=false,selected}:Props){
 const [zoom,setZoom]=useState(.65),now=Date.now(),path=ancestors(catalog,state.goal);
 const layout=useMemo(()=>{const levels=new Map<number,string[]>(),memo=new Map<string,number>();for(const c of catalog){const d=depth(catalog,c.id,memo);levels.set(d,[...(levels.get(d)??[]),c.id]);}const pos=new Map<string,{x:number;y:number}>();for(const [d,ids] of levels){ids.forEach((id,i)=>pos.set(id,{x:70+d*155,y:80+i*110+(i%2?20:0)}));}return{pos,width:180+Math.max(...levels.keys())*155,height:Math.max(...[...levels.values()].map(x=>x.length))*115+100};},[]);
 const miniIds=['fractions','signed-numbers','ratios','coordinates','slope','equations','functions','limits','derivative','velocity','acceleration','newton-1','newton-2','work','kinetic-energy','potential-energy','conservation-energy'];
 const miniPos=new Map(miniIds.map((id,i)=>[id,{x:65+(i%5)*110,y:65+Math.floor(i/5)*82}]));
 const nodes=compact?catalog.filter(c=>miniIds.includes(c.id)):catalog,pos=compact?miniPos:layout.pos,w=compact?570:layout.width,h=compact?355:layout.height;
 return <div className={`concept-map ${compact?'compact-map':''}`}>
 {!compact&&<div className="map-toolbar"><div className="segmented"><button aria-label="Zoom out" onClick={()=>setZoom(Math.max(.25,zoom-.15))}><Minus size={16}/></button><output>{Math.round(zoom*100)}%</output><button aria-label="Zoom in" onClick={()=>setZoom(Math.min(1.8,zoom+.15))}><Plus size={16}/></button></div><button className="text-button" onClick={()=>setZoom(.35)}><Maximize2 size={15}/> Overview</button><span>Scroll to explore · Tab to select an idea</span></div>}
 <div className="map-scroll" tabIndex={compact?undefined:0} aria-label={compact?'Learning frontier preview':'Scrollable knowledge graph'}>
 <svg role="img" aria-label={`${nodes.length} concepts. Dashed rings mean unassessed. Double rings indicate ready concepts. Lines are prerequisites.`} viewBox={`0 0 ${w} ${h}`} style={compact?{width:'100%',height:'100%'}:{width:w*zoom,height:h*zoom,minWidth:'100%'}}>
 <defs><pattern id={compact?'dots-mini':'dots-full'} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="var(--map-dot)"/></pattern></defs><rect width={w} height={h} fill={`url(#${compact?'dots-mini':'dots-full'})`}/>
 {nodes.flatMap(c=>c.prerequisites.filter(p=>pos.has(p)).map(p=>{const a=pos.get(p)!,b=pos.get(c.id)!;return <path key={`${p}-${c.id}`} d={`M${a.x},${a.y} C${(a.x+b.x)/2},${a.y} ${(a.x+b.x)/2},${b.y} ${b.x},${b.y}`} fill="none" stroke={path.has(c.id)&&path.has(p)?'var(--path-line)':'var(--map-line)'} strokeWidth={path.has(c.id)&&path.has(p)?2:1.2}/>;}))}
 {nodes.map(c=>{const point=pos.get(c.id)!,k=getKnowledge(state,c.id,now),p=effective(k,now),ready=missing(catalog,state,c.id,now).length===0,known=k.observations>0;return <g key={c.id} transform={`translate(${point.x},${point.y})`} className={`map-node ${selected===c.id?'selected':''}`} role="button" tabIndex={0} aria-label={`${c.title}: ${known?`${Math.round(p*100)}% estimated mastery`:'unassessed'}, ${ready?'ready':'prerequisites needed'}`} onClick={()=>onSelect(c.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(c.id);}}}>
 {ready&&<circle r="18" fill="none" stroke="var(--green)" strokeWidth="1" opacity=".5"/>}<circle r="12" fill={known?(p>.8?'var(--green)':p>.4?'var(--ochre)':'var(--surface)'):'var(--surface)'} stroke={ready?'var(--green)':'var(--map-node)'} strokeWidth={known?2:1.5} strokeDasharray={known?'none':'3 3'}/>{known&&<circle r="3" fill={p>.4?'var(--surface)':'var(--ochre)'}/>}<text y="31" textAnchor="middle" fill="var(--muted)" fontSize={compact?9:11} fontFamily="system-ui">{c.title.length>23?c.title.split(' ').slice(0,3).join(' '):c.title}</text></g>;})}
 </svg></div>
 <div className="map-legend"><span><i className="legend-dot ready"/> Ready to learn</span><span><i className="legend-dot known"/> Strong evidence</span><span><i className="legend-dot unknown"/> Unassessed</span>{compact&&<span className="map-count">17 of {catalog.length} ideas <ArrowUpRight size={13}/></span>}</div>
 {!compact&&<details className="map-alternative"><summary>Accessible concept list</summary><div className="accessible-map-list">{catalog.map(c=><button key={c.id} onClick={()=>onSelect(c.id)}>{c.title}{missing(catalog,state,c.id,now).length>0&&<LockKeyhole size={12}/>}</button>)}</div></details>}
 </div>;
}
