import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';
const compile = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString('base64');
const grocery = compile(readFileSync(new URL('../worker/grocery-flow.ts', import.meta.url), 'utf8'));
const meal = compile(readFileSync(new URL('../worker/meal-planner.ts', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../worker/index.ts', import.meta.url), 'utf8').replace('import handler from "vinext/server/app-router-entry";', 'const handler = { fetch: () => new Response("unused") };').replace('"./grocery-flow"', JSON.stringify(grocery)).replace('"./meal-planner"', JSON.stringify(meal));
const { default: worker, handleGroceryReply, wakeGroceryExecutor, interpretIntent, applyOwnerPlanChanges, sendPendingEveningVoice } = await import(compile(source));
function setup() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../drizzle/0001_icy_vulcan.sql', import.meta.url), 'utf8'));
  sqlite.exec(readFileSync(new URL('../drizzle/0002_fat_greymalkin.sql', import.meta.url), 'utf8'));
  for (const filename of ['0003_bizarre_blazing_skull.sql', '0004_graceful_owl.sql']) sqlite.exec(readFileSync(new URL('../drizzle/' + filename, import.meta.url), 'utf8'));
  sqlite.prepare("INSERT INTO grocery_requests (id,source_message_id,ingredients_json,created_at) VALUES ('r1','m1','[\"dahi\"]','2026-10-01')").run();
  const DB = { prepare(sql) { let args = []; return { bind(...values) { args = values; return this; }, async first() { return sqlite.prepare(sql).get(...args) ?? null; }, async all() { return { results: sqlite.prepare(sql).all(...args) }; }, async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...args).changes) } }; } }; } };
  DB.batch = async statements => Promise.all(statements.map(statement=>statement.run()));
  return { sqlite, env: { DB, SETUP_TOKEN: 'test-secret', OWNER_PHONE: 'test-owner' } };
}
const preview = () => ({ historyCheck: {source:'zepto',checkedAt:new Date().toISOString(),productVariantIds:['p1']}, items: [{ name: 'Dahi', packSize: '390g', quantity: 1, pricePaise: 3500, productVariantId: 'p1', storeProductId: 's1', historicalMatch: true }], addressId: 'a1', addressLabel: 'Home', addressType: 'HOME', paymentMethod: 'WALLET', deliveryFeePaise: 0, totalPaise: 6500, expiresAt: new Date(Date.now() + 600000).toISOString() });
const request = async (env, body, token = 'test-secret') => worker.fetch(new Request('https://test/api/internal/groceries', { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(body) }), env, { waitUntil(p) { p.catch(() => {}); } });
test('unauthenticated checkout and over-budget baskets cannot advance', async () => {
  const { env, sqlite } = setup();
  assert.equal((await request(env, { id:'r1', action:'claim' }, 'wrong')).status, 404);
  assert.equal((await request(env, { id:'r1', action:'preview', preview:{ ...preview(), totalPaise:100001 } })).status, 409);
  assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status, 'requested');
});
test('only confirmed unexpired baskets can claim once; changed basket invalidates checkout', async () => {
  const { env, sqlite } = setup();
  assert.equal((await request(env, { id:'r1', action:'claim' })).status, 409);
  assert.equal((await request(env, { id:'r1', action:'preview', preview:preview() })).status, 200);
  const firstToken = JSON.parse(sqlite.prepare('SELECT preview_json FROM grocery_requests').get().preview_json).confirmationId;
  sqlite.prepare("UPDATE grocery_requests SET status='approved'").run();
  assert.equal((await request(env, { id:'r1', action:'claim' })).status, 200);
  assert.equal((await request(env, { id:'r1', action:'claim' })).status, 409);
  assert.equal((await request(env, { id:'r1', action:'payment-link', orderId:'o1', paymentUrl:'https://payments.juspay.in/test' })).status, 409);
  assert.equal((await request(env, { id:'r1', action:'preview', preview:preview() })).status, 200);
  const row = sqlite.prepare('SELECT * FROM grocery_requests').get();
  assert.notEqual(JSON.parse(row.preview_json).confirmationId, firstToken);
  assert.equal(row.status, 'preview_ready');
  assert.equal((await request(env, { id:'r1', action:'claim' })).status, 409);
});
test('notification stays queued when Owner has no active reply window', async () => {
  const { env, sqlite } = setup();
  assert.equal((await request(env, { id:'r1', action:'preview', preview:preview() })).status, 200);
  const sync = await request(env, { action:'sync' });
  assert.equal((await sync.json()).notificationsSent, 0);
  assert.equal(sqlite.prepare('SELECT status FROM grocery_notifications').get().status, 'pending');
});
test('recipient window opens only from the tracked owner; stale previews are not delivered', async () => {
  const { env, sqlite } = setup();
  env.WHATSAPP_ACCESS_TOKEN='fake'; env.WHATSAPP_PHONE_NUMBER_ID='fake';
  sqlite.prepare('INSERT INTO whatsapp_sessions VALUES (?, ?)').run('cook', Date.now());
  assert.equal((await (await request(env,{action:'sync'})).json()).notificationsSent,0);
  assert.equal((await request(env, { id:'r1', action:'preview', preview:preview() })).status,200);
  sqlite.prepare('INSERT INTO whatsapp_sessions VALUES (?, ?)').run('test-owner', Date.now());
  sqlite.prepare("UPDATE grocery_requests SET preview_json=json_set(preview_json,'$.expiresAt','2000-01-01T00:00:00.000Z')").run();
  assert.equal((await (await request(env,{action:'sync'})).json()).notificationsSent,0);
  assert.equal(sqlite.prepare('SELECT status FROM grocery_notifications').get().status,'obsolete');
});

