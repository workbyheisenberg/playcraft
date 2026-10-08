import {defineConfig} from 'vite';

const apiTarget=process.env.API_TARGET||'http://localhost:3000';

export default defineConfig({
 server:{
  host:'0.0.0.0',
  port:Number(process.env.VITE_PORT)||5173,
  strictPort:false,
  proxy:{
   '/api':{target:apiTarget,changeOrigin:false},
   '/healthz':{target:apiTarget,changeOrigin:false}
  }
 }
});
