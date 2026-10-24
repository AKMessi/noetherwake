import {readdir,readFile,stat,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
async function walk(path:string):Promise<string[]>{return(await Promise.all((await readdir(path,{withFileTypes:true})).map(x=>x.isDirectory()?walk(`${path}/${x.name}`):[`${path}/${x.name}`]))).flat();}
const files=await walk('out');let total=0,maxChunk=0,js=0;for(const file of files){total+=(await stat(file)).size;if(file.endsWith('.js')){const size=gzipSync(await readFile(file)).length;js+=size;maxChunk=Math.max(maxChunk,size);}}
const metrics={totalBytes:total,gzippedJavaScriptBytes:js,maxGzippedChunkBytes:maxChunk,budgets:{total:12_000_000,javascript:2_000_000,chunk:700_000}};
console.log(JSON.stringify(metrics,null,2));await writeFile('docs/build-metrics.json',JSON.stringify(metrics,null,2)+'\n');if(total>12_000_000||js>2_000_000||maxChunk>700_000)throw Error('Static asset budget exceeded.');