test('ordinary WhatsApp choice requests a preview, never approves a purchase', async () => {
  const { env, sqlite } = setup();
  sqlite.prepare("UPDATE grocery_requests SET status='awaiting_choice'").run();
  env.WHATSAPP_ACCESS_TOKEN='fake'; env.WHATSAPP_PHONE_NUMBER_ID='fake';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status:200 });
  try {
    assert.equal(await handleGroceryReply(env, 'other', 'B and 1 kg'), false);
    assert.equal(await handleGroceryReply(env, 'test-owner', 'B and 1 kg'), true);
    const row = sqlite.prepare('SELECT * FROM grocery_requests').get();
    assert.equal(row.selection_notes, 'B and 1 kg');
    assert.equal(row.status, 'requested');
    assert.equal(row.approved_at, null);
    assert.equal((await request(env, { id:'r1', action:'claim' })).status,409);
  } finally { globalThis.fetch = originalFetch; }
});
test('a correction goes to the latest list while older clarifications stay untouched', async () => {
  const { env, sqlite } = setup();
  sqlite.prepare("UPDATE grocery_requests SET status='awaiting_choice'").run();
  sqlite.prepare("INSERT INTO grocery_requests (id,source_message_id,ingredients_json,status,created_at) VALUES ('r2','m2','[\"lauki\",\"turai\"]','awaiting_choice','2026-10-02')").run();
  env.WHATSAPP_ACCESS_TOKEN='fake'; env.WHATSAPP_PHONE_NUMBER_ID='fake';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status:200 });
  try {
    assert.equal(await handleGroceryReply(env,'test-owner','lauki and turai 250g each'),true);
    assert.equal(sqlite.prepare("SELECT status FROM grocery_requests WHERE id='r1'").get().status,'awaiting_choice');
    const latest = sqlite.prepare("SELECT * FROM grocery_requests WHERE id='r2'").get();
    assert.equal(latest.selection_notes,'lauki and turai 250g each');
    assert.equal(latest.status,'requested');
    assert.equal(latest.approved_at,null);
    assert.equal(await handleGroceryReply(env,'test-owner','thanks'),false);
  } finally { globalThis.fetch = originalFetch; }
});
test('natural order confirmation requires a sent current preview and a later inbound timestamp', async () => {
  const { env, sqlite } = setup();
  env.WHATSAPP_ACCESS_TOKEN='fake'; env.WHATSAPP_PHONE_NUMBER_ID='fake';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status:200 });
  try {
    await request(env,{id:'r1',action:'preview',preview:preview()});
    const sentAt = Date.now()-5000;
    await handleGroceryReply(env,'test-owner','ऑर्डर कर दो',Date.now());
    assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'preview_ready');
    sqlite.prepare("UPDATE grocery_notifications SET status='sent', sent_at=?").run(new Date(sentAt).toISOString());
    await handleGroceryReply(env,'test-owner','ऑर्डर कर दो',sentAt-1000);
    assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'preview_ready');
    await handleGroceryReply(env,'test-owner','ऑर्डर कर दो',sentAt+1000);
    assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'approved');
  } finally { globalThis.fetch=originalFetch; }
});

