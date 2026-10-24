import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
async function walk(dir:string):Promise<string[]>{const entries=await readdir(dir,{withFileTypes:true});return(await Promise.all(entries.map(e=>e.isDirectory()?walk(`${dir}/${e.name}`):Promise.resolve([`${dir}/${e.name}`])))).flat();}
const assets=(await walk('out')).filter(f=>!f.endsWith('.map')&&!f.endsWith('sw.js')).map(f=>'/'+f.slice(4));assets.push('/');
const version=createHash('sha256').update(assets.join('|')+await readFile('out/index.html','utf8')).digest('hex').slice(0,12);
await writeFile('out/sw.js',`const CACHE='noetherwake-${version}';const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('noetherwake-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()).then(()=>self.clients.matchAll()).then(clients=>clients.forEach(c=>c.postMessage('OFFLINE_READY')))));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('/index.html')));return;}event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));});`);
console.log(`Offline cache: ${assets.length} same-origin assets; version ${version}.`);
