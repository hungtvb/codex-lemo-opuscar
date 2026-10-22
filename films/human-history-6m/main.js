/* Lịch sử loài người — 6 phút.
 * Original illustrated historical documentary, Lemo-Opuscar browser frame contract.
 * Deterministic watercolor scene cache; film frames rendered through the real upstream
 * Lemo-Opuscar core/render/video.mjs (Playwright -> FFmpeg).
 */
(()=>{
"use strict";
const W=1280,H=720,N=12,CH=30,DUR=360,cv=document.getElementById('film'),c=cv.getContext('2d',{alpha:false});
const TAU=Math.PI*2;
const P=[
 ['#122b41','#557585','#b6a28d','#ece2bf'],  // planet
 ['#527f85','#beae79','#d9ae70','#eee3bb'],  // savanna
 ['#111f39','#483b41','#b36b4b','#d9b38c'], // fire
 ['#26485e','#86a8a2','#cebb85','#efdec0'], // africa
 ['#423e3e','#986b52','#c49d72','#f1d7a7'], // cave
 ['#577c81','#a4b49a','#d3bd80','#ece1bd'], // agriculture
 ['#617c8a','#a6a59a','#c3a37a','#eee1c1'], // city
 ['#41566b','#a99a80','#caa678','#ecdfbc'], // trade
 ['#152e44','#47677c','#ab9b76','#ebe0bb'], // knowledge
 ['#395e75','#7a9ca0','#b8b6a0','#eee6cd'],// oceans
 ['#384554','#73828b','#c2a88f','#e1d5be'], // industry
 ['#172a4e','#45698e','#7ca4ad','#e3d8b9'] // future
];
let seed=21;const rs=n=>seed=(n|0)^0x9e3779b9;
const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)|0)>>>0)/4294967296;
const r=(a,b)=>a+(b-a)*rnd(), clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), mix=(a,b,t)=>{let x=clamp((t-a)/(b-a));return x*x*(3-2*x)};
const lerp=(a,b,p)=>a+(b-a)*p;
function ellipse(g,x,y,rx,ry,fill,alpha=1){
 g.globalAlpha=alpha;g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);g.fillStyle=fill;g.fill();g.globalAlpha=1;
}
function rect(g,x,y,w,h,fill,alpha=1){g.globalAlpha=alpha;g.fillStyle=fill;g.fillRect(x,y,w,h);g.globalAlpha=1}
function line(g,arr,color,width=3,alpha=1,dash=[]){
 g.save();g.globalAlpha=alpha;g.lineCap='round';g.lineJoin='round';g.lineWidth=width;g.strokeStyle=color;g.setLineDash(dash);
 g.beginPath();g.moveTo(...arr[0]);for(let i=1;i<arr.length;i++)g.lineTo(...arr[i]);g.stroke();g.restore();
}
function poly(g,arr,fill,alpha=1){
 g.save();g.globalAlpha=alpha;g.fillStyle=fill;g.beginPath();g.moveTo(...arr[0]);
 for(let i=1;i<arr.length;i++)g.lineTo(...arr[i]);g.closePath();g.fill();g.restore();
}
function brush(g,x0,y0,x1,y1,width,color,alpha=.28){
 // One physical dry-brush stroke: tapered watercolor ribbon + individual bristle tracks.
 const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 const a=[],b=[];
 for(let i=0;i<=8;i++){
  const u=i/8,q=(.17+.83*Math.sin(Math.PI*u))*(.81+.36*rnd())*width*.5;
  const x=lerp(x0,x1,u),y=lerp(y0,y1,u);
  a.push([x+q*nx,y+q*ny]);b.push([x-q*nx,y-q*ny]);
 }
 poly(g,a.concat(b.reverse()),color,alpha);
 for(let k=0;k<3;k++){
  const s=r(-width*.32,width*.32),f=r(.02,.16),e=r(.64,.96);
  line(g,[[lerp(x0,x1,f)+nx*s,lerp(y0,y1,f)+ny*s],
          [lerp(x0,x1,e)+nx*s,lerp(y0,y1,e)+ny*s]],color,r(.35,1.1),alpha*.55,[r(3,9),r(2,9)]);
 }
}
function spiral(g,x,y,rad,col,alpha=.6){
 const pts=[];for(let j=0;j<115;j++){let p=j/114,a=p*TAU*3;pts.push([x+Math.cos(a)*rad*p,y+Math.sin(a)*rad*p]);}
 line(g,pts,col,2,alpha);
}
function washCircle(g,x,y,rx,ry,col,alpha=.19,count=10){
 for(let j=0;j<count;j++)ellipse(g,x+r(-rx*.1,rx*.1),y+r(-ry*.1,ry*.1),rx*r(.82,1.05),ry*r(.82,1.05),col,alpha/count*3);
}
function hills(g,ii){
 const [a,b,d]=P[ii];
 for(let layer=0;layer<4;layer++){
  const y=400+layer*48;
  let pts=[[0,H],[0,y]];
  for(let x=0;x<=W;x+=48)pts.push([x,y+18*Math.sin(x*.007+ii+layer)+10*Math.sin(x*.024+layer*3)]);
  pts.push([W,H]);
  poly(g,pts,[b,d,'#9b8f72','#67765e'][layer],.13+layer*.13);
 }
}
function sky(g,i){
 const grd=g.createLinearGradient(0,0,0,H);
 grd.addColorStop(0,P[i][0]);grd.addColorStop(.65,P[i][1]);grd.addColorStop(1,P[i][3]);
 g.fillStyle=grd;g.fillRect(0,0,W,H);
 for(let j=0;j<55;j++){
  let x=r(-200,1400),y=r(-40,720);
  brush(g,x,y,x+r(45,230),y+r(-40,40),r(8,55),P[i][3],r(.008,.032));
 }
}
function vegetation(g,x,y,s,col='#566b53'){
 brush(g,x,y,x+s*.13,y-s*.85,s*.18,'#6c6652',.6);
 for(let k=0;k<40;k++){
  const ang=r(-Math.PI,0),rr=r(.15,.8)*s,cx=x+Math.cos(ang)*rr,cy=y-s*.65+Math.sin(ang)*rr*.46;
  brush(g,cx,cy,cx+r(-12,12),cy+r(2,13),r(6,19)*s/100,col,r(.15,.34));
 }
}
function human(g,x,y,scale=.9,col='#413c35',pose=0){
 g.save();g.translate(x,y);g.scale(scale,scale);
 const step=Math.sin(pose)*10;
 ellipse(g,0,-91,17,20,col,.88);
 brush(g,0,-72,0,-25,24,col,.83);
 line(g,[[-3,-29],[-18+step,4]],col,12,.87);
 line(g,[[3,-29],[17-step,4]],col,12,.87);
 line(g,[[-7,-64],[-23+step,-31]],col,9,.8);
 line(g,[[7,-64],[22-step,-29]],col,9,.8);
 g.restore();
}
function acacia(g,x,y,s){
 brush(g,x,y,x-5*s,y-142*s,19*s,'#605b40',.62);
 brush(g,x-2*s,y-93*s,x-82*s,y-134*s,12*s,'#665b42',.57);
 brush(g,x-4*s,y-119*s,x+96*s,y-138*s,10*s,'#665b42',.57);
 for(let j=0;j<85;j++){
  const xx=x+r(-125,125)*s,yy=y-150*s+r(-35,26)*s;
  brush(g,xx,yy,xx+r(-13,13)*s,yy+4*s,r(5,18)*s,'#4e6952',r(.08,.22));
 }
}
function rock(g,x,y,s,col='#827766'){
 poly(g,[[x-32*s,y],[x-40*s,y-18*s],[x-15*s,y-46*s],[x+24*s,y-30*s],[x+39*s,y]],col,.65);
 brush(g,x-22*s,y-14*s,x+18*s,y-14*s,9*s,'#d5c39e',.32);
}
function ship(g,x,y,s,blue='#473b36'){
 const hull=[[x-145*s,y],[x+138*s,y],[x+96*s,y+42*s],[x-103*s,y+42*s]];
 poly(g,hull,blue,.83);
 brush(g,x,y-225*s,x,y+12*s,12*s,blue,.9);
 poly(g,[[x+4*s,y-220*s],[x+104*s,y-95*s],[x+4*s,y-85*s]],'#e6d8b9',.7);
 poly(g,[[x-10*s,y-170*s],[x-121*s,y-72*s],[x-10*s,y-63*s]],'#e4d8b7',.74);
 for(let j=0;j<18;j++)brush(g,x-130*s+j*14*s,y+49*s,x-125*s+j*14*s,y+58*s,3*s,'#e4d0a5',.17);
}
function orbit(g,x,y,rx,ry,col='#d9c6a1',n=4){
 for(let j=0;j<n;j++){
  g.save();g.translate(x,y);g.rotate(j*Math.PI/n);
  g.strokeStyle=col;g.globalAlpha=.14;g.lineWidth=2;
  g.beginPath();g.ellipse(0,0,rx,ry,0,0,TAU);g.stroke();g.restore();
 }
}
function planet(g,x,y,R){
 washCircle(g,x,y,R,R,'#3d7a89',.3,15);
 ellipse(g,x,y,R,R,'#2b687f',.68);
 g.save();g.beginPath();g.arc(x,y,R,0,TAU);g.clip();
 const cont=[
  [[-.62,-.75],[-.26,-.86],[.04,-.62],[-.16,-.35],[-.41,-.22],[-.36,.02],[-.62,.16],[-.87,-.24]],
  [[-.28,.03],[.13,.1],[.33,.34],[.22,.64],[-.01,.92],[-.22,.67],[-.19,.29]],
  [[.06,-.78],[.56,-.71],[.82,-.34],[.56,-.12],[.62,.24],[.31,.45],[.05,.17],[.14,-.18],[-.01,-.5]]
 ];
 for(let i=0;i<cont.length;i++){
  const p=cont[i].map(([a,b])=>[x+a*R,y+b*R]);
  poly(g,p,'#7ead8b',.5);
  for(let j=0;j<70;j++){
   const xx=x+r(-R,R),yy=y+r(-R,R);
   if((xx-x)**2+(yy-y)**2<R*R)brush(g,xx,yy,xx+r(-9,9),yy+r(-8,8),r(4,10),'#afd2a6',.045);
  }
 }
 for(let i=0;i<7;i++)line(g,[[x-R,y+(i-3)*R*.25],[x+R,y+(i-3)*R*.25]],'#d8ece2',1,.08);
 g.restore();
 ellipse(g,x-R*.35,y-R*.35,R*.28,R*.13,'#f1f4dc',.08);
}
function drawScene(i){
 rs(i*94818+7721);
 const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
 const g=canvas.getContext('2d');
 sky(g,i);
 if(i===0){
  // cosmic deep time and an evolving planet
  for(let k=0;k<340;k++){
   let x=r(0,W),y=r(0,650),v=r(.3,1.9);
   ellipse(g,x,y,v,v,P[i][3],r(.2,.7));
  }
  orbit(g,845,344,410,235,'#a8c4cb',3);
  planet(g,840,330,205);
  spiral(g,215,385,155,'#e0d4a5',.19);
  for(let j=0;j<80;j++)brush(g,r(0,400),r(140,610),r(0,410),r(140,610),r(2,10),'#c4b78c',.02);
 }
 if(i===1){
  hills(g,i);
  acacia(g,240,480,1.15);acacia(g,1022,510,.84);
  for(let k=0;k<120;k++){
   const x=r(0,W),y=r(505,655);brush(g,x,y,x+r(-6,6),y-r(3,27),r(2,8),'#968a54',.26);
  }
  human(g,572,543,1.25,'#493c33',.1);
  human(g,708,565,.9,'#46362f',.6);
  human(g,805,566,.75,'#514038',1.8);
  ellipse(g,610,570,215,20,'#51412c',.08);
 }
 if(i===2){
  // nocturnal communal camp, striking orange fire
  hills(g,i);
  for(let k=0;k<210;k++)ellipse(g,r(0,W),r(50,500),r(.3,1.3),r(.3,1.3),'#f1dfa6',r(.1,.42));
  for(let j=0;j<19;j++){
   const x=r(535,750),y=r(370,540);
   brush(g,x,y,x+r(-60,60),y-r(40,180),r(18,56),['#f7b45e','#ef7e47','#f2d48a'][j%3],r(.08,.28));
  }
  for(let j=0;j<8;j++)ellipse(g,637+r(-63,63),523+r(-13,13),r(6,21),r(7,14),'#9a7859',.65);
  ellipse(g,630,495,112,93,'#d66a3c',.12);
  human(g,405,560,1.05,'#262933');
  human(g,892,560,1.0,'#242d32',.7);
  rock(g,230,540,1.2);rock(g,1015,557,1.3);
 }
 if(i===3){
  // schematic geographic atlas, no spurious pin-point precision
  ellipse(g,795,377,305,255,'#e9d9b8',.3);
  orbit(g,795,376,310,227,'#d9e9de',2);
  const africa=[[668,253],[758,209],[823,259],[870,335],[828,440],[766,512],[717,428],[692,335]];
  const asia=[[832,254],[989,211],[1118,251],[1128,336],[1040,340],[978,421],[877,365]];
  const europe=[[792,240],[838,217],[865,261],[833,291],[791,270]];
  const australia=[[1024,478],[1094,453],[1155,482],[1114,520],[1040,518]];
  for(const p of [africa,asia,europe,australia]){
   poly(g,p,'#8ca88b',.48);
   for(let n=0;n<7;n++)brush(g,p[0][0]+r(-15,45),p[0][1]+r(-15,45),p[0][0]+r(15,75),p[0][1]+r(10,85),8,'#627e6d',.11);
  }
  line(g,[[770,367],[843,286],[931,280],[1082,315]],'#f6d69a',3,.82,[8,10]);
  line(g,[[773,380],[880,447],[1038,483]],'#f6d69a',3,.7,[8,10]);
  ellipse(g,765,368,9,9,'#efc579',.88);
  for(let n=0;n<50;n++)ellipse(g,r(530,1180),r(120,580),r(.4,1.5),r(.4,1.5),'#e8e3c7',.18);
 }
 if(i===4){
  // cave art: ochre pigments and direct handprints
  for(let j=0;j<110;j++)brush(g,r(0,W),r(0,H),r(0,W),r(0,H),r(10,45),'#daaa7a',.03);
  for(let k=0;k<5;k++){
   const x=410+k*147,y=300+(k%2)*72;
   ellipse(g,x,y,45,24,'#6c4938',.6);
   ellipse(g,x+39,y-12,20,14,'#714b37',.65);
   line(g,[[x-25,y+15],[x-40,y+72]],'#684736',6,.64);
   line(g,[[x+24,y+14],[x+31,y+69]],'#684736',6,.64);
   if(k%2===0)line(g,[[x+47,y-23],[x+65,y-47]],'#6c4938',4,.5);
  }
  for(let k=0;k<17;k++){const x=r(230,1100),y=r(100,250);ellipse(g,x,y,7,18,'#a65e49',.21);}
  for(let k=0;k<7;k++)spiral(g,r(230,1050),r(485,640),r(10,40),'#d1a178',.34);
  // ancient ochre palm print
  ellipse(g,295,280,24,41,'#c97655',.44);
  for(let f=0;f<5;f++)line(g,[[270+f*12,258],[264+f*12,219-r(3,28)]],'#c97655',7,.43);
 }
 if(i===5){
  hills(g,i); // perspective cultivated landscape
  for(let j=0;j<20;j++){
   const x=j*80;
   line(g,[[660,394],[x-40,705]],'#d6bd7f',r(3,10),.38);
  }
  for(let k=0;k<440;k++){
   const x=r(0,W),y=r(432,700),s=(y-430)/280;
   brush(g,x,y,x+r(-3,3),y-r(9,30)*(s+.25),r(1,4),'#dec078',.27);
  }
  for(let k=0;k<4;k++){
   let x=180+k*165,y=433+k%2*10;
   poly(g,[[x-35,y],[x,y-40],[x+44,y],[x+44,y+35],[x-35,y+35]],'#9f7658',.75);
   poly(g,[[x-53,y],[x,y-52],[x+63,y]],'#6f7059',.75);
  }
  ellipse(g,1030,305,80,63,'#e8dfab',.12);
  vegetation(g,1020,465,105,'#688865');
 }
 if(i===6){
  hills(g,i);
  // river valley and city silhouettes; stepped ziggurat
  poly(g,[[0,655],[420,510],[702,521],[1280,635],[1280,720],[0,720]],'#618c90',.64);
  for(let j=0;j<30;j++)brush(g,r(0,W),r(555,710),r(0,W),r(555,710),r(1,5),'#d4d9bb',.08);
  for(let k=0;k<5;k++){
   const w=420-k*55,y=540-k*58;
   rect(g,710-w/2+k*8,y,w,57,'#a98565',.83);
   for(let j=0;j<12-k;j++)line(g,[[710-w/2+20+j*27,y+14],[710-w/2+20+j*27,y+42]],'#e0bf91',r(1,3),.23);
  }
  for(let k=0;k<18;k++){
   let x=120+k*58,y=r(530,620);
   rect(g,x,y,r(30,65),r(33,60),'#a5826c',.63);
  }
  // wet clay tablet, proto-cuneiform
  rect(g,110,155,185,230,'#d2b488',.76);
  for(let j=0;j<11;j++)for(let k=0;k<5;k++){
   let x=139+j%2*3+k*26,y=181+j*17;
   line(g,[[x,y],[x+8,y+3]],'#65584a',1.8,.52);
   line(g,[[x+3,y-2],[x+3,y+8]],'#65584a',1.2,.38);
  }
 }
 if(i===7){
  hills(g,i);
  // caravan along Silk Roads; merchant tent
  for(let k=0;k<8;k++){
   const x=310+k*105,y=539+k%2*8;
   ellipse(g,x,y-32,40,22,'#746454',.56);
   line(g,[[x-27,y-25],[x-31,y+20]],'#594c40',6,.72);
   line(g,[[x+23,y-23],[x+31,y+21]],'#594c40',6,.72);
   line(g,[[x+24,y-38],[x+40,y-50],[x+45,y-32]],'#655542',6,.58);
   ellipse(g,x+48,y-31,8,12,'#70614e',.62);
   ellipse(g,x-13,y-55,22,15,'#73614e',.58);
  }
  poly(g,[[85,533],[185,385],[290,533]],'#dec9a1',.47);
  line(g,[[185,386],[185,541]],'#675f54',8,.7);
  for(let j=0;j<90;j++)brush(g,r(0,W),r(545,670),r(0,W),r(550,670),r(1,5),'#f6e2ad',.07);
  ellipse(g,1030,220,80,81,'#e9d39d',.45);
 }
 if(i===8){
  // astronomy, manuscript, compass; many cultural lineages
  const x=740,y=357;
  orbit(g,x,y,300,238,'#efe0b4',6);
  for(let k=0;k<160;k++){
   const a=r(0,TAU),rad=r(30,285);
   const xx=x+Math.cos(a)*rad,yy=y+Math.sin(a)*rad*.85;
   ellipse(g,xx,yy,r(.6,2),r(.6,2),'#f6ebcc',r(.27,.8));
  }
  ellipse(g,x,y,83,83,'#d1b786',.28);
  for(let j=0;j<12;j++){
   let a=j*TAU/12;
   line(g,[[x,y],[x+Math.cos(a)*175,y+Math.sin(a)*175]],'#bfc6b7',1,.14);
  }
  // illustrated manuscript
  rect(g,165,222,320,310,'#e9ddba',.82);
  rect(g,190,248,267,257,'#d8cba6',.35);
  for(let j=0;j<12;j++)brush(g,218,273+j*17,450-r(0,110),275+j*17,r(1.5,3),'#695949',.47);
  spiral(g,329,361,63,'#b28d64',.39);
  ellipse(g,1000,493,86,86,'#bea57c',.22);
  for(let j=0;j<12;j++)line(g,[[1000,493],[1000+76*Math.cos(j*TAU/12),493+76*Math.sin(j*TAU/12)]],'#e1d5b0',1.5,.22);
 }
 if(i===9){
  // oceanic crossings, sail ship, visible far coast
  for(let j=0;j<45;j++){
   const y=460+j*6;
   brush(g,r(-50,W),y,r(-40,W),y+r(-2,2),r(1,5),'#c5d6cc',r(.03,.12));
  }
  poly(g,[[0,515],[170,410],[290,457],[376,420],[410,500],[0,575]],'#73968d',.38);
  ship(g,755,480,1.35,'#52443c');
  ellipse(g,1090,172,92,92,'#eddbb0',.28);
  for(let j=0;j<16;j++)ellipse(g,r(0,W),r(490,660),r(10,52),r(.5,2),'#e7ebe3',.08);
 }
 if(i===10){
  // industrial age: factories, wheels, rail, pollution
  hills(g,i);
  for(let j=0;j<11;j++){
   let x=290+j*87,y=r(390,485),h=r(120,230);
   rect(g,x,y,72,H-y,'#53616b',.72);
   rect(g,x+25,y-h*.47,27,h*.47,'#63626a',.7);
   for(let k=0;k<4;k++)ellipse(g,x+r(-35,62),y-h*.56-r(0,95),r(13,40),r(10,27),'#d1c5bb',.15);
   for(let k=0;k<3;k++)rect(g,x+10+k*21,y+23,10,18,'#dec59d',.43);
  }
  for(let i=0;i<3;i++){
   let x=295+i*360,y=538;
   ellipse(g,x,y,62,62,'#3a4b57',.8);ellipse(g,x,y,29,29,'#9ba4a0',.75);
   for(let k=0;k<8;k++)line(g,[[x,y],[x+53*Math.cos(k*TAU/8),y+53*Math.sin(k*TAU/8)]],'#d7ccb3',5,.64);
  }
  line(g,[[130,615],[1170,615]],'#303f49',14,.83);
  for(let k=0;k<29;k++)line(g,[[137+k*36,601],[137+k*36,644]],'#544f4d',6,.72);
 }
 if(i===11){
  // from violent century to connected technological world
  for(let k=0;k<22;k++){
   let x=k*67,y=r(416,536),h=r(60,220);
   rect(g,x,y,52,H-y,'#254258',.74);
   for(let j=0;j<5;j++)rect(g,x+10+(j%2)*19,y+16+j*25,5,9,'#e6d1a6',.29);
  }
  // digital orbit: continents and networks, a shared world
  planet(g,898,325,162);
  for(let j=0;j<145;j++){
   const a=r(0,TAU),rad=r(192,325);
   const x=898+Math.cos(a)*rad,y=325+Math.sin(a)*rad*.73;
   if(x<60||x>1260)continue;
   ellipse(g,x,y,r(1,2.5),r(1,2.5),'#cee4d8',r(.18,.7));
  }
  for(let j=0;j<36;j++){
   let ax=555+r(0,610),ay=115+r(0,495);
   let bx=555+r(0,610),by=115+r(0,495);
   line(g,[[ax,ay],[bx,by]],'#b0d8d5',r(.3,1.8),.09);
  }
  // subtle rising rocket metaphor
  poly(g,[[430,319],[451,269],[472,319],[466,414],[436,414]],'#d8ded7',.77);
  ellipse(g,450,323,12,12,'#52849d',.8);
  poly(g,[[439,416],[450,448],[461,416]],'#f1c178',.7);
 }
 return canvas;
}
const sceneCache=new Map(),paper=(()=>{
 rs(155);
 const q=document.createElement('canvas');q.width=1280;q.height=720;const g=q.getContext('2d');
 for(let j=0;j<28000;j++){
  const x=r(0,W),y=r(0,H),ss=r(.25,1.1);
  ellipse(g,x,y,ss,ss*.6,rnd()>.5?'#f8e8c4':'#42351f',rnd()>.5?.012:.007);
 }
 return q;
})();
function getScene(i){if(!sceneCache.has(i))sceneCache.set(i,drawScene(i));return sceneCache.get(i)}
let story=null,cues=[];
const splitSentences=s=>{
 const ss=s.match(/[^.!?。！？]+[.!?。！？]?/g)||[s];
 return ss.map(q=>q.trim()).filter(Boolean);
};
function wrap(g,text,maxWidth){
 const words=text.split(/\s+/),lines=[];let line='';
 for(const wd of words){const next=line?line+' '+wd:wd;
  if(g.measureText(next).width>maxWidth&&line){lines.push(line);line=wd;}else line=next;
 }
 if(line)lines.push(line);return lines;
}
function buildCues(){
 cues=story.chapters.map(ch=>{
  const sentences=splitSentences(ch.voice),weights=sentences.map(x=>x.split(/\s+/).length);
  const total=weights.reduce((a,b)=>a+b,0);let at=1.15;
  return sentences.map((text,j)=>{
   const dur=(27.4-1.15)*weights[j]/total;
   const p={text,t0:at,t1:at+dur};at+=dur;return p;
  });
 });
}
function activeCaption(i,local){return (cues[i]||[]).find(q=>local>=q.t0&&local<q.t1)||null;}
function watercolorTitle(g,i,local){
 const ch=story.chapters[i];
 g.save();
 // gallery typography, subtle archival paper substrate
 g.fillStyle='rgba(12,27,35,.37)';
 g.fillRect(0,0,W,128);
 g.fillStyle='#f3e8cc';g.font='bold 17px "DejaVu Sans", sans-serif';
 g.textAlign='left';g.fillText('LỊCH SỬ LOÀI NGƯỜI   •   PHIM TÀI LIỆU MINH HỌA',62,36);
 g.font='bold 39px "DejaVu Sans", sans-serif';
 g.shadowColor='rgba(0,0,0,.28)';g.shadowBlur=8;
 g.fillText(ch.title,61,89);
 g.shadowBlur=0;
 g.fillStyle='#e3d3ad';g.font='21px "DejaVu Sans", sans-serif';
 const ew=g.measureText(ch.era).width;
 g.fillText(ch.era,W-58-ew,87);
 g.restore();
}
function subtitles(g,i,t){
 const cue=activeCaption(i,t);
 if(!cue)return;
 const start=mix(cue.t0,cue.t0+.22,t),end=1-mix(cue.t1-.18,cue.t1,t),alpha=start*end;
 g.save();g.font='25px "DejaVu Sans", sans-serif';
 let lines=wrap(g,cue.text,1110),boxH=40+lines.length*40;
 g.globalAlpha=.85*alpha;
 g.fillStyle='#10242d';g.beginPath();
 g.roundRect(92,H-boxH-25,W-184,boxH,17);g.fill();
 g.globalAlpha=alpha;g.textAlign='center';g.textBaseline='middle';
 g.fillStyle='#f4eace';
 lines.forEach((line,j)=>g.fillText(line,W/2,H-boxH+1+j*40));
 g.restore();
}
function timeline(g,i,local){
 g.save();g.fillStyle='rgba(240,223,180,.6)';
 g.fillRect(61,144,W-122,2);
 for(let j=0;j<N;j++){
  const x=61+(W-122)*j/(N-1);
  ellipse(g,x,145,j===i?6.4:3.1,j===i?6.4:3.1,j<=i?'#f5d393':'#a2ac9e',j<=i?1:.5);
 }
 g.fillStyle='#f4e4bf';g.font='17px "DejaVu Sans", sans-serif';g.textAlign='left';
 g.fillText(String(i+1).padStart(2,'0')+' / 12',62,184);
 g.textAlign='right';
 g.fillText('06:00  •  VIỆT NAM',W-61,184);
 g.restore();
}
function animated(g,i,local){
 const u=local/30;
 if(i===0){
  const x=830,y=335;
  g.save();g.translate(x,y);g.rotate(local*.009);g.translate(-x,-y);
  for(let j=0;j<25;j++){
   const a=j*TAU/25+local*.017;
   ellipse(g,x+Math.cos(a)*237,y+Math.sin(a)*237*.75,1.4,1.4,'#f6e5bc',.48);
  }
  g.restore();
 }
 if(i===1){
  const x=575+20*Math.sin(local*.22);
  for(let k=0;k<3;k++)ellipse(g,x+k*120,578,27,4,'#393e33',.17);
 }
 if(i===2){
  const strength=.1+.9*Math.sin(local*3)**2;
  ellipse(g,642,468,100+strength*16,85+strength*12,'#fabe6a',.045);
  for(let k=0;k<12;k++){
   let y=512-((local*29+k*52)%280),x=637+Math.sin(local*3+k)*55;
   ellipse(g,x,y,2.3,3.3,'#fddc8a',.22);
  }
 }
 if(i===3){
  const x=765+u*275,y=370-55*Math.sin(u*Math.PI);
  ellipse(g,x,y,8,8,'#f8d991',.82);
  ellipse(g,x,y,20,20,'#f8d991',.08);
 }
 if(i===4){
  const x=240+u*720,y=470+22*Math.sin(u*12);
  ellipse(g,x,y,15,15,'#dfbc81',.15);
 }
 if(i===5){
  for(let k=0;k<45;k++){
   const x=(k*97+local*12)%W,y=420+(k*31)%280;
   ellipse(g,x,y,1.6,3.2,'#f5e6b8',.15);
  }
 }
 if(i===6){
  for(let k=0;k<30;k++){
   const x=(k*93+local*15)%W,y=595+21*Math.sin(k);
   ellipse(g,x,y,9,1.5,'#e3efdf',.16);
  }
 }
 if(i===7){
  for(let k=0;k<6;k++){
   const x=355+k*106+local*1.2;
   ellipse(g,x,574,8,3,'#5b483b',.17);
  }
 }
 if(i===8){
  g.save();g.translate(740,357);g.rotate(local*.006);
  line(g,[[-300,0],[300,0]],'#f5e6c6',2,.2);
  line(g,[[0,-240],[0,240]],'#f5e6c6',2,.2);
  g.restore();
 }
 if(i===9){
  for(let j=0;j<35;j++){
   const x=(j*41+local*9)%W,y=470+j*7.1;
   ellipse(g,x,y,12,1.7,'#e4f3e2',.11);
  }
 }
 if(i===10){
  for(let k=0;k<22;k++){
   const x=650+k*18+Math.sin(local*.2+k)*24;
   const y=340-((local*22+k*48)%410);
   ellipse(g,x,y,26,19,'#dad6c8',.07);
  }
 }
 if(i===11){
  const stars=70;
  for(let k=0;k<stars;k++){
   let ang=k*2.39996+local*.015,rad=27+Math.sqrt(k)*22;
   const x=899+Math.cos(ang)*rad,y=324+Math.sin(ang)*rad*.78;
   ellipse(g,x,y,1.8,1.8,'#e9f4eb',.15+.15*Math.sin(k+local)**2);
  }
 }
}
function render(t){
 t=clamp(t,0,DUR-.0001);
 const i=Math.min(N-1,Math.floor(t/CH)),local=t-i*CH;
 const w=innerWidth||W,h=innerHeight||H;
 if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
 c.setTransform(w/W,0,0,h/H,0,0);c.globalAlpha=1;c.fillStyle='#0e2435';c.fillRect(0,0,W,H);
 const pan=22*mix(0,30,local),z=1.045+.018*Math.sin(local*.095);
 function paintScene(j,opacity){
  c.save();c.globalAlpha=opacity;
  c.translate(W/2,H/2);c.scale(z,z);c.translate(-W/2-pan+10,-H/2);
  c.drawImage(getScene(j),0,0);
  c.restore();
 }
 paintScene(i,1);
 // soft watercolor interchapter mist wash, not a title card
 if(i<N-1&&local>29){
  const p=mix(29,30,local);
  paintScene(i+1,p);
 }
 animated(c,i,local);
 c.globalAlpha=.085;c.drawImage(paper,0,0);c.globalAlpha=1;
 const grad=c.createLinearGradient(0,0,0,H);
 grad.addColorStop(0,'rgba(5,19,28,.05)');grad.addColorStop(.6,'rgba(5,19,28,0)');
 grad.addColorStop(1,'rgba(12,24,30,.33)');
 c.fillStyle=grad;c.fillRect(0,0,W,H);
 watercolorTitle(c,i,local);
 timeline(c,i,local);
 subtitles(c,i,local);
 if(t<1){rect(c,0,0,W,H,'#e6dbbb',1-mix(0,1,t));}
 if(t>358.8){rect(c,0,0,W,H,'#122537',mix(358.8,360,t));}
}
window.DUR=DUR;
window.render=render;
window.TEXTS=(t)=>{
 if(!story||!cues.length)return [];
 const i=Math.min(N-1,Math.floor(t/CH)),local=t-i*CH;
 const cue=activeCaption(i,local);
 return cue?[{id:'narration-'+i+'-'+cue.t0,text:cue.text,x0:90,y0:570,x1:1190,y1:705}]:[];
};
window.EV=Array.from({length:12},(_,i)=>({t:i*30,type:'chapter',index:i}));
fetch('story.json')
 .then(r=>{if(!r.ok)throw Error('story.json HTTP '+r.status);return r.json()})
 .then(data=>{story=data;buildCues();window.READY=true;render(0);})
 .catch(e=>{console.error('Failed loading story:',e);});
})();