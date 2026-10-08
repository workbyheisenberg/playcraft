const LOCAL=import.meta.env.VITE_LOCAL==='1';
export function skinUrl(id:string):string{
  if(LOCAL){try{const v=localStorage.getItem('letscraft.skin.'+id);if(v)return v;}catch{}}
 return '/api/appearances/'+id+'/skin';
}
