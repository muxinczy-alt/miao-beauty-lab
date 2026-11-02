import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
test('report renders, radar draws and the collage export downloads without an API call',async()=>{
 const operations=[];const ctx=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>k in o?o[k]:(...args)=>operations.push([k,...args])});
 const element=()=>({style:{},value:'',textContent:'',append(){},replaceChildren(){},getContext:()=>ctx,toBlob:cb=>cb({}),click(){operations.push(['download']);}});
 const nodes=new Map();const document={getElementById:id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},createElement:()=>element(),fonts:{ready:Promise.resolve()}};
 const sandbox={document,window:{},Intl,Date,Math,Array,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout(){},navigator:{clipboard:{writeText:async()=>{}}}};
 vm.createContext(sandbox);vm.runInContext(await readFile(new URL('../public/app.js',import.meta.url),'utf8'),sandbox);
 assert.ok(operations.some(op=>op[0]==='lineTo'));assert.match(nodes.get('luckyColor').textContent,/黄|蓝|红|绿|棕|粉/);
 assert.equal(vm.runInContext('totalScore(Array.from({length:6},()=>({score:70})))',sandbox),'70.0');assert.equal(vm.runInContext('totalScore(Array.from({length:6},()=>({score:100})))',sandbox),'100.0');
 await nodes.get('save').onclick();assert.ok(operations.some(op=>op[0]==='download'));assert.match(nodes.get('status').textContent,/已生成/);
});
