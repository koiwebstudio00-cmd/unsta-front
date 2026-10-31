import test from 'node:test';
import assert from 'node:assert/strict';
import {api,ApiError} from '../src/lib/client-api.ts';
test('client sends structured body as a single JSON object and preserves message id',async t=>{
 const body={text:'Hola',client_message_id:'fixed-id'};
 t.mock.method(globalThis,'fetch',async(url,options)=>{assert.equal(url,'/api/demo/conversations/id/messages');assert.deepEqual(JSON.parse(options.body),body);assert.equal(options.headers['Content-Type'],'application/json');return Response.json({ok:true});});
 assert.deepEqual(await api('conversations/id/messages',{method:'POST',body}),{ok:true});
});
test('failed writes surface the error instead of appearing saved',async t=>{t.mock.method(globalThis,'fetch',async()=>Response.json({error:{message:'Conversación cerrada'}},{status:409}));await assert.rejects(api('conversations/id/messages',{method:'POST',body:{text:'hola'}}),e=>e instanceof ApiError&&e.status===409&&e.message==='Conversación cerrada');});
