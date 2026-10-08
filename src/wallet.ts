export type Wallet={address:string;chain:string};
type Ethereum={request:(args:{method:string;params?:unknown[]})=>Promise<unknown>};
export const injectedWallet=()=>(window as unknown as {ethereum?:Ethereum}).ethereum;
export async function connectInjected():Promise<Wallet|null>{
 const eth=injectedWallet();
 if(!eth?.request)return null;
 const accounts=await eth.request({method:'eth_requestAccounts'}) as string[];
 const address=accounts?.[0];
 if(!address)throw Error('Your wallet did not return an account.');
 let chain='unknown';
 try{chain=String(await eth.request({method:'eth_chainId'}));}catch{}
 return {address,chain};
}
export const validAddress=(address:string)=>/^0x[0-9a-fA-F]{40}$/.test(address.trim());
export const shortAddress=(address:string)=>address.length>12?`${address.slice(0,6)}…${address.slice(-4)}`:address;
