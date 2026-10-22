/* LỆNH CUỐI — LAST SIGNAL
 * Original six-minute kinetic cel-anime short.
 * Film engine: deterministic browser render(t) -> Lemo-Opuscar upstream Playwright/FFmpeg.
 * Layers: pre-painted airbrush backgrounds, cel-shaded character and drones,
 * emissive neon/rim lighting, wet reflections, 12fps pose drawings, analog CRT pass.
 */
(()=>{
"use strict";
const W=1280,H=720,BW=1580,BH=840,TAU=Math.PI*2;
const cv=document.querySelector('#screen'),c=cv.getContext('2d',{alpha:false});
let story=null, READY=false;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,p)=>a+(b-a)*p;
const sm=x=>{x=clamp(x);return x*x*(3-2*x)};
const ease=(a,b,x)=>sm((x-a)/(b-a));
let seed=1234567;
function reseed(x){seed=(x>>>0)||3}
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function range(a,b){return a+rand()*(b-a)}
function polygon(g,pts,fill,stroke=null,w=2,alpha=1){
 g.save();g.globalAlpha=alpha;g.fillStyle=fill;
 g.beginPath();g.moveTo(pts[0][0],pts[0][1]);
 for(let j=1;j<pts.length;j++)g.lineTo(pts[j][0],pts[j][1]);
 g.closePath();g.fill();
 if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.lineJoin='round';g.stroke();}
 g.restore();
}
function circle(g,x,y,rx,ry,col,alpha=1){
 g.save();g.globalAlpha=alpha;g.beginPath();g.ellipse(x,y,Math.max(rx,.1),Math.max(ry,.1),0,0,TAU);g.fillStyle=col;g.fill();g.restore();
}
function lines(g,pts,col,w=2,alpha=1){
 g.save();g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.strokeStyle=col;g.globalAlpha=alpha;
 g.beginPath();g.moveTo(...pts[0]);for(let j=1;j<pts.length;j++)g.lineTo(...pts[j]);g.stroke();g.restore();
}
function rect(g,x,y,w,h,col,alpha=1){g.save();g.fillStyle=col;g.globalAlpha=alpha;g.fillRect(x,y,w,h);g.restore()}
function glow(g,x,y,r,col,alpha=.6){
 const q=g.createRadialGradient(x,y,1,x,y,r);q.addColorStop(0,col);q.addColorStop(.25,col);q.addColorStop(1,'rgba(0,0,0,0)');
 g.save();g.globalAlpha=alpha;g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.restore();
}
const pal={
 city:['#0c1430','#302d55','#13253e','#f480a0','#6ef9ed'],
 street:['#101a35','#34345c','#1c3347','#ef82ac','#6de4e5'],
 alley:['#0a1830','#343556','#1b3142','#f2709d','#60e6df'],
 garage:['#131a2a','#40465f','#203240','#ffae64','#76dff7'],
 bridge:['#10253f','#49415d','#1a3348','#eb729f','#70dff0'],
 skyline:['#131a42','#50415a','#263954','#fc938e','#7bece4'],
 rooftop:['#10243b','#344461','#1b394a','#ee7899','#74e3e8'],
 platform:['#111e31','#3f4354','#223744','#ffae6d','#73e2d8'],
 tunnel:['#0b152b','#2a2f41','#192a39','#f19379','#68bedf'],
 shaft:['#11142b','#373c50','#24374b','#d984be','#74e0ec'],
 tower:['#13213d','#35324c','#203752','#ec668b','#91e1d4'],
 control:['#13162a','#282d40','#202d3b','#ff617e','#5cdeea']
};
const BG={};
function skyline(g,base,colors,depth=1){
 const [a,b,mid,pink,teal]=colors;
 for(let j=0;j<52;j++){
  const x=j*36-35+range(-13,15),w=range(19,72)*depth,h=range(110,480)*depth;
  rect(g,x,base-h,w,h,mid,range(.45,.82));
  rect(g,x+5,base-h+6,w-10,4,b,.28);
  for(let yy=base-h+18;yy<base-12;yy+=range(20,33)){
   for(let xx=x+9;xx<x+w-8;xx+=range(13,20)){
    if(rand()<.56)rect(g,xx,yy,range(3,7),range(5,11),rand()<.62?'#bca8aa':'#71a9b9',range(.25,.75));
   }
  }
  if(j%6===0){
   rect(g,x+5,base-h-26,4,26,'#9cc1b5',.55);
   glow(g,x+7,base-h-28,9,pink,.18);
  }
 }
}
function ground(g,stage){
 polygon(g,[[0,540],[BW,510],[BW,BH],[0,BH]],'#182b3c');
 for(let i=0;i<44;i++){
  const x=range(0,BW),y=range(520,BH);
  lines(g,[[x,y],[x+range(20,160),y+range(-5,5)]],i%3===0?'#f4a3af':'#77c8c6',range(1,6),range(.03,.18));
 }
 for(let i=0;i<36;i++){
  const x=range(0,BW),y=range(555,BH);
  lines(g,[[x,y],[x+range(-30,30),y+range(12,80)]],'#6681a3',range(1,3),range(.02,.17));
 }
}
function paint(st){
 reseed([...st].reduce((a,b)=>a*33+b.charCodeAt(0),37009));
 const p=pal[st]||pal.city, plate=document.createElement('canvas');plate.width=BW;plate.height=BH;
 const g=plate.getContext('2d'),grad=g.createLinearGradient(0,0,0,BH);
 grad.addColorStop(0,p[0]);grad.addColorStop(.45,p[1]);grad.addColorStop(1,p[2]);g.fillStyle=grad;g.fillRect(0,0,BW,BH);
 for(let i=0;i<38;i++){let x=range(-100,BW+100),y=range(-20,460);circle(g,x,y,range(60,210),range(25,95),'#bca2b2',range(.003,.027));}
 const urban=['city','street','alley','garage','bridge','skyline','rooftop','tower'].includes(st);
 if(urban){
  skyline(g,560,p,.84);
  skyline(g,590,[p[0],p[1],'#1a263a',p[3],p[4]],1.15);
  for(let j=0;j<12;j++){
   const x=range(0,BW),y=range(270,590);
   const pink=j%2?p[3]:p[4];
   rect(g,x,y,range(15,55),range(2,7),pink,.35);
   glow(g,x,y,range(35,95),pink,.06);
  }
 }
 if(st==='city'||st==='street'||st==='alley'){
  ground(g,st);
  // foreground steel columns; wet streets; neon tape
  for(let j=0;j<7;j++){
   let x=j*245-10;
   rect(g,x,90,25,500,'#101b2e',.8);
   lines(g,[[x+25,110],[x+25,540]],'#6b91aa',5,.26);
   if(j%2===0){
    rect(g,x+25,195,74,65,'#20384c',.87);
    rect(g,x+30,200,64,55,j%4===0?p[3]:p[4],.22);
    lines(g,[[x+30,270],[x+96,270]],p[3],3,.76);
    glow(g,x+63,225,62,p[3],.16);
   }
  }
  if(st==='alley'){
   polygon(g,[[0,0],[150,0],[470,520],[320,520]],'#14253a',.7);
   polygon(g,[[BW,0],[BW-140,0],[1140,520],[1260,520]],'#141e31',.76);
   for(let j=0;j<12;j++){let y=j*33+105;lines(g,[[110,y],[350,y+60]],'#9c89aa',2,.09);}
   for(let j=0;j<13;j++){let y=j*32+118;lines(g,[[1440,y],[1210,y+75]],p[4],2,.11);}
  }
 }
 if(st==='garage'){
  ground(g,st);
  for(let j=0;j<13;j++){
   rect(g,j*127,70,19,590,'#263e4d',.91);
   lines(g,[[j*127+10,80],[j*127+10,565]],'#8ab1b5',2,.22);
  }
  for(let j=0;j<5;j++){
   rect(g,90+j*290,385,170,153,'#334153',.85);
   rect(g,103+j*290,397,144,13,p[3],.35);
   lines(g,[[88+j*290,550],[255+j*290,550]],'#d4b58b',3,.4);
  }
 }
 if(st==='bridge'){
  ground(g,st);
  polygon(g,[[0,550],[BW,500],[BW,600],[0,673]],'#283a4a',.96);
  for(let j=0;j<12;j++){
   let x=j*150+30;rect(g,x,320,16,250,'#394e5d',.77);
   lines(g,[[x,340],[x+290,542]],'#91b4bf',2,.13);
  }
  for(let j=0;j<25;j++){
   let x=range(0,BW),y=range(583,650);
   lines(g,[[x,y],[x+range(60,210),y]],p[3],range(2,6),.12);
  }
 }
 if(st==='rooftop'){
  ground(g,st);
  polygon(g,[[0,510],[BW,510],[BW,545],[0,575]],'#395569',.85);
  for(let j=0;j<7;j++){
   const x=70+j*237;
   rect(g,x,410,130,107,'#344356',.92);
   rect(g,x+20,395,91,18,'#617080',.71);
   for(let k=0;k<4;k++)lines(g,[[x+8+k*30,436],[x+8+k*30,495]],'#96a5b0',2,.3);
  }
  for(let j=0;j<18;j++)lines(g,[[j*94,445],[j*94,520]],'#687e8b',2,.4);
  lines(g,[[0,445],[BW,445]],'#c4a4ab',5,.49);
 }
 if(st==='skyline'){
  skyline(g,700,['#07122d','#304465','#14283f',p[3],p[4]],1.2);
  for(let j=0;j<45;j++){const x=range(0,BW),y=range(140,640);circle(g,x,y,range(2,7),range(2,6),rand()<.5?p[3]:p[4],range(.15,.48));}
 }
 if(st==='platform'||st==='tunnel'){
  rect(g,0,0,BW,BH,'#111f31',.7);
  // converging tunnel rails and pipes create depth
  polygon(g,[[0,0],[BW,0],[960,510],[560,510]],'#202d3c',.82);
  for(let j=0;j<28;j++){
   let q=j/28,x=range(0,BW),w=range(10,33);
   rect(g,j*65-30,38,w,605,'#334455',.63);
   lines(g,[[j*65,80],[820,430]],'#48647a',1,.2);
  }
  polygon(g,[[0,560],[BW,530],[BW,BH],[0,BH]],'#2a3840',1);
  lines(g,[[0,685],[850,530],[BW,650]],'#bfc0a5',11,.47);
  lines(g,[[0,730],[850,555],[BW,700]],'#8397ad',9,.44);
  for(let k=0;k<16;k++){
   let x=k*112;rect(g,x,565,20,110,'#596075',.57);
  }
  for(let j=0;j<9;j++){
   let x=j*195+5;rect(g,x,275,68,32,p[3],.25);glow(g,x+34,290,65,p[3],.12);
  }
  if(st==='platform'){
   polygon(g,[[0,532],[680,530],[770,578],[0,670]],'#45565d',.87);
   lines(g,[[0,521],[680,515]],'#f4be86',7,.67);
   for(let j=0;j<7;j++){
    let x=j*230;rect(g,x,0,38,530,'#3c4859',.8);rect(g,x+5,120,28,21,'#b4bbc0',.59);
   }
  }
 }
 if(st==='shaft'){
  rect(g,0,0,BW,BH,'#10192c',.75);
  for(let j=0;j<19;j++){
   let x=60+j*86;
   rect(g,x,0,18,BH,'#2c4156',.76);
   lines(g,[[x+20,0],[x+20,BH]],'#669eb1',4,.36);
  }
  for(let j=0;j<13;j++){
   let y=j*90;
   rect(g,0,y,BW,12,'#2a3c4d',.85);
   for(let k=0;k<12;k++)lines(g,[[k*136,y],[k*136+100,y+12]],'#a17ba2',1,.25);
  }
  glow(g,800,380,240,p[4],.12);
 }
 if(st==='tower'){
  skyline(g,600,p,.76);
  polygon(g,[[665,BH],[700,100],[875,50],[940,BH]],'#273b52',.92);
  for(let j=0;j<23;j++){
   let y=150+j*26,x=685+(y-150)*.035;
   lines(g,[[x,y],[905,y]],j%3===0?p[3]:'#a3c5c4',j%3===0?5:2,j%3===0?.55:.14);
  }
  glow(g,790,120,95,p[3],.19);
  for(let j=0;j<20;j++){let x=rand()*BW,y=rand()*BH;circle(g,x,y,1.4,1.4,p[4],.22);}
 }
 if(st==='control'){
  rect(g,0,0,BW,BH,'#0b1727',.7);
  for(let j=0;j<12;j++){
   let x=j*144+24;
   rect(g,x,100,105,400,'#223a4c',.93);
   rect(g,x+11,120,84,220,j%3===0?'#396878':'#274358',.72);
   for(let k=0;k<24;k++)lines(g,[[x+20,146+k*8],[x+range(33,89),146+k*8]],k%6===0?p[3]:p[4],2,range(.1,.42));
   glow(g,x+53,250,76,j%3===0?p[3]:p[4],.055);
  }
  polygon(g,[[0,564],[BW,564],[BW,BH],[0,BH]],'#202b39',1);
  polygon(g,[[610,550],[810,550],[900,700],[530,700]],'#3c4254',.97);
  rect(g,642,500,142,55,'#6d5265',.85);
  glow(g,718,515,160,p[3],.13);
  for(let j=0;j<19;j++){
   let x=range(0,BW),y=range(575,BH);
   lines(g,[[x,y],[x+range(-20,20),y+20]],'#91a9bd',2,.1);
  }
 }
 // Airbrush atmosphere
 for(let j=0;j<55;j++){
  let x=range(0,BW),y=range(0,BH);
  circle(g,x,y,range(14,62),range(12,44),p[j%2===0?3:4],range(.001,.007));
 }
 BG[st]=plate;
}
function background(g,stage,t,speed=0,offset=0){
 const plate=BG[stage]||BG.street;
 const wig=25*Math.sin(t*.045+offset), shift=speed*46;
 g.drawImage(plate,-150-shift-wig,-95,1580,840);
 if(stage==='control'){
  const flash=.3+.7*Math.sin(t*2.6)**2;
  glow(g,647,399,230,'#fa466b',flash*.08);
 }
}
function rain(g,shot,t){
 const active=shot.act!==5?1:.3;
 const wind=shot.action==='chase'||shot.action==='run'?1.9:1;
 const bright=shot.stage==='tunnel'||shot.stage==='control'?.12:.5;
 for(let j=0;j<185;j++){
  const phase=j*3187.443;const x=((j*997+67+t*170*wind)%1460)-85,y=((j*263.3+t*(270+wind*80))%850)-40;
  lines(g,[[x,y],[x-12*wind,y+rangeStable(j,10,26)]],j%7===0?'#c4e6e7':'#95a9cc',j%6===0?1.5:.7,active*bright*(j%4===0?.42:.23));
 }
}
const rangeStable=(i,a,b)=>a+(b-a)*((Math.sin(i*457.839)+1)/2);
function speedlines(g,t,intensity=1){
 const cx=640,cy=315;
 for(let j=0;j<36;j++){
  const a=j*TAU/36+.15;
  const x=cx+Math.cos(a)*rangeStable(j,320,480),y=cy+Math.sin(a)*rangeStable(j+8,210,335);
  const x2=cx+(x-cx)*1.28,y2=cy+(y-cy)*1.28;
  lines(g,[[x,y],[x2,y2]],j%3===0?'#fff1bf':'#79d5e1',rangeStable(j+6,1,3.5),.05*intensity);
 }
}
function rectCel(g,x,y,w,h,fill,lineCol,outline=2){rect(g,x,y,w,h,fill);g.save();g.strokeStyle=lineCol;g.lineWidth=outline;g.strokeRect(x,y,w,h);g.restore()}
function limb(g,pts,w,main,shadow,edge){
 lines(g,pts,edge,w+5,1);lines(g,pts,shadow,w+1,.97);lines(g,pts,main,w*.72,.97);
}
function hero(g,x,y,scale,action,p,t,face=1){
 const stepped=Math.floor(t*12)/12,cycle=stepped*13;
 const running=['run','escape','chase','dodge','ride','train','climb'].includes(action);
 const launching=['leap','air','fall','land'].includes(action);
 const fighting=['fight','kick','impact','guard','recover'].includes(action);
 const ducking=['slide','duck','sneak'].includes(action);
 const jitter=running?Math.sin(cycle)*4:0;
 const kick=(action==='kick'||action==='fight')?Math.sin(Math.PI*ease(.19,.73,p))*1.0:0;
 const leaning=running?-.11:launching?.16:fighting?-.08:0;
 g.save();g.translate(x,y+jitter);
 if(face===-1)g.scale(-1,1);
 g.scale(scale,scale);g.rotate(leaning);
 if(launching){g.translate(0,-Math.sin(Math.PI*p)*76);g.rotate(Math.sin(Math.PI*p)*.12);}
 if(ducking){g.translate(0,38);g.scale(1,.75);}
 // cast shadow
 circle(g,4,6,53,8,'#0b1824',.39);
 const swing=running?Math.sin(cycle)*30:0;
 const lift=running?Math.abs(Math.sin(cycle))*8:0;
 const stride1=running?swing:action==='kick'?kick*80:action==='fight'?kick*40:0;
 const stride2=running?-swing:0;
 limb(g,[[-8,-71],[-15+stride1*.6,-35],[-17+stride1,-4-lift]],19,'#495b71','#303b52','#101e34');
 limb(g,[[15,-69],[22+stride2*.6,-35],[18+stride2,-2-lift]],19,'#41576b','#263b53','#101e34');
 polygon(g,[[-32+stride1,-9],[-3+stride1,-10],[5+stride1,0],[-35+stride1,3]],'#2a3646','#111a2c',2);
 polygon(g,[[5+stride2,-8],[33+stride2,-10],[45+stride2,1],[3+stride2,1]],'#2b394c','#101a2e',2);
 // suit torso hard shadow
 polygon(g,[[-35,-130],[-10,-151],[27,-149],[42,-122],[33,-69],[-25,-66]],'#43566f','#1c3048',2.8);
 polygon(g,[[-33,-125],[-6,-142],[5,-96],[-20,-73],[-31,-81]],'#273b58');
 polygon(g,[[5,-148],[27,-146],[38,-112],[22,-103],[8,-120]],'#586981');
 // strap, emblem
 polygon(g,[[-20,-131],[-12,-137],[31,-80],[24,-74]],'#748397','#314158',1);
 circle(g,9,-99,6,6,'#e5d8a8',.88);
 // arms animated: head height 170 px; arm rear and front
 const left=swing*.6, right=-swing*.65, punch=fighting?kick*67:0;
 limb(g,[[-24,-135],[-43+left,-106],[-33+left,-72]],16,'#57657c','#2e4157','#17253a');
 limb(g,[[29,-132],[46+right,-104],[33+right+punch,-68+(-punch*.53)]],17,'#5b6c82','#34465e','#13273e');
 polygon(g,[[-43+left,-77],[-25+left,-77],[-22+left,-65],[-46+left,-64]],'#242e43','#172338',2);
 polygon(g,[[26+right+punch,-74-punch*.5],[43+right+punch,-76-punch*.5],[47+right+punch,-62-punch*.5],[27+right+punch,-62-punch*.5]],'#292c42','#172439',2);
 // neck and face: angular profile with tapered jaw, almond eye under visor
 rect(g,-3,-160,17,25,'#b9a29b');
 polygon(g,[[-24,-198],[-4,-207],[22,-191],[27,-163],[9,-145],[-16,-154],[-25,-176]],'#cbb2a7','#714f66',2);
 polygon(g,[[-21,-190],[5,-206],[22,-191],[14,-179],[-8,-176]],'#8a778e');
 polygon(g,[[12,-190],[24,-181],[22,-168],[9,-164]],'#9f7d8b');
 // hair/helmet night blue with orange accent
 polygon(g,[[-33,-206],[-10,-224],[17,-224],[34,-204],[28,-189],[0,-201],[-27,-194]],'#293954','#111d35',2.6);
 polygon(g,[[-28,-201],[-5,-220],[17,-212],[26,-201],[-3,-206]],'#52647e');
 rect(g,-22,-199,45,10,'#344b69');
 polygon(g,[[2,-185],[29,-186],[30,-174],[5,-173]],'#5b97a9','#19374c',2);
 polygon(g,[[13,-183],[23,-181],[20,-176],[12,-177]],'#d4f2dd');
 // scarf sits at collar and trails on stepped on-twos
 const flap=Math.sin(stepped*8.2);
 polygon(g,[[-12,-144],[10,-151],[19,-139],[-4,-130]],'#f46655','#873f57',2);
 const tail=running||launching?65:40;
 polygon(g,[[-8,-138],[-21,-151],[-tail,-159+flap*10],[-tail-16,-149+flap*11],[-25,-137]],'#f96552','#9c3049',2);
 polygon(g,[[-24,-148],[-tail+13,-151+flap*9],[-tail-10,-143+flap*9],[-26,-142]],'#ff9970',null,1,.76);
 // rim highlights
 lines(g,[[16,-216],[29,-203]],'#74dce1',2,.77);
 lines(g,[[-28,-126],[-25,-80]],'#ed8893',2,.42);
 g.restore();
}
function guard(g,x,y,s,p,t){
 g.save();g.translate(x,y);g.scale(s,s);
 circle(g,0,0,62,9,'#07101d',.55);
 let hit=Math.sin(p*Math.PI)*26;
 for(const side of [-1,1]){
  limb(g,[[side*24,-93],[side*24+hit*.3,-49],[side*24+hit*.4,-6]],24,'#3b4357','#1c293e','#090f24');
 }
 polygon(g,[[-45,-164],[40,-164],[57,-93],[31,-70],[-39,-70],[-58,-95]],'#394459','#151d34',3);
 polygon(g,[[-59,-154],[-36,-167],[-16,-135],[-29,-105],[-64,-128]],'#536074','#222941',3);
 polygon(g,[[38,-166],[62,-149],[65,-122],[31,-101],[14,-139]],'#48576e','#18253c',3);
 for(const side of [-1,1]){
  limb(g,[[side*42,-144],[side*58,-111],[side*48-hit*.1,-64]],24,'#45566b','#253043','#141b2e');
 }
 polygon(g,[[-30,-210],[-7,-227],[25,-221],[38,-201],[29,-170],[-25,-171]],'#35435b','#182439',3);
 polygon(g,[[-28,-207],[22,-213],[31,-197],[24,-192],[-25,-194]],'#952e4a','#541d34',1);
 rect(g,-20,-200,42,5,'#fd536f');glow(g,1,-199,75,'#fc536a',.2);
 polygon(g,[[-20,-116],[-2,-126],[22,-113],[16,-103],[-15,-103]],'#9c3948',null,1,.8);
 g.restore();
}
function drone(g,x,y,scale,t,evil=true,damaged=false){
 g.save();g.translate(x,y+Math.sin(t*3)*8);g.scale(scale,scale);
 const outer=evil?'#293348':'#3b6a7b',outline='#122037',light=evil?'#fd547b':'#72f4e0';
 glow(g,0,0,60,light,.23);
 // four articulated wings/rotors
 for(let i=0;i<4;i++){
  const a=i*Math.PI/2+t*.11;
  const px=Math.cos(a)*56,py=Math.sin(a)*26;
  limb(g,[[0,0],[px,py]],9,outer,outline,outline);
  g.save();g.translate(px,py);g.rotate(a);ellipseRotor(g,t);g.restore();
 }
 polygon(g,[[-33,-13],[-19,-31],[24,-25],[41,0],[21,27],[-24,24]],outer,outline,2.8);
 polygon(g,[[-25,-10],[0,-24],[32,-2],[13,8]],evil?'#45536a':'#5b95a3');
 circle(g,10,2,12,12,light,.84);
 circle(g,13,-1,4.5,4.5,'#fff6c6',.86);
 if(damaged){
  lines(g,[[-54,-18],[-92,-43]],'#edbb75',3,.7);
  for(let k=0;k<5;k++)circle(g,-72+Math.sin(t*4+k)*14,-23+k*12,2,2,'#ffc27d',.55);
 }
 g.restore();
}
function ellipseRotor(g,t){
 circle(g,0,0,23+Math.sin(t*24)*3,4,'#8692a4',.36);
 circle(g,0,0,4,5,'#36485b',.9);
}
function bike(g,x,y,s,p,t){
 // stylized rescue rail cart, not motorcycle; grey-blue service trolley.
 g.save();g.translate(x,y);g.scale(s,s);
 rectCel(g,-125,-69,240,77,'#354d65','#13233a',3);
 polygon(g,[[-133,-57],[-88,-92],[56,-105],[113,-58]],'#4b6880','#13223c',3);
 rect(g,-47,-94,46,29,'#75b3b5',.52);
 rect(g,28,-95,59,31,'#75a8bc',.46);
 rect(g,-114,-28,211,13,'#f4868d',.47);
 for(let j of [-84,77]){
  circle(g,j,12,31,31,'#172638');
  circle(g,j,12,19,19,'#6b8194');
  for(let k=0;k<8;k++){let a=k*TAU/8+t*10;lines(g,[[j,12],[j+17*Math.cos(a),12+17*Math.sin(a)]],'#bfced1',2,.44);}
 }
 glow(g,116,-52,70,'#d7f7ef',.26);
 g.restore();
}
function chip(g,x,y,s=1,t=0){
 g.save();g.translate(x,y);g.rotate(Math.sin(t*.8)*.04);g.scale(s,s);
 polygon(g,[[-60,-33],[57,-33],[78,-10],[59,33],[-53,32],[-78,12]],'#283749','#142037',4);
 polygon(g,[[-45,-21],[48,-21],[60,-10],[48,20],[-44,20],[-59,9]],'#6a9ba0','#28485a',1.5);
 for(let k=0;k<8;k++){
  rect(g,-43+k*12,-20,3,39,'#8acac7',.3);
  lines(g,[[-45+k*12,0],[-16+k*12,0]],'#bee6cf',2,.3);
 }
 circle(g,0,0,12,12,'#f3d09c',.94);
 glow(g,0,0,47,'#ffae77',.19);
 g.restore();
}
function floodGate(g,p,t){
 // mechanical petals open as signal travels into the floodgates
 const gap=125*ease(.12,.72,p);
 for(const side of [-1,1]){
  polygon(g,[[640+side*(10+gap),365],[640+side*(220+gap),340],[640+side*(250+gap),BH],[640+side*(10+gap),BH]],'#4a5d69','#1a3043',3);
  for(let k=0;k<9;k++)lines(g,[[640+side*(30+gap),389+k*37],[640+side*(200+gap),371+k*42]],'#87a8ad',3,.24);
 }
 glow(g,650,470,190,'#84e8dd',ease(.3,.85,p)*.15);
}
function bottomCaption(g,shot,local){
 const d=shot.dialogue;
 if(!d)return;
 const from=.6,until=Math.max(from+1.8,shot.duration-.22);
 let k=ease(from,from+.19,local)*(1-ease(until-.18,until,local));
 if(k<=0)return;
 const text=d.text||"", maxWidth=1040;
 g.save();g.globalAlpha=k;g.textAlign='center';g.textBaseline='middle';g.font='bold 33px "DejaVu Sans",sans-serif';
 const arr=[],words=text.split(/\s+/);let row='';
 for(const w of words){
  if(g.measureText(row?row+' '+w:w).width>maxWidth&&row){arr.push(row);row=w}
  else row=row?row+' '+w:w;
 }
 if(row)arr.push(row);
 // reserve lowest 114px; all typography on the CRT layer
 arr.forEach((line,i)=>{
  const yy=588+i*41-(arr.length-1)*19;
  g.lineWidth=8;g.strokeStyle='#10182c';g.strokeText(line,640,yy);
  g.shadowColor='#17283c';g.shadowBlur=8;g.fillStyle=d.speaker==='radio'||d.speaker==='k7'?'#abf4ef':'#ffe7b4';
  g.fillText(line,640,yy);
 });
 g.restore();
}
function titles(g,shot,local){
 const ti=shot.id;
 if(ti===4){
  const op=ease(.5,1.5,local)*(1-ease(shot.duration-.8,shot.duration,local));
  g.save();g.globalAlpha=op;g.textAlign='center';g.font='italic 900 74px "DejaVu Sans",sans-serif';
  g.lineWidth=9;g.strokeStyle='#142943';g.strokeText('LỆNH CUỐI',640,310);
  g.shadowColor='#ef7e9f';g.shadowBlur=31;g.fillStyle='#fff3d6';g.fillText('LỆNH CUỐI',640,310);
  g.font='bold 20px "DejaVu Sans",sans-serif';g.fillStyle='#9eeae6';g.fillText('LAST SIGNAL  /  2091',640,357);g.restore();
 }
 if(ti===47){
  const op=ease(2,4,local)*(1-ease(shot.duration-1,shot.duration,local));
  g.save();g.globalAlpha=op;g.textAlign='center';g.font='italic 900 65px "DejaVu Sans",sans-serif';
  g.strokeStyle='#19293d';g.lineWidth=7;g.strokeText('LỆNH CUỐI',640,268);
  g.fillStyle='#ffe5bc';g.fillText('LỆNH CUỐI',640,268);
  g.font='22px "DejaVu Sans",sans-serif';g.fillStyle='#b6e7dc';g.fillText('KHÔNG AI CỨU THÀNH PHỐ MỘT MÌNH',640,311);g.restore();
 }
}
function sciFiHighlights(g,shot,u,t){
 const ac=shot.action,st=shot.stage;
 if(['chase','run','dodge','escape','slide','train','air'].includes(ac))speedlines(g,t,.3+.4*Math.abs(Math.sin(t*.25)));
 // scanner beams on drones
 if(['drone','chase','dodge','shock','guard','fight'].includes(ac)){
  const x=930+Math.sin(t*1.9)*90;
  polygon(g,[[x,280],[x-35,570],[x+65,570]],'#ff516e',.03+.04*Math.sin(t*2)**2);
  lines(g,[[x,290],[x-25,565]],'#f76585',2,.24);
 }
 if(['kick','fight','impact'].includes(ac)){
  const p=ease(.3,.65,u)*(1-ease(.75,.91,u));
  if(p>0){
   glow(g,690,386,135,'#fbdcb0',p*.26);
   for(let k=0;k<20;k++){
    const a=k*TAU/20+.1,rad=75+u*80;
    lines(g,[[690+Math.cos(a)*22,370+Math.sin(a)*20],[690+Math.cos(a)*rad,370+Math.sin(a)*rad*.8]],'#ffe6b0',3,p*.37);
   }
  }
 }
 if(['fall','leap','air'].includes(ac)){
  for(let j=0;j<30;j++){
   const x=(j*71+t*87)%1400;
   lines(g,[[x,-20],[x-120,730]],'#f0e1d1',2,.035);
  }
 }
 if(['pulse','signal','light','ending','choice'].includes(ac)){
  const v=ease(.2,.8,u);
  for(let k=0;k<14;k++){
   let a=k*TAU/14+t*.03;
   let rr=50+v*510;
   lines(g,[[640+Math.cos(a)*85,380+Math.sin(a)*65],[640+Math.cos(a)*rr,380+Math.sin(a)*rr*.7]],'#85f6e1',2,.12*v);
  }
  glow(g,650,386,220,'#8af1dc',v*.14);
 }
 if(st==='bridge'&&ac==='light')floodGate(g,u,t);
 if(['memory','silence'].includes(ac)){
  rect(g,0,0,W,H,'#061629',ac==='silence'?.18:.1);
  glow(g,600,360,220,'#a9dada',.07);
 }
 if(ac==='rescue'){
  for(let j=0;j<22;j++){let x=470+j*25+Math.sin(j)*15,y=480+(j%5)*11;circle(g,x,y,2.2,2.2,'#a7eae4',.2);}
 }
}
function actionPose(shot,u,t){
 const ac=shot.action,camera=shot.camera;
 let heroX=500,heroY=553,heroScale=1.12;
 if(camera==='wide'||camera==='overhead'||camera==='crane')heroScale=.77;
 if(camera==='close'||camera==='insert')heroScale=1.92;
 if(camera==='medium')heroScale=1.27;
 if(camera==='low')heroScale=1.5;
 if(camera==='rear')heroScale=1.2;
 if(camera==='dutch')heroScale=1.32;
 if(['run','chase','escape','train','climb','ride'].includes(ac))heroX=270+u*600;
 if(ac==='shock')heroX=480;
 if(ac==='slide'||ac==='duck')heroY=600;
 if(ac==='leap'||ac==='air')heroX=250+u*800;
 if(ac==='fall')heroY=320+u*240;
 if(ac==='land')heroY=400+u*160;
 if(ac==='insert'||ac==='choice')heroX=385;
 if(ac==='silence'||ac==='memory')heroX=448;
 if(ac==='guard'||ac==='fight'||ac==='kick'||ac==='impact')heroX=422+u*100;
 if(ac==='rescue'||ac==='recover')heroX=435;
 if(ac==='ending')heroX=468;
 if(ac==='pulse'||ac==='signal'||ac==='light')heroX=330;
 if(ac==='sneak')heroX=260+u*310;
 if(ac==='climb')heroY=650-u*220;
 return {x:heroX,y:heroY,s:heroScale};
}
function shotDraw(g,shot,local,t){
 const u=clamp(local/shot.duration);
 const ac=shot.action, camera=shot.camera;
 // image-plane move continuous even while cels step at 12fps.
 let camX=0,camY=0,z=1;
 if(camera==='track'||camera==='tracking')camX=-32+u*90;
 if(camera==='rear')z=.93+u*.12;
 if(camera==='close')z=1.17+u*.07;
 if(camera==='insert')z=1.24+u*.12;
 if(camera==='crane')z=.81+u*.13,camY=12-u*50;
 if(camera==='wide'||camera==='overhead')z=.83+u*.07;
 if(camera==='low')z=1.08+u*.1;
 if(camera==='dutch')camX=-20+u*50;
 if(['shock','memory','silence','ending'].includes(ac)){z+=.015*Math.sin(t*.45);}
 let shake=0;
 if(['impact','kick','fight'].includes(ac)&&u>.4&&u<.75)shake=3.7*Math.sin(t*93)*Math.sin(Math.PI*(u-.4)/.35);
 g.save();g.translate(W/2+shake,H/2+camY);g.scale(z,z);g.translate(-W/2+camX,-H/2);
 background(g,shot.stage,t,camera==='track'?u:0,shot.id);
 // underplate animation
 if(['train','chase'].includes(ac)&&shot.stage==='tunnel'){
  for(let k=0;k<8;k++){
   const x=((t*270+k*340)%1700)-300;
   rect(g,x,439,230,93,'#46596c',.71);
   for(let j=0;j<5;j++)rect(g,x+j*42+17,455,26,24,'#b6c8c5',.58);
   lines(g,[[x,530],[x+225,530]],'#d7a7a3',3,.52);
  }
 }
 if(shot.act===5&&['light','signal','ending','pulse','rescue'].includes(ac)){
  for(let k=0;k<17;k++){
   let xx=(k*133+67)%W,yy=130+(k*83)%440;
   glow(g,xx,yy,55,k%2?'#fae5a3':'#93e7d8',.09*ease(.07,.62,u));
  }
 }
 if(['insert','choice'].includes(ac)){
  chip(g,770,370,ac==='insert'?2.2:2.7,t);
  for(let j=0;j<12;j++){
   const x=rangeStable(j,630,1040),y=rangeStable(j+11,180,520);
   circle(g,x,y,3,3,'#f9d5a0',.2+Math.sin(t+j)**2*.3);
  }
 }
 if(ac==='shock'){
  for(let j=0;j<4;j++)drone(g,380+j*230,150+Math.sin(j)*25,.65,t,true);
 }
 if(['drone','dodge','fight','impact','guard','kick'].includes(ac)){
  if(['fight','kick','impact','guard'].includes(ac))guard(g,814-u*120,558,camera==='close'?1.42:1.2,u,t);
  else for(let j=0;j<3;j++)drone(g,800+j*115,242+Math.sin(j*2)*37,.75,t+j,true);
 }
 if(['ride','train','chase'].includes(ac)&&shot.stage==='bridge'){
  bike(g,540+u*270,548,1.1,u,t);
 }
 const po=actionPose(shot,u,t);
 // deliberately change character performance per type
 if(!['insert','shock','pulse','signal','light'].includes(ac)||shot.id===0){
   hero(g,po.x,po.y,po.s,ac,u,t,1);
 }
 if(['rescue','recover','memory','silence','land','fall','choice','ending','sneak'].includes(ac)){
   drone(g,po.x+145,po.y-152,.64,t,false,shot.act>=3);
 }
 if(ac==='rescue'){lines(g,[[po.x+70,po.y-120],[po.x+125,po.y-175]],'#6de6dc',3,.55);}
 if(ac==='train'&&shot.stage==='platform'){
  for(let k=0;k<5;k++){let x=(t*280+k*335)%1550-140;rect(g,x,402,250,104,'#425c6c',.66);}
 }
 sciFiHighlights(g,shot,u,t);
 rain(g,shot,t);
 // water ripples + foreground rain
 if(shot.stage==='platform'||shot.stage==='tunnel')for(let j=0;j<25;j++){
   let x=(j*193+t*57)%1320,y=585+(j*29)%99;
   lines(g,[[x,y],[x+40,y]],'#aedcdb',2,.14);
 }
 g.restore();
 // camera flashes, cold open & hard two-frame impact
 if(['kick','fight','impact'].includes(ac)){
  const q=(u-.59);
  if(q>0&&q<.024)rect(g,0,0,W,H,'#f1e8d6',.67);
 }
 if(shot.id===0 && local<.33){
  rect(g,0,0,W,H,'#ff6f85',.45*(1-ease(0,.33,local)));
 }
}
function frameOverlay(g,shot,t,local){
 // correct CRT tape scanlines anchored to output pixels and cool edge darkening
 g.save();g.globalAlpha=.14;g.fillStyle='#080f1e';
 for(let y=1;y<H;y+=3)g.fillRect(0,y,W,1);
 const vg=g.createRadialGradient(W/2,H/2,170,W/2,H/2,740);
 vg.addColorStop(0,'rgba(4,9,22,0)');vg.addColorStop(1,'rgba(2,5,15,.6)');
 g.globalAlpha=1;g.fillStyle=vg;g.fillRect(0,0,W,H);
 g.globalAlpha=.03;g.fillStyle='#91a3b1';
 for(let x=2;x<W;x+=7)g.fillRect(x,0,1,H);
 g.restore();
 // widescreen cinematic letterbox and HUD
 rect(g,0,0,W,47,'#070d1b');
 rect(g,0,H-53,W,53,'#070d1b');
 if(shot.id>0&&shot.id<47){
  g.fillStyle='#b3c6c9';g.font='bold 16px "DejaVu Sans",sans-serif';
  g.fillText('VÂN ĐÔ  ·  2091',49,32);
  g.textAlign='right';g.fillStyle='#9dc4cd';
  g.fillText(String(shot.act+1).padStart(2,'0')+' / 06',W-52,32);g.textAlign='left';
 }
 bottomCaption(g,shot,local);
 titles(g,shot,local);
 // shot cut accent — not blank/black frames
 if(local<.07&&shot.id>0)rect(g,0,0,W,H,'#f3ddcf',.16*(1-local/.07));
}
function render(t){
 if(!READY)return;
 const ww=window.innerWidth||W,hh=window.innerHeight||H;
 if(cv.width!==ww||cv.height!==hh){cv.width=ww;cv.height=hh}
 c.setTransform(ww/W,0,0,hh/H,0,0);
 t=clamp(t,0,story.duration-.00001);
 let s=story.shots[story.shots.length-1];
 for(let i=0;i<story.shots.length;i++)if(t>=story.shots[i].t&&t<story.shots[i].t+story.shots[i].duration){s=story.shots[i];break;}
 const local=t-s.t;
 c.clearRect(0,0,W,H);
 shotDraw(c,s,local,t);
 frameOverlay(c,s,t,local);
}
window.DUR=360;window.READY=false;window.render=render;
window.TEXTS=t=>{
 if(!story)return [];
 let s=story.shots.find(s=>t>=s.t&&t<s.t+s.duration);
 if(!s||!s.dialogue||t<s.t+.6||t>s.t+s.duration-.2)return [];
 return [{id:'line-'+s.id,text:s.dialogue.text,x0:80,x1:1200,y0:552,y1:673}];
};
window.EV=[];
fetch('story.json').then(r=>{if(!r.ok)throw Error('missing story.json');return r.json()}).then(d=>{
 story=d;const scenes=[...new Set(d.shots.map(x=>x.stage))];
 scenes.forEach(paint);
 window.EV=d.shots.map(s=>({t:s.t,type:'cut',id:s.id,action:s.action}));
 READY=true;window.READY=true;render(0);
}).catch(e=>console.error('[film init]',e));
})();
