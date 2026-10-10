export const clone=v=>structuredClone(v);
export const round=v=>Math.round(v*1000)/1000;
export const DEFAULTS={format:'pegboard-studio',version:1,name:'My pegboard',width:240,height:240,thickness:5,outline:'rounded',corner:8,pattern:'slot',holeWidth:5,holeLength:15,holeHead:9,holeAngle:0,pitchX:40,pitchY:20,layout:'staggered',margin:12,offsetX:0,offsetY:0,mountLayout:'corners',mountType:'slot',mountWidth:4.5,mountLength:14,mountHead:9,mountAngle:0,mountInset:16,headStyle:'plain',headDepth:2,mounts:[],spacer:0,spacerWall:3,split:false,seamMargin:6,bed:[260,260,255],bedMargin:5};
export const PRESETS={skadis:{label:'SKÅDIS-style',pattern:'slot',holeWidth:5,holeLength:15,holeHead:9,pitchX:40,pitchY:20,layout:'staggered',holeAngle:0,thickness:5},classic:{label:'Classic round',pattern:'round',holeWidth:6.35,holeLength:15,pitchX:25.4,pitchY:25.4,layout:'square',holeAngle:0},hex:{label:'Hexagonal',pattern:'hexagon',holeWidth:10,pitchX:20,pitchY:17.32,layout:'staggered',holeAngle:0},square:{label:'Square grid',pattern:'square',holeWidth:8,pitchX:20,pitchY:20,layout:'square',holeAngle:0},slots:{label:'Wide slots',pattern:'slot',holeWidth:6,holeLength:22,pitchX:28,pitchY:32,layout:'square',holeAngle:90}};
export function preset(s,key){if(!PRESETS[key])throw new Error('Choose a supported style.');return {...clone(s),...PRESETS[key]};}
const limits={width:[40,1500],height:[40,1500],thickness:[2,20],corner:[0,100],holeWidth:[2,60],holeLength:[2,100],holeHead:[3,80],holeAngle:[0,180],pitchX:[4,160],pitchY:[4,160],margin:[2,150],offsetX:[-160,160],offsetY:[-160,160],mountWidth:[2,15],mountLength:[3,60],mountHead:[3,30],mountAngle:[0,180],mountInset:[5,150],headDepth:[.5,10],spacer:[0,40],spacerWall:[2,15],seamMargin:[2,30],bedMargin:[0,30]};
export function validate(s){
 if(!s||s.format!=='pegboard-studio'||s.version!==1)throw new Error('Open a Pegboard Studio project file.');
 if(typeof s.name!=='string'||s.name.length>100)throw new Error('Use a design name up to 100 characters.');
 for(const [k,[a,b]]of Object.entries(limits))if(!Number.isFinite(s[k])||s[k]<a||s[k]>b)throw new Error(`${k.replace(/([A-Z])/g,' $1')}: enter ${a}–${b}${k.includes('Angle')?'°':' mm'}.`);
 for(const [key,choices]of Object.entries({outline:['rectangle','rounded','oval','hexagon'],pattern:['slot','round','square','hexagon','diamond','keyhole'],layout:['square','staggered'],mountLayout:['none','top','corners','six','custom'],mountType:['round','slot','keyhole'],headStyle:['plain','counterbore','countersink']}))if(!choices.includes(s[key]))throw new Error('Choose valid board, pattern, and mounting options.');
 if(typeof s.split!=='boolean'||!Array.isArray(s.bed)||s.bed.length!==3||s.bed.some(n=>!Number.isFinite(n)||n<20||n>2000))throw new Error('Enter a valid printer volume (20–2000 mm).');
 if(!Array.isArray(s.mounts)||s.mounts.length>12||s.mounts.some(m=>!Array.isArray(m)||m.length!==2||m.some(n=>!Number.isFinite(n)||Math.abs(n)>750)))throw new Error('Use up to 12 custom screw positions, measured from the board center.');
 if(s.outline==='rounded'&&s.corner>Math.min(s.width,s.height)/2)throw new Error('Corner radius is too large for this board.');
 if(s.margin*2>=Math.min(s.width,s.height))throw new Error('Reduce the edge border to leave space for holes.');
 if(['slot','keyhole'].includes(s.pattern)&&s.holeLength<(s.pattern==='keyhole'?s.holeHead:s.holeWidth))throw new Error('Hole length must be at least its width / keyhole head diameter.');
 if(s.pattern==='keyhole'&&s.holeHead<=s.holeWidth)throw new Error('Keyhole entry diameter must be larger than its neck width.');
 if(s.mountType==='slot'&&s.mountLength<s.mountWidth||s.mountType==='keyhole'&&(s.mountLength<s.mountHead||s.mountHead<=s.mountWidth))throw new Error('Mounting slot length must exceed its width; a keyhole entry must be wider than its neck.');
 if(s.headStyle!=='plain'&&(s.headDepth>=s.thickness-1||s.mountHead<=s.mountWidth))throw new Error('Head recess must leave at least 1 mm of board, and its diameter must exceed the screw width.');
 if(s.mountType==='keyhole'&&s.headStyle!=='plain')throw new Error('Keyhole screw mounts use a plain opening. Select plain, or use round / slotted mounts.');
 const [hw,hh]=holeBounds(s),dx=s.layout==='staggered'?s.pitchX/2:s.pitchX,dy=s.pitchY;
 // Neighbor clearance is checked on exact outlines below; this catches obvious same-row overlap early.
 if(s.pitchX<=hw+1.2)throw new Error('Increase horizontal spacing or reduce hole size: leave at least 1.2 mm between holes.');
 if(s.layout==='square'&&s.pitchY<=hh+1.2)throw new Error('Increase vertical spacing or reduce hole size: leave at least 1.2 mm between holes.');
 if(Math.min(...s.bed.slice(0,2))<=2*s.bedMargin+10)throw new Error('Reduce the printer edge allowance or increase the print bed size.');
 return s;
}
export function ellipse(w,h,n=64){return Array.from({length:n},(_,i)=>[w/2*Math.cos(i*2*Math.PI/n),h/2*Math.sin(i*2*Math.PI/n)]);}
export function rounded(w,h,r,n=12){if(r<.01)return[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]];const p=[];for(const[x,y,a]of[[w/2-r,h/2-r,0],[-w/2+r,h/2-r,90],[-w/2+r,-h/2+r,180],[w/2-r,-h/2+r,270]])for(let i=0;i<=n;i++){const b=(a+i*90/n)*Math.PI/180;p.push([x+r*Math.cos(b),y+r*Math.sin(b)]);}return p;}
export function boardOutline(s){if(s.outline==='oval')return ellipse(s.width,s.height,128);if(s.outline==='hexagon')return[[s.width/2,0],[s.width/4,s.height/2],[-s.width/4,s.height/2],[-s.width/2,0],[-s.width/4,-s.height/2],[s.width/4,-s.height/2]];return rounded(s.width,s.height,s.outline==='rounded'?s.corner:0);}
export function rotate(p,a){const c=Math.cos(a*Math.PI/180),t=Math.sin(a*Math.PI/180);return p.map(([x,y])=>[x*c-y*t,x*t+y*c]);}
export function holePolygons(s,mount=false,expand=0){const type=mount?s.mountType:s.pattern,w=(mount?s.mountWidth:s.holeWidth)+2*expand,l=(mount?s.mountLength:s.holeLength)+2*expand,head=(mount?s.mountHead:s.holeHead)+2*expand,angle=mount?s.mountAngle:s.holeAngle;let polys;
 if(type==='round')polys=[ellipse(w,w,48)];
 else if(type==='slot')polys=[rounded(w,l,w/2,12)];
 else if(type==='keyhole'){const cy=-l/2+head/2,len=l-head/2+w/2,center=(head-w)/4;polys=[ellipse(head,head,48).map(([x,y])=>[x,y+cy]),rounded(w,len,w/2).map(([x,y])=>[x,y+center])];}
 else if(type==='square')polys=[rounded(w,w,0)];
 else if(type==='diamond')polys=[[[0,w/2],[w/2,0],[0,-w/2],[-w/2,0]]];
 else polys=[ellipse(w/Math.cos(Math.PI/6),w/Math.cos(Math.PI/6),6)]; // Across flats measures the gap between the parallel top/bottom edges.
 return polys.map(p=>rotate(p,angle));
}
export function holeBounds(s,mount=false,expand=0){const pts=holePolygons(s,mount,expand).flat();return [0,1].map(a=>Math.max(...pts.map(p=>p[a]))-Math.min(...pts.map(p=>p[a])));}
export function pointInside(poly,[x,y]){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export function distanceSegment(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
export function clearance(poly,p){return (pointInside(poly,p)?1:-1)*Math.min(...poly.map((a,i)=>distanceSegment(p,a,poly[(i+1)%poly.length])));}
export function tiles(s){const capacity=s.bed.slice(0,2).map(n=>n-2*s.bedMargin),plans=[[Math.ceil(s.width/capacity[0]),Math.ceil(s.height/capacity[1])],[Math.ceil(s.width/capacity[1]),Math.ceil(s.height/capacity[0])]];const[nx,ny]=s.split?plans.sort((a,b)=>a[0]*a[1]-b[0]*b[1])[0]:[1,1];if(nx*ny>36)throw new Error('This layout needs more than 36 tiles. Increase bed size or reduce the board.');const result=[];for(let row=0;row<ny;row++)for(let col=0;col<nx;col++){const w=s.width/nx,h=s.height/ny;result.push({id:`R${row+1}-C${col+1}`,row,col,nx,ny,x:-s.width/2+(col+.5)*w,y:-s.height/2+(row+.5)*h,width:w,height:h});}return result;}
export function mountPositions(s,t){if(s.mountLayout==='none')return[];if(s.mountLayout==='custom')return s.mounts.filter(([x,y])=>x>=t.x-t.width/2&&x<t.x+t.width/2&&y>=t.y-t.height/2&&y<t.y+t.height/2);const w=t.width/2-s.mountInset,h=t.height/2-s.mountInset;if(w<=0||h<=0)throw new Error('Mount inset is too large for a panel. Reduce the inset or use fewer tiles.');let pts=s.mountLayout==='top'?[[-w,h],[w,h]]:s.mountLayout==='six'?[[-w,h],[0,h],[w,h],[-w,-h],[0,-h],[w,-h]]:[[-w,h],[w,h],[-w,-h],[w,-h]];
 if(!s.split&&s.outline==='oval'){const rx=w,ry=h;pts=s.mountLayout==='top'?[[-rx*.65,ry*.65],[rx*.65,ry*.65]]:s.mountLayout==='six'?Array.from({length:6},(_,i)=>[rx*Math.cos(i*Math.PI/3),ry*Math.sin(i*Math.PI/3)]):[[-rx*.65,ry*.65],[rx*.65,ry*.65],[-rx*.65,-ry*.65],[rx*.65,-ry*.65]];}
 if(!s.split&&s.outline==='hexagon')pts=pts.map(([x,y])=>[x*.45,y]);return pts.map(([x,y])=>[x+t.x,y+t.y]);}
export function layout(s){validate(s);const outline=boardOutline(s),holePts=holePolygons(s).flat(),hr=Math.max(...holePts.map(p=>Math.hypot(...p))),mountPts=holePolygons(s,true).flat(),mr=Math.max(...mountPts.map(p=>Math.hypot(...p)))+(s.spacer>0?s.spacerWall:0)+(s.headStyle!=='plain'?(s.mountHead-s.mountWidth)/2:0);const panelList=tiles(s),candidates=[];
 const rowMin=Math.ceil((-s.height/2-s.offsetY)/s.pitchY),rowMax=Math.floor((s.height/2-s.offsetY)/s.pitchY);let generated=0;
 for(let row=rowMin;row<=rowMax;row++){const shift=s.layout==='staggered'&&Math.abs(row)%2?s.pitchX/2:0;const xmin=Math.ceil((-s.width/2-s.offsetX-shift)/s.pitchX),xmax=Math.floor((s.width/2-s.offsetX-shift)/s.pitchX);for(let col=xmin;col<=xmax;col++){if(++generated>6000)throw new Error('Increase hole spacing: this board exceeds the preview limit.');const pos=[col*s.pitchX+s.offsetX+shift,row*s.pitchY+s.offsetY];if(clearance(outline,pos)>=s.margin+hr)candidates.push(pos);}}
 if(candidates.length>1200)throw new Error('Use wider spacing or a smaller board (up to 1,200 pattern holes).');
 const panels=[];let skipped=0;
 for(const t of panelList){const center=[t.x,t.y];if(!pointInside(outline,center)&&clearance(outline,center)<-Math.hypot(t.width,t.height)/2)continue;const mounts=mountPositions(s,t).filter(p=>clearance(outline,p)>=mr+1.2&&Math.abs(p[0]-t.x)+mr+1.2<=t.width/2&&Math.abs(p[1]-t.y)+mr+1.2<=t.height/2);
  if(s.mountLayout==='custom'&&mounts.length!==mountPositions(s,t).length)throw new Error('A custom screw position is too close to an edge. Move it inward.');
  for(let i=0;i<mounts.length;i++)for(let j=0;j<i;j++)if(Math.hypot(mounts[i][0]-mounts[j][0],mounts[i][1]-mounts[j][1])<2*mr+1.2)throw new Error('Screw mounts overlap. Move them apart or reduce their size.');
  const holes=candidates.filter(p=>{const inCell=Math.abs(p[0]-t.x)<=t.width/2&&Math.abs(p[1]-t.y)<=t.height/2;if(!inCell)return false;const seam=(t.nx>1||t.ny>1)?s.seamMargin:0;if(Math.abs(p[0]-t.x)+hr+seam>t.width/2||Math.abs(p[1]-t.y)+hr+seam>t.height/2||mounts.some(m=>Math.hypot(p[0]-m[0],p[1]-m[1])<hr+mr+2)){skipped++;return false;}return true;});
  // Protect thin webs for staggered layouts using actual polygon boundaries.
  for(let i=0;i<holes.length;i++)for(let j=i+1;j<holes.length;j++){const a=holes[i],b=holes[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>2*hr+1.2)continue;for(const pa of holePolygons(s))for(const pb of holePolygons(s)){const shifted=pb.map(([x,y])=>[x+b[0]-a[0],y+b[1]-a[1]]);if(pa.some(p=>clearance(shifted,p)>0)||shifted.some(p=>clearance(pa,p)>0)||Math.min(...pa.map(p=>Math.abs(clearance(shifted,p))),...shifted.map(p=>Math.abs(clearance(pa,p))))<1.2)throw new Error('Holes are too close in this staggered layout. Increase spacing or reduce their size.');}}
  panels.push({...t,holes,mounts});
 }
 if(!panels.length)throw new Error('No printable panels remain. Adjust the board or tile size.');
 if(!panels.some(t=>t.holes.length))throw new Error('No pattern holes fit. Reduce border or spacing, or enlarge the board.');
 const warnings=[];if(skipped)warnings.push(`${skipped} pattern positions omitted to protect mounts and tile edges.`);if(s.mountLayout!=='none'&&s.mountLayout!=='custom'&&panels.some(t=>t.mounts.length<mountPositions(s,t).length))warnings.push('Some screw positions do not fit this outline. Inspect the mounts or use custom positions.');if(s.mountLayout==='custom'&&panels.reduce((n,p)=>n+p.mounts.length,0)!==s.mounts.length)throw new Error('A custom screw position is outside the board.');return{panels,outline,skipped,warnings,holeCount:panels.reduce((n,p)=>n+p.holes.length,0),mountCount:panels.reduce((n,p)=>n+p.mounts.length,0)};
}
export function fitBed(dims,bed,margin=0){const[x,y,z]=dims,[w,h,t]=bed;return{fits:z<=t+.001&&(x+2*margin<=w+.001&&y+2*margin<=h+.001||y+2*margin<=w+.001&&x+2*margin<=h+.001),rotate:x+2*margin>w+.001||y+2*margin>h+.001};}