test('natural Hinglish confirmations approve a sent basket without repeat questions', async () => {
  for (const reply of ['han order pls','haan order please','yes order it','order kar do','kardo','“ऑर्डर कर दो”','65 vala basket confirm']) {
    const {env,sqlite}=setup();
    env.WHATSAPP_ACCESS_TOKEN='fake'; env.WHATSAPP_PHONE_NUMBER_ID='fake';
    await request(env,{id:'r1',action:'preview',preview:preview()});
    sqlite.prepare("UPDATE grocery_notifications SET status='sent',sent_at=?").run(new Date(Date.now()-5000).toISOString());
    const original=globalThis.fetch; const calls=[];
    globalThis.fetch=async (_,options)=>{calls.push(JSON.parse(options.body));return new Response('{}',{status:200});};
    try {
      assert.equal(await handleGroceryReply(env,'test-owner',reply,Date.now(),'message-1'),true);
      assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'approved',reply);
      assert.equal(calls[0].type,'reaction');
      assert.equal(calls[0].reaction.message_id,'message-1');
    } finally {globalThis.fetch=original;}
  }
});
test('routine WhatsApp notification does not change basket or approval', async () => {
  const {env,sqlite}=setup();
  await request(env,{id:'r1',action:'preview',preview:preview()});
  const before=sqlite.prepare('SELECT * FROM grocery_requests').get();
  assert.equal((await request(env,{id:'r1',action:'notify',message:'आपकी मूंग 1 kg की पसंद मिल गई।'})).status,200);
  assert.deepEqual(sqlite.prepare('SELECT * FROM grocery_requests').get(),before);
});

 test('each basket requires fresh history, including nonhistorical choices', async () => {
 const {env}=setup();
 for(const historyCheck of [undefined,{source:'zepto',checkedAt:'2000-01-01',productVariantIds:['p1']},{source:'zepto',checkedAt:new Date().toISOString(),productVariantIds:[]}]) {
 assert.equal((await request(env,{id:'r1',action:'preview',preview:{...preview(),historyCheck}})).status,400);
 }
 assert.equal((await request(env,{id:'r1',action:'preview',preview:preview()})).status,200);
 });
 test('executor wakes immediately, retries failed delivery with the same idempotency key, and never approves', async () => {
 const {env,sqlite}=setup();
 env.GROCERY_EXECUTOR_WAKE_URL='https://executor.example/wake'; env.GROCERY_EXECUTOR_WAKE_TOKEN='test';
 sqlite.prepare('INSERT INTO whatsapp_sessions VALUES (?,?)').run('test-owner',Date.now());
 const original=globalThis.fetch; const calls=[];
 globalThis.fetch=async (url,options)=>{calls.push(JSON.parse(options.body)); return new Response('{}',{status:calls.length===1?503:200});};
 try {
 await assert.rejects(wakeGroceryExecutor(env));
 await wakeGroceryExecutor(env); await wakeGroceryExecutor(env);
 assert.equal(calls.length,2); assert.equal(calls[0].idempotencyKey,calls[1].idempotencyKey);
 assert.equal(calls[1].event,'basket_requested');
 assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'requested');
 sqlite.prepare("UPDATE grocery_requests SET status='approved',approved_at='now'").run();
 await wakeGroceryExecutor(env); assert.equal(calls[2].event,'basket_approved');
 } finally {globalThis.fetch=original;}
 });
test('routine clarification cannot erase an approved basket', async () => {
  const {env,sqlite}=setup();
  await request(env,{id:'r1',action:'preview',preview:preview()});
  sqlite.prepare("UPDATE grocery_requests SET status='approved',approved_at='signed-approval'").run();
  assert.equal((await request(env,{id:'r1',action:'clarify',message:'Previous brand?'})).status,409);
  assert.equal(sqlite.prepare('SELECT approved_at FROM grocery_requests').get().approved_at,'signed-approval');
  const response=await request(env,{id:'r1',action:'preview',preview:preview()});
  assert.equal((await response.json()).approvalPreserved,true);
  assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'approved');
});
test('payment link message contains no internal references or preview token', async()=>{
  const {env,sqlite}=setup();
  await request(env,{id:'r1',action:'preview',preview:{...preview(),paymentMethod:'PAYMENT_LINK'}});
  sqlite.prepare("UPDATE grocery_requests SET status='approved'").run();
  await request(env,{id:'r1',action:'claim'});
  await request(env,{id:'r1',action:'payment-link',orderId:'merchant-id',paymentUrl:'https://payments.juspay.in/test'});
  const messages=sqlite.prepare('SELECT body FROM grocery_notifications').all();
  assert.equal(messages.at(-1).body,'Pay ₹65: https://payments.juspay.in/test');
});

