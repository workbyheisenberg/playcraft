import {randomUUID,createHash} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {PNG} from 'pngjs';
import {capabilities,WorkflowError,checkEvidence} from './integrations.mjs';
export function migrateCustomization(db){
 if(db.prepare('SELECT 1 FROM migrations WHERE version=2').get())return;
 db.exec(`BEGIN;
 ALTER TABLE requests ADD COLUMN created TEXT;
 ALTER TABLE requests ADD COLUMN updated TEXT;
 ALTER TABLE requests ADD COLUMN stage TEXT;
 ALTER TABLE requests ADD COLUMN config_snapshot TEXT;
 ALTER TABLE requests ADD COLUMN verified INTEGER NOT NULL DEFAULT 0;
 ALTER TABLE requests ADD COLUMN prompt TEXT;
 ALTER TABLE requests ADD COLUMN interpretation TEXT;
 CREATE TABLE request_events(id INTEGER PRIMARY KEY,request TEXT NOT NULL REFERENCES requests(id),state TEXT NOT NULL,detail TEXT NOT NULL,created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE TABLE wallet_challenges(id TEXT PRIMARY KEY,request TEXT NOT NULL REFERENCES requests(id),player TEXT NOT NULL REFERENCES players(id),network TEXT NOT NULL,wallet TEXT NOT NULL,origin TEXT NOT NULL,nonce TEXT UNIQUE NOT NULL,expires INTEGER NOT NULL,consumed INTEGER);
 CREATE TABLE wallet_bindings(request TEXT PRIMARY KEY REFERENCES requests(id),player TEXT NOT NULL REFERENCES players(id),wallet TEXT NOT NULL,network TEXT NOT NULL,challenge TEXT UNIQUE NOT NULL REFERENCES wallet_challenges(id));
 CREATE TABLE token_provenance(request TEXT PRIMARY KEY REFERENCES requests(id),source TEXT NOT NULL,hash TEXT NOT NULL,asset TEXT NOT NULL,retrieved TEXT NOT NULL);
 CREATE TABLE generation_jobs(request TEXT PRIMARY KEY REFERENCES requests(id),idempotency_key TEXT UNIQUE NOT NULL,provider_job TEXT,attempts INTEGER NOT NULL DEFAULT 0,lease_until INTEGER NOT NULL DEFAULT 0);
 CREATE TABLE appearances(id TEXT PRIMARY KEY,request TEXT UNIQUE NOT NULL REFERENCES requests(id),player TEXT NOT NULL REFERENCES players(id),asset TEXT NOT NULL,hash TEXT NOT NULL,created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
 CREATE UNIQUE INDEX one_redemption_per_request ON redemptions(request);
 INSERT INTO migrations VALUES(2); COMMIT;`);
}
export function owned(db,id,player){const r=db.prepare('SELECT * FROM requests WHERE id=? AND player=?').get(id,player);if(!r)throw new WorkflowError(404,'Customization request not found');return r;}
export function view(db,r){return {id:r.id,state:r.state,detail:r.detail,stage:r.stage,created:r.created,updated:r.updated,verified:!!r.verified,local:!!db.prepare('SELECT 1 FROM token_provenance WHERE request=?').get(r.id),prompt:r.prompt,interpretation:r.interpretation,blockers:JSON.parse(r.config_snapshot||'{}').missing||[],appearance:db.prepare('SELECT id FROM appearances WHERE request=?').get(r.id)?.id||null,events:db.prepare('SELECT state,detail,created FROM request_events WHERE request=? ORDER BY id').all(r.id)};}
export function list(db,player){return db.prepare('SELECT * FROM requests WHERE player=? ORDER BY created DESC LIMIT 50').all(player).map(r=>view(db,r));}
export function draft(db,player){
 const existing=db.prepare("SELECT * FROM requests WHERE player=? AND state='unavailable configuration' ORDER BY created DESC LIMIT 1").get(player);
 if(existing)return view(db,existing);
 const id=randomUUID(),now=new Date().toISOString(),detail='Draft saved. No payment requested. Live configuration and durable paid-account ownership are unresolved.';
 db.exec('BEGIN IMMEDIATE');try{db.prepare('INSERT INTO requests(id,player,state,detail,created,updated,config_snapshot) VALUES(?,?,?,?,?,?,?)').run(id,player,'unavailable configuration',detail,now,now,JSON.stringify(capabilities()));event(db,id,'unavailable configuration',detail);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 return view(db,owned(db,id,player));
}
function event(db,id,state,detail){db.prepare('INSERT INTO request_events(request,state,detail) VALUES(?,?,?)').run(id,state,detail);}
const transitions={'unavailable configuration':['awaiting transfer','analyzing logo'],'awaiting transfer':['verifying'],verifying:['confirmed','failed'],confirmed:['analyzing logo','failed'],'analyzing logo':['generating','failed'],generating:['ready','failed'],failed:['verifying','analyzing logo','generating'],ready:[]};
export function transition(db,id,next,detail,stage=null){const r=db.prepare('SELECT state FROM requests WHERE id=?').get(id);if(!r||!transitions[r.state]?.includes(next))throw new WorkflowError(409,'Invalid customization state transition');db.prepare('UPDATE requests SET state=?,detail=?,stage=?,updated=? WHERE id=?').run(next,detail,stage,new Date().toISOString(),id);event(db,id,next,detail);}
// Internal adapter boundary only. Never mounted as a raw-evidence HTTP endpoint.
export function redeem(db,id,player,evidence,config){
 const binding=db.prepare('SELECT * FROM wallet_bindings WHERE request=? AND player=?').get(id,player);
 if(!binding||binding.network!==config.network)throw new WorkflowError(403,'Verified wallet ownership is required');
 checkEvidence(evidence,config,{wallet:binding.wallet,requestId:id});
 db.exec('BEGIN IMMEDIATE');try{const r=owned(db,id,player);if(r.state!=='verifying'||r.verified)throw new WorkflowError(409,'Request is not awaiting verification');db.prepare('INSERT INTO redemptions(network,transaction_id,request) VALUES(?,?,?)').run(evidence.network,evidence.transactionId,id);db.prepare('UPDATE requests SET verified=1 WHERE id=?').run(id);transition(db,id,'confirmed','Canonical transfer verified. Entitlement retained.');db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');if(e.code?.includes('SQLITE'))throw new WorkflowError(409,'Transfer has already been redeemed');throw e;}
}
export function consumeChallenge(db,id,player,now,proof){const c=db.prepare('SELECT * FROM wallet_challenges WHERE id=? AND player=?').get(id,player);if(!c||c.consumed||c.expires<=now)throw new WorkflowError(403,'Wallet challenge expired or already used');if(!proof||proof.wallet!==c.wallet||proof.network!==c.network||proof.origin!==c.origin||proof.nonce!==c.nonce||proof.requestId!==c.request)throw new WorkflowError(403,'Signature does not match this request');db.exec('BEGIN IMMEDIATE');try{if(db.prepare('UPDATE wallet_challenges SET consumed=? WHERE id=? AND consumed IS NULL').run(now,id).changes!==1)throw new WorkflowError(409,'Challenge already consumed');db.prepare('INSERT INTO wallet_bindings VALUES(?,?,?,?,?)').run(c.request,player,c.wallet,c.network,c.id);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}}
export function validatedPng(bytes,width,height){if(!Buffer.isBuffer(bytes)||bytes.length>2*1024*1024||bytes.length<24||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new WorkflowError(422,'Provider returned an invalid PNG');const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20);if(w<1||h<1||w>1024||h>1024||(width&&w!==width)||(height&&h!==height))throw new WorkflowError(422,'Image dimensions are incompatible');const image=PNG.sync.read(bytes,{checkCRC:true});let visible=false;for(let i=3;i<image.data.length;i+=4)if(image.data[i]>0){visible=true;break;}if(!visible)throw new WorkflowError(422,'Generated image is empty');return PNG.sync.write(image);}
const digest=b=>createHash('sha256').update(b).digest('hex');
async function store(bytes,root){await mkdir(root,{recursive:true,mode:0o700});const name=digest(bytes)+'.png';await writeFile(path.join(root,name),bytes,{mode:0o600});return name;}
// Providers implement resolveLogo (approved source, no arbitrary URLs), analyzeLogo
// (actual bytes), and generate/reconcile (durable idempotency key). No default or fake
// provider exists. Calling this boundary normally requires an already verified
// entitlement; options.requireVerified=false permits the explicitly local sandbox path,
// which grants a local appearance without any payment claim.
export async function processGeneration(db,id,player,services,policy,root='/data/uploads',options={}){
 const requireVerified=options.requireVerified!==false;
 const r=owned(db,id,player);if(requireVerified&&!r.verified)throw new WorkflowError(403,'Verified entitlement required');
 if(!services?.resolveLogo||!services?.analyzeLogo||!services?.generate||!services?.reconcile||!policy?.retryApproved||!Array.isArray(policy.metadataOrigins))throw new WorkflowError(503,'Providers and recovery policy are unresolved');
 const allowed=requireVerified?['confirmed','failed','analyzing logo','generating']:['unavailable configuration','confirmed','failed','analyzing logo','generating'];
 if(!allowed.includes(r.state))throw new WorkflowError(409,'Request cannot be processed');
 const bounded=async(fn,args)=>{let timer;try{return await Promise.race([fn(args),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new WorkflowError(504,'Provider timed out; reconcile the existing job before retry.')),30000);})]);}finally{clearTimeout(timer);}};
 const now=Date.now();db.prepare('INSERT OR IGNORE INTO generation_jobs(request,idempotency_key) VALUES(?,?)').run(id,randomUUID());
 if(db.prepare('UPDATE generation_jobs SET lease_until=?,attempts=attempts+1 WHERE request=? AND lease_until<?').run(now+300000,id,now).changes!==1)throw new WorkflowError(409,'This request is already processing');
 let stage='analyzing logo';
 try{
  if(r.state!=='analyzing logo'&&r.state!=='generating')transition(db,id,'analyzing logo','Resolving the submitted token logo.');
  const logo=await bounded(services.resolveLogo,{requestId:id,config:JSON.parse(r.config_snapshot)});
  const source=new URL(logo.source);if(source.protocol!=='https:'||!policy.metadataOrigins.includes(source.origin))throw new WorkflowError(422,'Unapproved metadata source');
  validatedPng(logo.bytes);const bytes=logo.bytes;const asset=await store(bytes,root);
  db.prepare('INSERT INTO token_provenance VALUES(?,?,?,?,?) ON CONFLICT(request) DO UPDATE SET source=excluded.source,hash=excluded.hash,asset=excluded.asset,retrieved=excluded.retrieved').run(id,source.href,digest(bytes),asset,new Date().toISOString());
  const interpretation=await bounded(services.analyzeLogo,{bytes,source:source.href,requestId:id});if(typeof interpretation!=='string'||interpretation.length<20||interpretation.length>16000)throw new WorkflowError(422,'Logo analysis was missing or invalid');
  const prompt=`Create an original compatible LetsCraft block-character skin using this actual token-logo interpretation: ${interpretation}\nPNG atlas: 192×16 pixels, twelve 16×16 tiles left to right: torso, head, hair, left leg, right leg, left arm, right arm, left boot, right boot, left eye, right eye, belt. Each tile repeats on all six faces of its matching part. Preserve the standard geometry and mascot palette. No text, no changed proportions. Opaque pixel art.`;
  db.prepare('UPDATE requests SET interpretation=?,prompt=? WHERE id=?').run(interpretation,prompt,id);
  if(owned(db,id,player).state!=='generating')transition(db,id,'generating','Generating a compatible skin from the analyzed logo.');stage='generating';
  const job=db.prepare('SELECT * FROM generation_jobs WHERE request=?').get(id);
  // Reconcile before every submission, including uncertain earlier timeouts. The
  // provider must honor the stable key; there is no automatic second paid job.
  let result=await bounded(services.reconcile,{idempotencyKey:job.idempotency_key,jobId:job.provider_job});
  if(result?.status==='unknown')throw new WorkflowError(409,'Provider submission is uncertain; reconciliation is required before retry');
  if(result?.status==='absent')result=await bounded(services.generate,{prompt,logo:bytes,idempotencyKey:job.idempotency_key});
  if(result?.jobId)db.prepare('UPDATE generation_jobs SET provider_job=? WHERE request=?').run(result.jobId,id);
  if(result?.status!=='ready')throw new WorkflowError(409,'Provider result is not ready; entitlement is retained');
  const skin=validatedPng(result.bytes,192,16),skinAsset=await store(skin,root);
  db.exec('BEGIN IMMEDIATE');try{db.prepare('INSERT INTO appearances(id,request,player,asset,hash) VALUES(?,?,?,?,?)').run(randomUUID(),id,player,skinAsset,digest(skin));transition(db,id,'ready','Generated skin validated and ready to preview.');db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 }catch(e){transition(db,id,'failed',e instanceof WorkflowError?e.message:'External processing failed. Verified entitlement is retained; no additional payment is required.',stage);throw e;}finally{db.prepare('UPDATE generation_jobs SET lease_until=0 WHERE request=?').run(id);}
 return view(db,owned(db,id,player));
}
export async function appearanceAsset(db,id,player,root='/data/uploads'){const a=db.prepare('SELECT * FROM appearances WHERE id=? AND player=?').get(id,player);if(!a)throw new WorkflowError(404,'Appearance not found');const bytes=await readFile(path.join(root,a.asset));if(digest(bytes)!==a.hash)throw new WorkflowError(422,'Saved appearance failed integrity validation');return bytes;}
