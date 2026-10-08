// Sandbox provider: fully local logo interpretation and skin generation.
// No network calls, no payment verification, deterministic idempotency key from the
// uploaded bytes. This adapter only runs for requests explicitly marked sandbox.
import {createHash} from 'node:crypto';
import {analyzeLogo,describeLogo,generateSkin} from './imaging.mjs';
import {WorkflowError} from './integrations.mjs';

export const localPolicy=Object.freeze({retryApproved:true,metadataOrigins:['https://sandbox.playcraft.invalid']});

export function localServices(bytes,meta={}){
  if(!Buffer.isBuffer(bytes)||!bytes.length)throw new WorkflowError(422,'A token logo image is required');
  const jobKey='local-'+createHash('sha256').update(bytes).digest('hex').slice(0,32);
  let analysis=null;
  return {
    resolveLogo:async()=>({source:'https://sandbox.playcraft.invalid/uploaded-token-logo.png',bytes}),
    analyzeLogo:async()=>{analysis=analysis||analyzeLogo(bytes);return describeLogo(analysis,meta);},
    reconcile:async()=>({status:'absent'}),
    generate:async()=>{
      analysis=analysis||analyzeLogo(bytes);
      return {status:'ready',jobId:jobKey,bytes:generateSkin(bytes,{analysis})};
    }
  };
}