test('tomorrow breakfast/lunch starts once, saves a draft and does not approve groceries',async()=>{
  const {env,sqlite}=setup();
  const a=await (await request(env,{action:'next-day-start'})).json();
  assert.equal(a.ok,true);
  assert.ok(a.breakfast && a.lunch);
  const b=await (await request(env,{action:'next-day-start'})).json();
  assert.equal(b.alreadyStarted,true);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM grocery_notifications WHERE id LIKE 'evening-approval:%'").get().n,1);
  assert.equal(sqlite.prepare('SELECT status FROM meal_plans WHERE plan_date=?').get(a.date).status,'draft');
  assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'requested');
});

test('intent parser submits context and untrusted speech to structured interpretation',async()=>{
 const original=globalThis.fetch; let submitted;
 globalThis.fetch=async(url,options)=>{submitted=JSON.parse(options.body);return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({action:'missing_items',items:['potatoes','onions','tomatoes','cauliflower','paneer','Anand paneer','bread'],changes:{breakfast:null,lunch:null,dinner:null},clarification:'',totalPaise:null})}}]}));};
 try {
 const result=await interpretIntent({OPENAI_API_KEY:'fake'},'जी जी आलू मंगवा दो, प्याज, टमाटर, गोभी, पनीर, आनंद पनीर, ठीक है, ब्रेड, बस.',{role:'cook'});
 assert.equal(result.action,'missing_items');assert.equal(result.items.length,6);assert.deepEqual(result.changes,{});
 assert.equal(submitted.response_format.json_schema.strict,true);assert.equal(JSON.parse(submitted.messages[1].content).context.role,'cook');
 } finally {globalThis.fetch=original;}
});
test('interpreted meal approval cannot authorize checkout',async()=>{
 const {env,sqlite}=setup();await request(env,{id:'r1',action:'preview',preview:preview()});
 assert.equal(await handleGroceryReply(env,'test-owner','OK',Date.now(),'m',{action:'approve_meal',items:[],changes:{},clarification:'',totalPaise:null}),false);
 assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'preview_ready');
});
test('reset preserves pending merchant reconciliation while retiring old lists',async()=>{
 const {env,sqlite}=setup();sqlite.prepare("UPDATE grocery_requests SET status='payment_pending',order_id='merchant-existing'").run();
 assert.equal((await request(env,{action:'reset-run'})).status,200);
 assert.equal(sqlite.prepare('SELECT order_id FROM grocery_requests').get().order_id,'merchant-existing');
 assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'reset_payment_pending');
});

test('last five verified orders persist for pricing queries and reject overflow',async()=>{
 const {env}=setup();
 const orders=Array.from({length:5},(_,i)=>({orderId:`order-${i}`,totalPaise:10500,deliveryFeePaise:i===0?3000:null,status:'DELIVERED'}));
 assert.equal((await request(env,{action:'order-history',orders,checkedAt:new Date().toISOString()})).status,200);
 const read=await worker.fetch(new Request('https://test/api/internal/groceries',{headers:{authorization:'Bearer test-secret'}}),env,{waitUntil(){}});
 const data=await read.json();assert.equal(data.recentOrders.orders.length,5);assert.equal(data.recentOrders.orders[0].deliveryFeePaise,3000);assert.equal(data.recentOrders.orders[1].deliveryFeePaise,null);
 assert.equal((await request(env,{action:'order-history',orders:[...orders,orders[0]],checkedAt:new Date().toISOString()})).status,400);
});
test('out of scope intent gets the exact bounded response, overriding model prose',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({action:'out_of_scope',items:[],changes:{breakfast:null,lunch:null,dinner:null},clarification:'What city?',answer:'Invented weather forecast',totalPaise:null})}}]}));
 try {const result=await interpretIntent({OPENAI_API_KEY:'fake'},'Weather tomorrow?',{role:'owner'});assert.equal(result.answer,'sorry I do not have that information with me');assert.equal(result.clarification,'');}finally{globalThis.fetch=original;}
});
test('basket revision invalidates existing approval and keeps the interpreted revised list',async()=>{
 const {env,sqlite}=setup();await request(env,{id:'r1',action:'preview',preview:preview()});sqlite.prepare("UPDATE grocery_requests SET status='approved',approved_at=?").run(new Date().toISOString());
 assert.equal(await handleGroceryReply(env,'test-owner','Yes but make curd 1kg',Date.now(),undefined,{action:'change_basket',items:['curd 1kg'],changes:{},clarification:'',totalPaise:null}),true);
 const row=sqlite.prepare('SELECT * FROM grocery_requests').get();assert.equal(row.status,'requested');assert.equal(row.approved_at,null);assert.equal(row.preview_json,null);assert.deepEqual(JSON.parse(row.selection_notes).items,['curd 1kg']);
});

