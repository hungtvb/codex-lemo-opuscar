#!/usr/bin/env python3
"""Original six-minute retro-sci-fi cinematic synth score + foley, generated without stock music.
Hybrid 80s cel-anime instrumentation: minor7 chords, analog bass, FM bell, synth-brass stabs,
gated-reverb snare, tremolo pads, arpeggio, rain, rotor, rail & metal impacts.
"""
from pathlib import Path
import json,wave,math
import numpy as np
HERE=Path(__file__).resolve().parent;OUT=HERE/"out";OUT.mkdir(exist_ok=True)
STORY=json.loads((HERE/"story.json").read_text(encoding="utf-8"))
SR=24000;CH=60;TOTAL=360
rng=np.random.default_rng(410078)
TEMPO=[96,136,152,82,148,108]
# Harmonic roots F# minor, Dmaj7, Bminor, C#minor to F# minor. Each act own voicing.
CHORDS=[
 [185.0,220,277.18,329.63],
 [146.83,185.0,220,277.18],
 [164.81,196,246.94,293.66],
 [138.59,164.81,207.65,246.94],
 [185.0,220,277.18,329.63],
 [146.83,185.0,220,277.18]
]
def add(dst,sound,start,vol=1):
 idx=int(start*SR)
 if idx<0: sound=sound[-idx:];idx=0
 if idx>=len(dst) or len(sound)==0:return
 n=min(len(sound),len(dst)-idx)
 dst[idx:idx+n]+=vol*sound[:n]
def expclip(t,a,b):return np.exp(-a*t)*(1-np.exp(-b*t))
def synth(freq,dur=1.3,instrument="bell"):
 t=np.arange(int(dur*SR))/SR
 if instrument=="bell":
  x=np.sin(2*np.pi*freq*t+.5*np.sin(2*np.pi*freq*8*t)*np.exp(-14*t))
  x+=.15*np.sin(2*np.pi*freq*2.03*t)
  return x*expclip(t,4.8,110)
 if instrument=="brass":
  x=np.sin(2*np.pi*freq*t)+.4*np.sin(2*np.pi*2*freq*t)+.18*np.sin(2*np.pi*3*freq*t)
  return x*np.minimum(1,t*16)*np.minimum(1,(dur-t)*3.5)
 if instrument=="bass":
  x=np.sin(2*np.pi*freq*t)+.32*np.sin(2*np.pi*2*freq*t)
  return x*np.exp(-5*t)*(1-np.exp(-150*t))
 return np.sin(2*np.pi*freq*t)
def drum(kind):
 dur=.3 if kind in ("kick","hat") else .5
 t=np.arange(int(dur*SR))/SR
 if kind=="kick":
  ph=2*np.pi*(68*t+52*(1-np.exp(-33*t))/33)
  return np.sin(ph)*np.exp(-18*t)
 if kind=="snare":
  x=rng.standard_normal(len(t))
  tail=np.zeros(len(t))
  sm=.65*x+.35*np.roll(x,9)
  return sm*np.exp(-23*t)+.35*np.sin(2*np.pi*178*t)*np.exp(-25*t)
 if kind=="hat":
  x=rng.standard_normal(len(t))
  return (x-np.roll(x,3))*.4*np.exp(-85*t)
def ambience(buf,act):
 t=np.arange(SR*CH,dtype=np.float64)/SR
 # city rain/wind hiss, fluctuating filtering
 noise=rng.standard_normal(len(t))
 filtered=np.cumsum(np.r_[0,noise])
 wind=(filtered[101:]-filtered[:-101])/101
 wind=np.pad(wind,(100,0))
 buf+=wind*.055*(1+.35*np.sin(2*np.pi*.12*t))
 buf+=(noise-np.roll(noise,1))*.002 if act in (0,1,2,3) else noise*.0013
 if act in (3,):buf+=.018*np.sin(2*np.pi*42*t+1.1*np.sin(2*np.pi*.08*t))
 if act in (4,):buf+=.010*np.sin(2*np.pi*67*t)
