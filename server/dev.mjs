// Local development runner. `npm run dev` migrates the database, starts the API
// server, then starts Vite with an /api proxy and hot reload.
import path from 'node:path';
import net from 'node:net';
import {fileURLToPath} from 'node:url';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.env.NODE_ENV=process.env.NODE_ENV||'development';

function isFree(port){return new Promise(resolve=>{const s=net.createServer();s.once('error',()=>resolve(false));s.once('listening',()=>s.close(()=>resolve(true)));s.listen(port,'0.0.0.0');});}
async function pickPort(port){if(await isFree(port))return port;return new Promise(resolve=>{const s=net.createServer();s.listen(0,'0.0.0.0',()=>{const p=s.address().port;s.close(()=>resolve(p));});});}
const preferred=Number(process.env.PORT)||3000;
const apiPort=await pickPort(preferred);
if(apiPort!==preferred)console.log(`Port ${preferred} is busy; using ${apiPort} for the API instead.`);

process.env.PORT=String(apiPort);
process.env.SQLITE_PATH=process.env.SQLITE_PATH||path.join(project,'data','app.sqlite');
process.env.UPLOAD_DIR=process.env.UPLOAD_DIR||path.join(project,'data','uploads');
process.env.API_TARGET=process.env.API_TARGET||`http://localhost:${apiPort}`;

const {database,migrate}=await import('./db.mjs');
const db=database();migrate(db);db.close();

await import('../server.mjs');

const {createServer}=await import('vite');
const vite=await createServer({configFile:path.join(project,'vite.config.ts')});
await vite.listen();
vite.printUrls();
console.log(`  API      ${process.env.API_TARGET}`);
console.log(`  Data     ${process.env.SQLITE_PATH}\n`);

let closing=false;
async function shutdown(){if(closing)return;closing=true;try{await vite.close();}catch{}process.exit(0);}
process.on('SIGINT',shutdown);
process.on('SIGTERM',shutdown);