test('meal changes preserve other meals and clear approval for a fresh scoped confirmation',async()=>{
 const {env,sqlite}=setup();await request(env,{action:'next-day-start'});
 const current=sqlite.prepare('SELECT * FROM meal_plans').get();sqlite.prepare("UPDATE meal_plans SET status='approved',approved_at='2026-10-02'").run();
 await applyOwnerPlanChanges(env.DB,current,{breakfast:'Vegetable poha'});
 const changed=sqlite.prepare('SELECT * FROM meal_plans').get();assert.equal(changed.breakfast_name,'Vegetable poha');assert.equal(changed.lunch_name,current.lunch_name);assert.equal(changed.status,'draft');assert.equal(changed.approved_at,null);assert.deepEqual(JSON.parse(changed.scores_json).approvalScope,['breakfast','lunch']);
});

test('preparation and choice intents never approve a purchase or repeat warnings',async()=>{
 const {env,sqlite}=setup();env.WHATSAPP_ACCESS_TOKEN='fake';env.WHATSAPP_PHONE_NUMBER_ID='fake';
 const original=globalThis.fetch;const sends=[];
 globalThis.fetch=async(url,opts)=>{sends.push(JSON.parse(opts.body));return new Response('{}');};
 try {
 const intent=action=>({action,items:[],changes:{},clarification:'',totalPaise:null});
 for(const text of ['OK','send the basket','haan dikhao','please show total']) {
  sqlite.prepare("UPDATE grocery_requests SET status='awaiting_choice',approved_at=NULL").run();
  assert.equal(await handleGroceryReply(env,'test-owner',text,Date.now(),'msg',intent('prepare_basket')),true);
  assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'requested');
  assert.equal(sqlite.prepare('SELECT approved_at FROM grocery_requests').get().approved_at,null);
 }
 sqlite.prepare("UPDATE grocery_requests SET status='awaiting_choice'").run();
 await handleGroceryReply(env,'test-owner','B 1kg',Date.now(),'msg',{...intent('choose_basket'),items:['moong dal 1kg']});
 assert.deepEqual(JSON.parse(sqlite.prepare('SELECT selection_notes FROM grocery_requests').get().selection_notes).items,['moong dal 1kg']);
 await handleGroceryReply(env,'test-owner','order pls',Date.now(),'msg',intent('confirm_basket'));
 assert.equal(sqlite.prepare('SELECT approved_at FROM grocery_requests').get().approved_at,null);
 assert.ok(sends.every(s=>s.type==='reaction'));
 }finally{globalThis.fetch=original;}
});
test('expired confirmation requests a fresh basket rather than authorizing old terms',async()=>{
 const {env,sqlite}=setup();await request(env,{id:'r1',action:'preview',preview:preview()});
 sqlite.prepare("UPDATE grocery_requests SET preview_json=json_set(preview_json,'$.expiresAt','2000-01-01T00:00:00.000Z')").run();
 await handleGroceryReply(env,'test-owner','yes order',Date.now(),undefined,{action:'confirm_basket',items:[],changes:{},clarification:'',totalPaise:null});
 const row=sqlite.prepare('SELECT * FROM grocery_requests').get();
 assert.equal(row.status,'requested');assert.equal(row.approved_at,null);assert.equal(row.preview_json,null);
});

