/* Codex and the Green Forest — original film written for Lemo-Opuscar.
   Rendered through upstream core/render/video.mjs + Playwright; pure frame function.
   Painterly watercolor: layered translucent washes, seeded bristle strokes,
   soft cotton paper, handwritten serif captions, camera dolly & mist wipes. */
(() => {
"use strict";
const cv=document.querySelector("#film"), c=cv.getContext("2d",{alpha:false});
const W=960,H=540, WORLD=3250, DURATION=30;
const TAU=Math.PI*2;
let seed=68430;
const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;
const rand=(a,b)=>a+(b-a)*rnd();
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const lerp=(a,b,t)=>a+(b-a)*t;
const mix=(t,a,b)=>smooth((t-a)/(b-a));
const E=(g,x,y,rx,ry,col,alpha=1)=>{
  g.globalAlpha=alpha;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fillStyle=col;g.fill();g.globalAlpha=1;
};
function make(w,h){const a=document.createElement("canvas");a.width=w;a.height=h;return [a,a.getContext("2d")]}
function poly(g,p,color,alpha=1){
 g.globalAlpha=alpha;g.beginPath();g.moveTo(...p[0]);for(let i=1;i<p.length;i++)g.lineTo(...p[i]);g.closePath();g.fillStyle=color;g.fill();g.globalAlpha=1;
}
function stroke(g,p,width,color,alpha=1){
 g.globalAlpha=alpha;g.strokeStyle=color;g.lineWidth=width;g.lineCap="round";g.lineJoin="round";
 g.beginPath();g.moveTo(...p[0]);for(let i=1;i<p.length;i++)g.lineTo(...p[i]);g.stroke();g.globalAlpha=1;
}
function ribbon(g, x0,y0,x1,y1,width,color,opacity=0.3){
 const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 const p=[];
 const N=12;
 for(let i=0;i<=N;i++){const u=i/N,w=width*(0.35+0.65*Math.sin(Math.PI*u))*(.87+.25*rnd());p.push([lerp(x0,x1,u)+nx*w/2,lerp(y0,y1,u)+ny*w/2]);}
 for(let i=N;i>=0;i--){const u=i/N,w=width*(0.35+0.65*Math.sin(Math.PI*u))*(.87+.25*rnd());p.push([lerp(x0,x1,u)-nx*w/2,lerp(y0,y1,u)-ny*w/2]);}
 poly(g,p,color,opacity);
 for(let j=0;j<3;j++){
  const side=(j-1)*width*.2,from=rand(.0,.16),to=rand(.65,.98),dash=[rand(3,12),rand(3,10)];
  g.setLineDash(dash);
  stroke(g,[[lerp(x0,x1,from)+nx*side,lerp(y0,y1,from)+ny*side],[lerp(x0,x1,to)+nx*side,lerp(y0,y1,to)+ny*side]],rand(.4,1.3),color,opacity*.7);
  g.setLineDash([]);
 }
}
const [paper,pg]=make(W,H);
pg.fillStyle="#eadfbe";pg.fillRect(0,0,W,H);
for(let i=0;i<12000;i++){
 const x=rand(0,W),y=rand(0,H),s=rand(.15,1.3);
 E(pg,x,y,s,s*.35,rnd()>.5?"#76583f":"#ffffff",rand(.012,.07));
}
for(let i=0;i<1300;i++)ribbon(pg,rand(0,W),rand(0,H),rand(0,W),rand(0,H),rand(.2,.65),"#fffaf0",.017);

const [back,bg]=make(WORLD,H),[middle,mg]=make(WORLD,H),[front,fg]=make(WORLD,H);
function hill(g,y,color,step,seedOffset){
 const arr=[[0,H],[0,y]];
 for(let x=0;x<=WORLD+step;x+=step)arr.push([x,y+27*Math.sin(x*.004+seedOffset)+19*Math.sin(x*.01+seedOffset)]);
 arr.push([WORLD,H]);poly(g,arr,color,.67);
}
// Trees painted with accumulated translucent leaf strokes.
function tree(g,x,base,ht,layer) {
 const trunk=["#6b7a65","#4c6655","#4b5942"][layer],leaf=["#698c80","#447968","#2b5c4b"][layer];
 const trunkTop=base-ht,thick=ht*.072;
 ribbon(g,x,base,x+rand(-22,22),trunkTop,thick,trunk,.78);
 ribbon(g,x-thick*.3,base,x+rand(-22,22),trunkTop,thick*.4,"#bcaa81",.14);
 for(let i=0;i<8;i++){
  const sy=base-ht*rand(.37,.86),dx=rand(-ht*.42,ht*.42),ey=sy-rand(10,ht*.25);
  ribbon(g,x,sy,x+dx,ey,rand(2,thick*.46),trunk,.51);
 }
 for(let cl=0;cl<4;cl++){
  const cx=x+rand(-ht*.22,ht*.22),cy=trunkTop+ht*.18+rand(-25,38);
  const rx=ht*rand(.18,.34),ry=ht*rand(.14,.27);
  for(let n=0;n<(layer===2?145:90);n++){
   const xx=cx+rand(-1,1)*rx,yy=cy+rand(-1,1)*ry;
   if(((xx-cx)/rx)**2+((yy-cy)/ry)**2>1.25)continue;
   const colors=[leaf,layer===2?"#568a5b":"#80a98a",layer===2?"#769656":"#a0b499","#bad09a"];
   ribbon(g,xx,yy,xx+rand(-10,10),yy+rand(-6,10),rand(4,16),colors[n%colors.length],rand(.06,.23));
  }
 }
}
hill(bg,326,"#88a398",85,1);
for(let i=0;i<65;i++){const x=rand(0,WORLD),h=rand(155,290);tree(bg,x,rand(390,428),h,0);}
hill(mg,378,"#738c78",90,2);
for(let i=0;i<47;i++){const x=rand(0,WORLD),h=rand(185,340);tree(mg,x,rand(445,468),h,1);}
hill(fg,451,"#587a62",70,3);
for(let i=0;i<39;i++){const x=rand(0,WORLD),h=rand(190,385);if(x>1810&&x<2270)continue;tree(fg,x,rand(475,512),h,2);}
// painted forest path: color built from layered washes
poly(fg,[[0,536],[0,501],[400,481],[830,482],[1320,468],[1780,481],[2250,474],[2600,497],[WORLD,506],[WORLD,H]],"#aa9973",.68);
for(let i=0;i<3000;i++){
 const x=rand(0,WORLD),y=rand(470,H);
 ribbon(fg,x,y,x+rand(-11,11),y+rand(-4,5),rand(1,6),["#bcb080","#786d54","#adbb83"][i%3],rand(.04,.18));
}
// Painted moss, ferns and flowers
for(let i=0;i<230;i++){
 const x=rand(0,WORLD),y=rand(456,532),h=rand(8,23),color=i%3===0?"#537e59":"#62835f";
 ribbon(fg,x,y,x+rand(-4,4),y-h,rand(2,5),color,.62);
 for(let j=1;j<=4;j++){
  const yy=y-h*j/5,sz=rand(4,11);
  ribbon(fg,x,yy,x-sz,yy-sz*.35,rand(1.5,3.2),color,.5);
  ribbon(fg,x,yy,x+sz,yy-sz*.38,rand(1.5,3.2),color,.5);
 }
 if(i%13===0)E(fg,x+rand(-5,5),y-h-rand(2,7),rand(2,4),rand(2,4),"#e9ba82",.75);
}
// Ancient mother tree: enormous feature at the end of the path
function elder(g,x){
 ribbon(g,x,499,x+15,155,76,"#786b4d",.69);
 ribbon(g,x+21,500,x+33,170,35,"#62573e",.38);
 for(const [dx,dy] of [[-220,65],[-152,10],[-85,-80],[80,-90],[160,25],[245,75]]){
  ribbon(g,x+13,259,x+dx,dy,rand(14,28),"#72694e",.64);
  for(let i=0;i<120;i++){
   const xx=x+dx+rand(-82,82), yy=dy+rand(-60,65);
   ribbon(g,xx,yy,xx+rand(-12,12),yy+rand(-8,9),rand(5,23),["#4d806a","#5f9577","#9fbc8c","#b6c48e"][i%4],.13);
  }
 }
 for(let i=0;i<7;i++)ribbon(g,x+rand(-22,22),445,x+rand(-110,110),510,rand(10,20),"#695c47",.53);
 // glowing hollow softly layered
 for(let i=11;i>=1;i--)E(g,x+21,378,14+i*2,29+i*2,"#eebf6c",.013);
 E(g,x+21,379,21,33,"#6d553d",.82);
 E(g,x+21,378,9,19,"#f5d98b",.35);
}
elder(fg,2120);
// fixed animation particles
const dust=Array.from({length:135},()=>({x:rand(0,WORLD),y:rand(110,475),phase:rand(0,TAU),s:rand(.9,3.5)}));
const bloom=Array.from({length:190},(_,i)=>({x:2070+rand(-360,450),y:rand(65,465),p:rand(0,TAU),s:rand(1,4),born:i/190}));
function curve(g,points,color,w,alpha=1){
 g.globalAlpha=alpha;g.lineWidth=w;g.lineJoin="round";g.lineCap="round";g.strokeStyle=color;
 g.beginPath();g.moveTo(...points[0]);for(let i=1;i<points.length;i++)g.lineTo(...points[i]);g.stroke();g.globalAlpha=1;
}
function boy(g,x,y,t,stopped=false,kneel=0){
 g.save();g.translate(x,y);
 const walk=stopped?0:Math.sin(t*9);
 const bob=stopped?0:Math.abs(Math.sin(t*9))*.95;
 g.translate(0,-bob-18*kneel);
 g.scale(1,1-.18*kneel);
 E(g,0,2,31,5,"#514937",.19);
 // soft painted legs, shoes with planted-stance angles
 for(const side of [-1,1]){
  const foot=walk*18*side*(1-kneel);
  ribbon(g,side*10,-50,side*12+foot,-7,13,"#344760",.9);
  E(g,side*12+foot+4,-4,15,5,"#383e47",.8);
 }
 // round backpack, leather accents
 E(g,-21,-89,22,33,"#314d60",.76);
 E(g,-26,-95,13,21,"#5a7290",.52);
 stroke(g,[[-32,-81],[-25,-78]],3,"#d8b87d",.63);
 // jacket torso — translucent wash layers
 E(g,0,-86,28,35,"#d37e49",.9);
 E(g,-4,-90,21,30,"#eb9956",.52);
 ribbon(g,10,-110,10,-57,4,"#714d39",.68);
 E(g,12,-88,3,3,"#eee0af",.83);
 // arms with slight animated swing
 for(let s of [-1,1]){
  let z=walk*8*s*(1-kneel);
  curve(g,[[s*23,-106],[s*27+z,-91],[s*25-z,-63]],"#c77b52",13,.88);
  E(g,s*25-z,-62,6,7,"#dbad89",.88);
 }
 // neck and face
 E(g,5,-127,9,13,"#ddae88",.85);
 E(g,2,-156,32,34,"#e5ba91",.92);
 E(g,13,-153,14,24,"#efcda5",.42);
 E(g,-29,-150,7,10,"#dfb087",.8);
 // feathered dark hair (no hard vector outline)
 for(let j=0;j<12;j++){
  const ang=Math.PI*1.13+j*.145;
  const cx=3+Math.cos(ang)*27,cy=-170+Math.sin(ang)*22;
  ribbon(g,cx-11,cy-3,cx+8,cy+rand(-5,6),rand(7,14),"#4a403c",.68);
 }
 ribbon(g,-19,-178,16,-185,24,"#544339",.83);
 // eye, brows, smile on profile looking right
 E(g,20,-151,2.6,3.2,"#3c4841",.95);
 ribbon(g,16,-159,24,-160,1.6,"#5d4a3b",.74);
 g.globalAlpha=.7;g.beginPath();g.strokeStyle="#965b4d";g.lineWidth=1.7;
 g.arc(20,-139,7,.1,1.45);g.stroke();g.globalAlpha=1;
 E(g,25,-144,4,2.3,"#d9937e",.3);
 // satchel clasp, tiny scarf (character identifier)
 ribbon(g,7,-115,22,-112,6,"#eac281",.81);
 g.restore();
}
function butterfly(g,x,y,t){
 g.save();g.translate(x,y);
 const flap=.47+.53*Math.abs(Math.sin(t*16));
 g.shadowColor="#ffd681";g.shadowBlur=17;
 E(g,0,0,24,22,"#f9df98",.12);
 g.shadowBlur=0;
 for(const s of [-1,1]){
  g.save();g.scale(s,1);
  E(g,11*flap,-5,14*flap,11,"#eab25d",.71);
  E(g,11*flap,9,10*flap,8,"#f9d790",.71);
  E(g,10*flap,-8,6*flap,5,"#fff1ba",.51);
  g.restore();
 }
 E(g,0,1,2.4,14,"#6e6256",.8);
 stroke(g,[[0,-9],[-5,-20]],.7,"#6e6256",.8);
 stroke(g,[[1,-9],[6,-21]],.7,"#6e6256",.8);
 g.restore();
}
function title(g,t){
 // Captions on the paper itself — watercolor journal grammar
 let str="",small="",a=0,yy=0;
 if(t<4.5){str="CHÚ BÉ CODEX";small="BÍ MẬT KHU RỪNG XANH";a=mix(t,0,.8)*(1-mix(t,3.7,4.5));yy=65;}
 if(t>25.5){str="HÀNH TRÌNH CHỈ MỚI BẮT ĐẦU";small="Một bí mật đang chờ phía trước...";a=mix(t,25.5,26.4)*(1-mix(t,29.6,30));yy=64;}
 if(a<=0)return;
 g.save();g.globalAlpha=a;
 g.textAlign="center";g.textBaseline="middle";
 g.font="bold 31px Georgia, 'DejaVu Serif', serif";
 g.shadowColor="#e9e0c4";g.shadowBlur=12;g.shadowOffsetY=2;
 g.fillStyle="#364e45";g.fillText(str,480,yy);
 g.font="italic 18px Georgia, 'DejaVu Serif', serif";
 g.fillStyle="#596e5a";g.fillText(small,480,yy+35);
 g.restore();
}
function camera(t,bx){
 let z=1;
 if(t>18&&t<24)z=1+.13*Math.sin(Math.PI*mix(t,18,24));
 if(t>=24)z=1-.12*mix(t,24,29);
 return {x:Math.max(0,bx-305),z};
}
function background(g,t){
 const sky=g.createLinearGradient(0,0,0,510);
 sky.addColorStop(0,"#e9e7c9");sky.addColorStop(.4,"#d4e0c2");sky.addColorStop(1,"#91baa3");
 g.fillStyle=sky;g.fillRect(0,0,W,H);
 const hx=690-20*t/30;
 for(let i=0;i<8;i++){
  const x=hx+i*36;
  poly(g,[[x-20,35],[x+35,0],[x+210,530],[x+80,530]],"#f7e8ad",.022);
 }
 E(g,hx,105,95,90,"#fbefb8",.19);
 E(g,hx,105,33,32,"#faefc5",.45);
}
function fog(g,t){
 const x=t*7;
 for(let i=0;i<5;i++){
  g.save();g.globalAlpha=.045;
  E(g,(i*290+x)%1400-150,340+i*24,170,24,"#f6f0dd",1);
  g.restore();
 }
}
window.DUR=DURATION;
window.EV=[{t:5,type:"chime"},{t:20.5,type:"chime"},{t:25,type:"reveal"}];
window.TEXTS=t=>{
 if(t>.8&&t<3.7)return[{id:"opening",text:"CHÚ BÉ CODEX BÍ MẬT KHU RỪNG XANH",x0:90,y0:42,x1:875,y1:120}];
 if(t>26.4&&t<29.6)return[{id:"ending",text:"HÀNH TRÌNH CHỈ MỚI BẮT ĐẦU Một bí mật đang chờ phía trước...",x0:68,y0:42,x1:895,y1:120}];
 return [];
};
window.render=t=>{
 // exact deterministic stateless render at any requested time
 const w=innerWidth,h=innerHeight;
 if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
 c.setTransform(w/W,0,0,h/H,0,0);c.globalAlpha=1;c.clearRect(0,0,W,H);
 background(c,t);
 let bx=300;
 if(t>4.3)bx+=160*mix(t,4.3,11);
 if(t>11)bx+=790*mix(t,11,18);
 if(t>18)bx+=420*mix(t,18,23.5);
 const kneel=mix(t,19.5,21)*(1-mix(t,23.3,24.5));
 const stop=t<4.4||t>19.5;
 const cam=camera(t,bx);
 c.save();c.translate(W/2,H/2);c.scale(cam.z,cam.z);c.translate(-W/2,-H/2);
 c.drawImage(back,-cam.x*.22,0);
 fog(c,t);
 c.drawImage(middle,-cam.x*.52,0);
 c.drawImage(front,-cam.x,0);
 // golden roots react when Codex approaches
 const magic=mix(t,20.5,23.5);
 for(let i=0;i<9;i++){
  const x=2112+Math.sin(i*1.6)*130,y=461+Math.cos(i*2.2)*24;
  E(c,x-cam.x,y,randFallback(i)*10+5,1.7,"#fff3b1",.08*magic);
 }
 // boy, always behind foreground fireflies
 boy(c,bx-cam.x,481,t,stop,kneel);
 const targetX=lerp(bx+125,2120,mix(t,18,23));
 const bfX=targetX-cam.x+Math.sin(t*1.4)*17;
 const bfY=314+21*Math.sin(t*2.7)-48*mix(t,24,29);
 butterfly(c,bfX,bfY,t);
 for(const q of dust){
  const x=q.x-cam.x*.76,y=q.y+Math.sin(t*1.2+q.phase)*7;
  if(x<-10||x>W+10)continue;
  const a=(.09+.17*(.5+.5*Math.sin(q.phase+t*1.7)))*mix(t,5,10);
  E(c,x,y,q.s,q.s*.67,"#efe6b0",a);
 }
 const reveal=mix(t,24.5,28.6);
 for(const q of bloom){
  const u=clamp((reveal-q.born*.65)/.35);
  if(!u)continue;
  const x=q.x-cam.x+Math.sin(t*.9+q.p)*11;
  const y=q.y+Math.cos(t*1.4+q.p)*9;
  if(x<-12||x>W+12)continue;
  E(c,x,y,q.s*3,q.s*3,"#ebcb73",u*.035);
  E(c,x,y,q.s,q.s,"#f8e6a1",u*(.45+.4*Math.sin(t*2+q.p)**2));
 }
 c.restore();
 c.globalAlpha=.095;c.drawImage(paper,0,0);
 // edge wash, fade in & out from warm paper
 const vign=c.createRadialGradient(W*.53,H*.47,140,W*.53,H*.47,600);
 vign.addColorStop(0,"rgba(251,247,220,0)");vign.addColorStop(1,"rgba(60,70,44,.19)");
 c.fillStyle=vign;c.fillRect(0,0,W,H);
 title(c,t);
 const pale=Math.max(1-mix(t,0,1),mix(t,29.5,30));
 if(pale>0){c.fillStyle="rgba(232,222,190,"+pale+")";c.fillRect(0,0,W,H);}
};
function randFallback(i){return .6+.4*Math.sin(i*6.42)**2;}
window.READY=true;
window.render(0);
})();
