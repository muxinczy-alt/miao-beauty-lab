import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
test('report renders, radar draws and the collage export downloads without an API call',async()=>{
 const operations=[];const ctx=new Proxy({measureText:t=>({width:t.length*20})},{get:(o,k)=>k in o?o[k]:(...args)=>operations.push([k,...args])});
 const element=()=>({style:{},value:'',textContent:'',append(){},replaceChildren(){},setAttribute(){},focus(){},scrollIntoView(){},getContext:()=>ctx,toBlob:cb=>cb({}),click(){operations.push(['download']);}});
 const nodes=new Map();const document={getElementById:id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},createElement:()=>element(),fonts:{ready:Promise.resolve()}};
 const sandbox={document,window:{},Intl,Date,Math,Array,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},setTimeout(){},navigator:{clipboard:{writeText:async()=>{}}}};
 vm.createContext(sandbox);vm.runInContext(await readFile(new URL('../public/app.js',import.meta.url),'utf8'),sandbox);
 nodes.get('demo').onclick();
 assert.ok(operations.some(op=>op[0]==='lineTo'));assert.match(nodes.get('luckyColor').textContent,/黄|蓝|红|绿|棕|粉/);
 assert.equal(vm.runInContext('totalScore(Array.from({length:8},()=>({score:70})))',sandbox),'70.0');assert.equal(vm.runInContext('totalScore(Array.from({length:8},()=>({score:100})))',sandbox),'100.0');
 await nodes.get('save').onclick();assert.ok(operations.some(op=>op[0]==='download'));assert.match(nodes.get('status').textContent,/已生成/);
 const layouts=vm.runInContext(`(()=>{const ctx=document.createElement('canvas').getContext('2d');const small=cardLayout(ctx,demo,dailyLuck(),'短名字');const large=JSON.parse(JSON.stringify(demo));large.title='一个更长但必须完整显示的专属称号';large.summary='眼睛明亮，毛色有层次。'.repeat(16);large.dimensions.forEach(d=>d.detail='细节必须完整换行。'.repeat(18));return [small,cardLayout(ctx,large,dailyLuck(),'名字也需要完整显示')];})()`,sandbox);
 assert.ok(layouts[1].height>layouts[0].height);assert.equal(layouts[1].rows.length,4);assert.ok(layouts[1].footerY>layouts[1].notesY+layouts[1].notesH);assert.ok(layouts[1].height>layouts[1].footerY);
 assert.equal(vm.runInContext(`textLines(document.createElement('canvas').getContext('2d'),'长文字测试必须完整保留',60).join('')`,sandbox),'长文字测试必须完整保留');
});
