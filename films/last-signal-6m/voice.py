#!/usr/bin/env python3
"""Original Vietnamese dialogue tracks, aligned with actual story shot times.
Neural Edge voices when available; offline Vietnamese espeak-ng only as fallback.
Exports voice.wav + dialogue.srt + voice-report.json.
"""
import asyncio, json, subprocess, sys, wave, re
from pathlib import Path
import numpy as np
HERE=Path(__file__).resolve().parent
OUT=HERE/"out";OUT.mkdir(exist_ok=True)
PARTS=OUT/"voice-parts";PARTS.mkdir(exist_ok=True)
STORY=json.loads((HERE/"story.json").read_text(encoding="utf-8"))
SR=24000;DUR=int(STORY["duration"]);SPEAKERS={"linh":"vi-VN-HoaiMyNeural","k7":"vi-VN-NamMinhNeural","radio":"vi-VN-NamMinhNeural","guard":"vi-VN-NamMinhNeural","citizen":"vi-VN-HoaiMyNeural"}
LINES=[dict(id=s["id"],speaker=s["dialogue"]["speaker"],text=s["dialogue"]["text"],start=s["dialogue"]["start"],shot_end=s["t"]+s["duration"]) for s in STORY["shots"] if s.get("dialogue")]
def run(*args):
 return subprocess.run(list(map(str,args)),check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
def stamp(t):
 h=int(t//3600);m=int((t%3600)//60);s=int(t%60);ms=int((t-int(t))*1000)
 return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
async def synth_neural():
 import edge_tts
 sem=asyncio.Semaphore(3)
 async def make(l):
  path=PARTS/f"narr-{l['id']:02d}.mp3"
  async with sem:
   for k in range(3):
    try:
     await edge_tts.Communicate(text=l["text"],voice=SPEAKERS[l["speaker"]],rate="+0%").save(str(path))
     if path.stat().st_size<650:raise ValueError("TTS clip unexpectedly small")
     return path
    except Exception as exc:
     print("Neural TTS retry",l['id'],k+1,str(exc)[:90],flush=True)
     if path.exists():path.unlink()
     if k<2:await asyncio.sleep(2+k)
   raise RuntimeError(f"No voice file for dialogue {l['id']}")
 return await asyncio.gather(*(make(l) for l in LINES))
def synth_offline():
 print("Using offline Vietnamese espeak-ng voice fallback")
 result=[]
 for l in LINES:
  path=PARTS/f"narr-{l['id']:02d}.wav"
  v="vi" if l["speaker"] in ("linh","citizen") else "vi+f3"
  run("espeak-ng","-v",v,"-s","154","-p","43","-w",path,l["text"])
  result.append(path)
 return result
def probe(p):return float(run("ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",p).stdout.strip())
def atempo(f):
 z=[]
 while f>2:z.append(2);f/=2
 while f<.5:z.append(.5);f/=.5
 z.append(f)
 return ",".join(f"atempo={i:.6f}" for i in z)
def main():
 provider="Microsoft Edge neural (vi-VN-HoaiMyNeural, vi-VN-NamMinhNeural)"
 try:files=asyncio.run(synth_neural())
 except Exception as e:
  print("TTS neural failure:",e,flush=True)
  provider="espeak-ng Vietnamese offline fallback"
  files=synth_offline()
 audio=np.zeros(SR*DUR,dtype=np.float64)
 rows=[];report=[]
 for l,p in zip(LINES,files):
  orig=probe(p)
  allowed=max(1.9,l["shot_end"]-l["start"]-.36)
  factor=max(1,orig/allowed)
  wav=PARTS/f"aligned-{l['id']:02d}.wav"
  filt=(atempo(factor)+",") if factor>1.005 else ""
  run("ffmpeg","-y","-loglevel","error","-i",p,"-af",filt+"aresample=24000",
      "-ac","1","-ar",str(SR),"-c:a","pcm_s16le",wav)
  with wave.open(str(wav)) as f:
   values=np.frombuffer(f.readframes(f.getnframes()),dtype="<i2").astype(np.float64)/32768
  if len(values)>allowed*SR:values=values[:int(allowed*SR)]
  # gentle fade and normalise clipped peak
  if len(values)>0:
   peak=np.max(np.abs(values));values=values*min(1.4,.85/max(peak,.03))
   fade=min(1200,len(values)//8)
   if fade>0:values[:fade]*=np.linspace(0,1,fade);values[-fade:]*=np.linspace(1,0,fade)
  start=int(l["start"]*SR);end=min(len(audio),start+len(values))
  audio[start:end]+=values[:end-start]*.8
  endTime=start/SR+(end-start)/SR
  rows.append((l["start"],min(endTime+.35,l["shot_end"]-.06),l["text"],l["speaker"]))
  report.append({"shot_id":l["id"],"speaker":l["speaker"],"start":l["start"],"end":round(endTime,2),"src_duration":round(orig,2),"tempo":round(factor,2)})
  print("Voice",l["id"],l["speaker"],round(orig,1),"->",round(len(values)/SR,1),"secs",flush=True)
 assert len(rows)==23,len(rows)
 # dialogue timeline full six minutes (including intentional dialogue-free action)
 def write_pcm(path,buf):
  with wave.open(str(path),"wb") as f:
   f.setnchannels(1);f.setframerate(SR);f.setsampwidth(2)
   f.writeframes((np.clip(buf,-1,1)*32767).astype("<i2").tobytes())
 write_pcm(OUT/"voice.wav",audio)
 srt="\n\n".join(str(i+1)+"\n"+stamp(s)+" --> "+stamp(e)+"\n"+v for i,(s,e,v,sp) in enumerate(rows))+"\n"
 (OUT/"last-signal.srt").write_text(srt,encoding="utf-8")
 (OUT/"voice-report.json").write_text(json.dumps({"provider":provider,"duration":DUR,"total_lines":len(rows),"clips":report},ensure_ascii=False,indent=2),encoding="utf-8")
 print("Voice production finished:",provider, len(rows),"clips",flush=True)
if __name__=="__main__":main()
