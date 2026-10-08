// No concrete network or provider is selected implicitly. This registry is deliberately
// empty until an approved, audited adapter is implemented. Environment values alone
// cannot switch on money movement.
export const productionAdapters = Object.freeze({});
export const states = ['unavailable configuration','awaiting transfer','verifying','confirmed','analyzing logo','generating','ready','failed'];
const requirements = {
 network:'Network and chain-specific adapter', contract:'Destination contract and payment event interface',
 tokens:'Eligible token identities and integer decimals', amountPolicy:'Exact/minimum amount and under/overpayment rules',
 finality:'Confirmation and reorganization policy', ownership:'Persistent account and signed-wallet attribution mechanism',
 metadata:'Trusted logo source and usage rights', analysis:'Logo-analysis provider', generation:'Skin-generation provider',
 recovery:'Post-payment retry, uncertain-job reconciliation and refund policy'
};
export function capabilities(env=process.env) {
 let config={};let invalid=false;
 try { config=JSON.parse(env.LETSCRAFT_INTEGRATION_CONFIG||'{}');if(!config||typeof config!=='object'||Array.isArray(config))throw Error(); } catch {invalid=true;config={};}
 const missing=Object.entries(requirements).filter(([key])=>!config[key]).map(([,text])=>text);
 if(invalid)missing.unshift('Integration configuration is not valid JSON');
 missing.push('Approved concrete adapters and persistent paid-account ownership are not implemented');
 return {live:false,amount:'100,000',state:'unavailable configuration',missing,states,
  recovery:'No transfer is requested. A saved draft is not a paid entitlement. No refund or regeneration policy is promised.'};
}
export class WorkflowError extends Error {constructor(status,message){super(message);this.status=status;}}
export function unavailable(){throw new WorkflowError(503,'Live transfers and generation are unavailable. Do not send tokens. No payment was requested.');}
export function paymentUnits(decimals){if(!Number.isInteger(decimals)||decimals<0||decimals>36)throw new WorkflowError(400,'Unsupported token decimals');return 100000n*10n**BigInt(decimals);}
// Adapter evidence must be obtained server-side from canonical chain data, never from
// an HTTP body. A concrete adapter owns chain-specific event decoding and finality.
export function checkEvidence(e,c,binding){
 const amount=paymentUnits(c.decimals);
 if(!['exact','minimum'].includes(c.amountPolicy)||!Number.isInteger(c.confirmations)||c.confirmations<1)throw new WorkflowError(503,'Payment policy incomplete');
 if(!e||!e.success||!e.canonical||e.network!==c.network||e.token!==c.token||e.destination!==c.destination||e.sender!==binding.wallet||e.requestId!==binding.requestId||e.confirmations<c.confirmations||!e.transactionId||!e.eventId)throw new WorkflowError(422,'Transfer evidence does not satisfy the approved request');
 if(!/^\d+$/.test(e.amount)|| (c.amountPolicy==='exact'?BigInt(e.amount)!==amount:BigInt(e.amount)<amount))throw new WorkflowError(422,'Transfer amount does not meet the configured policy');
 return e;
}
