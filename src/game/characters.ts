export type Look={
 id:string;name:string;short:string;tagline:string;swatch:string;group:'default'|'legends';
 extras:'trencher'|'og'|'diamond'|'speed'|'wave'|'hood'|'veil'|'armor'|null;
 colors:{torso:number;head:number;hair:number;leg:number;arm:number;boot:number;eye:number;belt:number};
};
export const characters:Look[]=[
 {id:'trencher',name:'The Trencher',short:'Trencher',tagline:'Poor clothes, heavy bags, zero urgency. Still early.',swatch:'#6b5d4a',group:'default',extras:'trencher',
  colors:{torso:0x6b5d4a,head:0xc9a37e,hair:0x3a3128,leg:0x55504a,arm:0x6b5d4a,boot:0x3b342c,eye:0x2c3533,belt:0x4a3f33}},
 {id:'bitcoin',name:'Satoshi the OG',short:'Bictoin',tagline:'The original block — old, bearded, and unbothered.',swatch:'#f7931a',group:'legends',extras:'og',
  colors:{torso:0xf7931a,head:0xe8b98a,hair:0xe6e6e6,leg:0x4a3527,arm:0xf7931a,boot:0x2b1d14,eye:0x2c3533,belt:0x2b1d14}},
 {id:'ethereum',name:'The Diamond Sage',short:'Ephereum',tagline:'Crystal geometry and quiet certainty.',swatch:'#627eea',group:'legends',extras:'diamond',
  colors:{torso:0x627eea,head:0xd5b592,hair:0x8a9cf0,leg:0x3c3c3d,arm:0x627eea,boot:0x3c3c3d,eye:0x2c3533,belt:0x8a9cf0}},
 {id:'solana',name:'Sol the Swift',short:'Solama',tagline:'Purple and green, built for fast lanes.',swatch:'linear-gradient(135deg,#9945ff,#14f195)',group:'legends',extras:'speed',
  colors:{torso:0x9945ff,head:0xd5b592,hair:0x9945ff,leg:0x1b1b22,arm:0x9945ff,boot:0x0b0b0f,eye:0x14f195,belt:0x14f195}},
 {id:'hyperliquid',name:'Hype the Liquid',short:'Hypu',tagline:'A crest of mint water, faster than the tide.',swatch:'#97fce4',group:'legends',extras:'wave',
  colors:{torso:0x0d3b32,head:0xd5b592,hair:0x97fce4,leg:0x072723,arm:0x0d3b32,boot:0x052019,eye:0x2c3533,belt:0x97fce4}},
 {id:'robinhood',name:'Robin the Hood',short:'Robino',tagline:'Takes from the rich grid, gives to the green.',swatch:'#00c805',group:'legends',extras:'hood',
  colors:{torso:0x00c805,head:0xd5b592,hair:0x6b4a2f,leg:0x1f6f2a,arm:0x00c805,boot:0x143d1a,eye:0x2c3533,belt:0x0b0b0b}},
 {id:'zcash',name:'Zee the Veiled',short:'Zkash',tagline:'What happens in the block stays in the block.',swatch:'#f4b728',group:'legends',extras:'veil',
  colors:{torso:0x111111,head:0xd5b592,hair:0x0a0a0a,leg:0x1a1a1a,arm:0x111111,boot:0x000000,eye:0xf4b728,belt:0xf4b728}},
 {id:'binance',name:'Bin the Keeper',short:'Binens',tagline:'Golden armor and a diamond at the core.',swatch:'#f0b90b',group:'legends',extras:'armor',
  colors:{torso:0x1e2026,head:0xd5b592,hair:0xf0b90b,leg:0x1e2026,arm:0xf0b90b,boot:0x111318,eye:0x2c3533,belt:0xf0b90b}}
];
export const looks:Record<string,Look>=Object.fromEntries(characters.map(c=>[c.id,c]));
export const legends=characters.filter(c=>c.group==='legends');
export const characterName=(style:string)=>style.startsWith('generated:')?'Your Token-Inspired Character':looks[style]?.name??'The Trencher';
export const characterTagline=(style:string)=>style.startsWith('generated:')?'Analyzed from your token logo and generated in the sandbox.':looks[style]?.tagline??'Poor clothes, heavy bags, zero urgency. Still early.';
