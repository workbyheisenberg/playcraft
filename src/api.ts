import {localApi} from './localapi';

const LOCAL=import.meta.env.VITE_LOCAL==='1';

export async function api(url:string,method='GET',data?:unknown){
 if(LOCAL)return localApi(url,method,data);
 const r=await fetch('/api/'+url,{method,headers:{'content-type':'application/json','x-voxel-request':'1'},body:data?JSON.stringify(data):undefined});
 const j=await r.json().catch(()=>({error:'The server returned an unreadable response.'}));
 if(!r.ok)throw Error((j as {error?:string}).error||'The request could not be completed.');
 return j;
}
