#!/usr/bin/env python3
"""Produce twelve Vietnamese voiced chapters with exact 30-second alignment.
Primary: Microsoft Neural voice via edge-tts. Offline fallback: espeak-ng Vietnamese.
Narration is written by us, not copied; captions use same 12-scene timetable.
"""
import asyncio,json,subprocess,shutil,wave,math,sys,os,statistics
from pathlib import Path
HERE=Path(__file__).resolve().parent
story=json.loads((HERE/"story.json").read_text(encoding="utf-8"))
work=HERE/"out"
work.mkdir(exist_ok=True)
cache=work/"voice_parts"
cache.mkdir(exist_ok=True)
CH=30
N=len(story["chapters"])
def sh(*args):
    return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
def duration(p):
    return float(sh("ffprobe","-v","error","-show_entries","format=duration","-of","default=nk=1:nw=1",str(p)).stdout.strip())
async def neural():
    import edge_tts
    semaphore=asyncio.Semaphore(2)
    async def one(i,ch):
        target=cache/f"narr_{i:02d}.mp3"
        async with semaphore:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text=ch["voice"],voice=story["voice"],rate="+0%").save(str(target))
                    if target.stat().st_size<1000:raise RuntimeError("empty TTS MP3")
                    return str(target)
                except Exception as e:
                    print(f"Neural TTS chapter {i} attempt {attempt+1}: {e}",flush=True)
                    if target.exists():target.unlink()
                    if attempt<2:await asyncio.sleep(2+attempt*3)
            raise RuntimeError(f"Cannot produce neural narration for chapter {i}")
    return await asyncio.gather(*(one(i,c) for i,c in enumerate(story["chapters"])))
def offline():
    if not shutil.which("espeak-ng"):
        raise RuntimeError("Neural TTS failed, no espeak-ng fallback installed")
    paths=[]
    for i,ch in enumerate(story["chapters"]):
        wav=cache/f"narr_{i:02d}.wav"
        sh("espeak-ng","-v","vi","-s","158","-p","43","-w",str(wav),ch["voice"])
        paths.append(str(wav))
    return paths
def chain(speed):
    # atempo supports 0.5..2.0, factor into a series for any value.
    factors=[]
    while speed>2:factors.append(2.0);speed/=2
    while speed<.5:factors.append(.5);speed/=.5
    factors.append(speed)
    return ",".join(f"atempo={f:.7f}" for f in factors)
def sync_clip(src,i):
    d=duration(src)
    target=27.9
    speed=d/target
    # Negative-space in each chapter gives the visuals room to breathe.
    filt=f"{chain(speed)},aresample=24000,apad=whole_dur=30,atrim=0:30,asetpts=PTS-STARTPTS"
    out=cache/f"sync_{i:02d}.wav"
    sh("ffmpeg","-y","-loglevel","error","-i",str(src),"-af",filt,
       "-ar","24000","-ac","1","-c:a","pcm_s16le",str(out))
    dd=duration(out)
    if abs(dd-CH)>.06:raise RuntimeError(f"Bad chapter WAV duration {i}: {dd}")
    if speed>1.65 or speed<.63:
        print(f"WARNING chapter {i}: audible tempo stretch {speed:.2f}x",flush=True)
    print(f"chapter {i:02d}: TTS {d:.1f}s => {dd:.1f}s, tempo {speed:.2f}x",flush=True)
    return out,dict(index=i,original_seconds=round(d,2),tempo=round(speed,3),final_seconds=round(dd,2))
def combine(paths):
    manifest=cache/"concat.txt"
    manifest.write_text("".join("file '"+str(p.resolve()).replace("'","'\\''")+"'\n" for p in paths),encoding="utf-8")
    dest=work/"narration.wav"
    sh("ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",str(manifest),
       "-ar","24000","-ac","1","-c:a","pcm_s16le",str(dest))
    d=duration(dest)
    if abs(d-360)>.5:raise RuntimeError(f"Narration timeline must be six minutes; got {d:.2f}s")
    return dest
def main():
    provider="edge-tts vi-VN-NamMinhNeural"
    try: paths=asyncio.run(neural())
    except Exception as e:
        print("Neural voice failed; using offline Vietnamese voice:",e,flush=True)
        provider="espeak-ng vi (fallback)"
        paths=offline()
    out=[];stats=[]
    for i,p in enumerate(paths):
        wav,stat=sync_clip(p,i);out.append(wav);stats.append(stat)
    dest=combine(out)
    metadata={"provider":provider,"duration":duration(dest),"chapters":stats}
    (work/"voice-report.json").write_text(json.dumps(metadata,indent=2,ensure_ascii=False),encoding="utf-8")
    print("Voice production complete:",dest,"provider:",provider,flush=True)
if __name__=="__main__":main()
