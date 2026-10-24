import {readdir,readFile,writeFile} from 'node:fs/promises';
import matter from 'gray-matter';
import katex from 'katex';
import {compile} from '@mdx-js/mdx';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import {conceptSchema} from '../lib/content-schema';
import {arithmetic,dimension,generate,validateGraph} from '../packages/engine/src';
import type {Concept} from '../packages/engine/src';
const quick=process.argv.includes('--quick'),variants=quick?3:1000,files=(await readdir('content/concepts')).filter(f=>f.endsWith('.mdx')).sort(),graph:Concept[]=[],bodies=new Map<string,string>();
for(const file of files){const {data,content}=matter(await readFile(`content/concepts/${file}`,'utf8'));const c=conceptSchema.parse(data);graph.push(c);bodies.set(c.id,content);}
const errors=validateGraph(graph),ids=new Set(graph.map(c=>c.id));let count=0;
for(const c of graph){const body=bodies.get(c.id)!;for(const name of ['Intuition','Formalism','Worked example','Where it breaks'])if(!body.includes(`## ${name}`))errors.push(`${c.id}: missing ${name}`);
 for(const link of body.matchAll(/concept:([a-z0-9-]+)/g))if(!ids.has(link[1]))errors.push(`${c.id}: broken ${link[1]}`);
 for(const d of c.derivation){if(!ids.has(d.concept))errors.push(`${c.id}: broken rule link`);try{katex.renderToString(d.expression,{throwOnError:true});}catch(e){errors.push(`${c.id}: bad derivation math ${e}`);}}
 for(const math of body.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g))try{katex.renderToString(math[1]??math[2],{throwOnError:true});}catch(e){errors.push(`${c.id}: bad math ${e}`);}
 try{await compile(body,{remarkPlugins:[remarkMath]});}catch(e){errors.push(`${c.id}: MDX failed ${e}`);}
 c.html=String(await unified().use(remarkParse).use(remarkMath).use(remarkRehype).use(rehypeKatex).use(rehypeStringify).process(body));
 for(const template of c.generators){dimension(template.unit);for(let seed=0;seed<variants;seed++){const item=generate(c,template,seed);if(/\{[a-z]+\}/.test(item.prompt+item.answer))errors.push(`${template.id}: unresolved parameter`);if(!['symbolic','choice','ordering','error','proof'].includes(item.kind)){const answer=arithmetic(item.answer);if(Math.abs(answer)>1e10)errors.push(`${template.id}: implausible magnitude`);}if(item.choices&&!item.choices.some(o=>o.text===item.answer))errors.push(`${template.id}: no correct choice`);count++;}}
 for(let a=c.interactive.min;a<=c.interactive.max;a++)for(let x=.1;x<=5;x+=.5)arithmetic(c.interactive.formula,{a,x});
}
if(errors.length)throw Error([...new Set(errors)].join('\n'));
await writeFile('lib/catalog.generated.json',JSON.stringify(graph));
console.log(`${graph.length} concepts; ${graph.reduce((s,c)=>s+c.generators.length,0)} templates; ${count.toLocaleString()} verified variants. DAG, MDX, links, math, units and interactive formulas valid.`);