def addShotFx(dst,shot,base):
 action=shot["action"];st=shot["stage"];duration=shot["duration"]
 ev=shot["t"]-base
 if ev>=len(dst)/SR:return
 def whoosh(at=1,vol=.026):
  tt=np.arange(int(.66*SR))/SR
  z=rng.standard_normal(len(tt))
  z=np.cumsum(z*.02)
  z*=np.sin(np.pi*np.arange(len(tt))/len(tt))**2
  add(dst,z,ev+at,vol)
 def strike(at=2):
  tt=np.arange(int(.4*SR))/SR
  z=np.sin(2*np.pi*(94*tt+33*(1-np.exp(-20*tt))))*np.exp(-13*tt)
  z+=rng.standard_normal(len(tt))*.22*np.exp(-28*tt)
  add(dst,z,ev+at,.11)
 if action in ("run","escape","chase","climb"):
  for tm in np.arange(.65,duration-.3,.34):
   tt=np.arange(int(.12*SR))/SR
   z=rng.standard_normal(len(tt))*np.exp(-32*tt)
   add(dst,z,ev+tm,.012)
 if action in ("drone","dodge","shock","guard"):
  tt=np.arange(int(min(duration,4)*SR))/SR
  z=np.sin(2*np.pi*(85*tt+3*np.sin(tt*8)))*(.3+.1*np.sin(tt*17))
  add(dst,z,ev+.3,.017)
 if action in ("kick","impact","fight"):
  whoosh(duration*.37,.04);strike(duration*.59)
 if action in ("leap","fall","air","land","slide","duck"):
  whoosh(duration*.48,.045)
  if action=="land":strike(duration*.77)
 if action in ("insert","choice","recover"):
  for j in range(3):
   add(dst,synth(620+j*178,.8,"bell"),ev+duration*(.32+j*.13),.032)
 if action in ("pulse","signal","light","ending"):
  for j in range(6):
   add(dst,synth(310+j*75,2.0,"bell"),ev+duration*j/8,.016)
 if action in ("train",):
  tt=np.arange(int(min(duration,8)*SR))/SR
  z=np.sin(2*np.pi*(55+3*np.sin(tt*2))*tt)*(.5+.5*np.sin(tt*17)**2)
  add(dst,z,ev+.3,.03)
def actScore(act):
 dur=60; t=np.arange(dur*SR,dtype=np.float64)/SR
 out=np.zeros(len(t),dtype=np.float64)
 bp=TEMPO[act];beat=60/bp;chord=CHORDS[act]
 ambience(out,act)
 # analog strings pad and chord movement
 ramp=np.minimum(1,t/4)*np.minimum(1,(dur-t)/4)
 for j,f in enumerate(chord):
  x=np.sin(2*np.pi*f*t)+.19*np.sin(2*np.pi*f*2.001*t)+.11*np.sin(2*np.pi*f*3.01*t)
  out+=x*.012*ramp*(1+.25*np.sin(2*np.pi*.12*t+j))
 # minor-key ostinato and rhythmic arpeggio
 for j,start in enumerate(np.arange(.8,58,beat*.5)):
  f=chord[[0,2,3,1,2,0,3,2][j%8]]*(2 if j%4==0 else 1)
  add(out,synth(f,.8,"bell"),start,.021 if act!=3 else .010)
 # gated snare and punchy kick, dramatic dropped beats in act 3 silence
 for j,start in enumerate(np.arange(0,dur,beat)):
  if act==3 and 26<start<38:continue
  if j%4 in (0,2):add(out,drum("kick"),start,.06 if act<3 else .052)
  if j%4 in (1,3):add(out,drum("snare"),start,.048 if act!=3 else .014)
  if act in (1,2,4):
   add(out,drum("hat"),start+.5*beat,.024)
  elif act!=3 and j%2==0:add(out,drum("hat"),start+.5*beat,.012)
  if j%8==0 and act!=3:
   add(out,synth(chord[2]*2,.42,"brass"),start,.035)
 for j,start in enumerate(np.arange(0,60,beat)):
  add(out,synth(chord[j%4]/2,.41,"bass"),start+.08,.045 if act!=3 else .023)
 # one quiet beat before peak each act
 if act in (2,4):
  sel=(t>=51)&(t<51.7);out[sel]*=.06
 if act==3:
  sel=(t>=25)&(t<32);out[sel]*=.10
 for shot in STORY["shots"]:
  if shot["act"]==act:addShotFx(out,shot,act*60)
 out*=np.minimum(1,t/.6)*np.minimum(1,(60-t)/.8)
 peak=np.max(np.abs(out))
 if peak>.93:out*=.93/peak
 return np.clip(out,-1,1).astype(np.float32)
def main():
 p=OUT/"score.wav"
 with wave.open(str(p),"wb") as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR)
  for k in range(6):
   chunk=actScore(k)
   f.writeframes((chunk*32767).astype("<i2").tobytes())
   print("Scored act",k+1,"duration",60,"s",flush=True)
 print("Score complete",p,flush=True)
if __name__=="__main__":main()