test('tomorrow voice waits for cook reply, sends once, and does not replay uncertain sends', async () => {
  const {env,sqlite}=setup();
  Object.assign(env,{COOK_PHONE:'cook',WHATSAPP_ACCESS_TOKEN:'fake',WHATSAPP_PHONE_NUMBER_ID:'fake',OPENAI_API_KEY:'fake'});
  const date=new Date(Date.now()+86400000).toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
  await request(env,{action:'next-day-start'});
  sqlite.prepare("UPDATE meal_plans SET status='breakfast_lunch_approved' WHERE plan_date=?").run(date);
  sqlite.prepare("INSERT INTO grocery_notifications (id,request_id,body,status,created_at) VALUES (?,?,'meals','sent',?)").run(`evening-cook:${date}`,`evening-cook:${date}`,new Date().toISOString());
  const originalFetch=globalThis.fetch; let audioSends=0;
  globalThis.fetch=async (url,args)=>{
    if(String(url).includes('/chat/completions')) return Response.json({choices:[{message:{content:JSON.stringify({text:'सुषमा, कल चिल्ला और पुलाव बनाना है। सामान बता देना।'})}}]});
    if(String(url).includes('/audio/speech')) return new Response('audio');
    if(String(url).endsWith('/media')) return Response.json({id:'audio-id'});
    audioSends++; return Response.json({messages:[{id:'voice-id'}]});
  };
  try {
    await sendPendingEveningVoice(env); assert.equal(audioSends,0);
    sqlite.prepare('INSERT INTO whatsapp_sessions VALUES (?,?)').run('cook',Date.now());
    await sendPendingEveningVoice(env); await sendPendingEveningVoice(env);
    assert.equal(audioSends,1);
    assert.equal(sqlite.prepare('SELECT status FROM grocery_notifications WHERE id=?').get(`evening-voice:${date}`).status,'sent');
    sqlite.prepare("UPDATE grocery_notifications SET status='sending' WHERE id=?").run(`evening-voice:${date}`);
    await sendPendingEveningVoice(env); assert.equal(audioSends,1);
  } finally {globalThis.fetch=originalFetch;}
});

test('failed step reports reason and next action once; recovery notifies without changing approval', async()=>{
  const {env,sqlite}=setup();
  sqlite.prepare("UPDATE grocery_requests SET status='approved'").run();
  const fail={id:'r1',action:'step-result',step:'Product search',outcome:'failed',reason:'The delivery store was not selected.',nextAction:'Select Home and retry.'};
  assert.equal((await request(env,{...fail,reason:''})).status,400);
  assert.equal((await request(env,fail)).status,200);
  assert.equal((await (await request(env,fail)).json()).alreadyReported,true);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM grocery_notifications').get().n,1);
  assert.match(sqlite.prepare('SELECT body FROM grocery_notifications').get().body,/delivery store.*\nNext: Select Home/s);
  await request(env,{id:'r1',action:'step-result',step:'Product search',outcome:'completed',nextAction:'The basket will follow.'});
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM grocery_notifications').get().n,2);
  assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'approved');
  assert.equal(sqlite.prepare("SELECT count(*) AS n FROM grocery_notifications WHERE status='pending'").get().n,2);
});

test('explicit owner meal dispatch includes dinner, sends once outside cook voice window, and never approves groceries',async()=>{
  const {env,sqlite}=setup();
  Object.assign(env,{COOK_PHONE:'cook',WHATSAPP_ACCESS_TOKEN:'fake',WHATSAPP_PHONE_NUMBER_ID:'fake'});
  const meals={breakfast:'पोहा और दही',lunch:'राजमा और चावल',dinner:'टोफू और सब्जियाँ'};
  const payload={action:'send-meal-plan',ownerAuthorized:true,meals};
  assert.equal((await request(env,{...payload,ownerAuthorized:false})).status,400);
  let sent=[];const originalFetch=globalThis.fetch;
  globalThis.fetch=async(url,args)=>{sent.push(JSON.parse(args.body));return Response.json({messages:[{id:'meal-message'}]});};
  try {
    const result=await (await request(env,payload)).json();
    assert.equal(result.textSent,true);assert.equal(result.voiceWindowOpen,false);
    assert.equal(sent.length,1);assert.equal(sent[0].type,'template');
    assert.match(JSON.stringify(sent[0]),/टोफू/);
    assert.equal((await (await request(env,payload)).json()).alreadyStarted,true);
    assert.equal(sent.length,1);
    assert.equal(sqlite.prepare('SELECT status FROM meal_plans').get().status,'approved');
    assert.equal(sqlite.prepare('SELECT status FROM grocery_requests').get().status,'requested');
  }finally{globalThis.fetch=originalFetch;}
});
