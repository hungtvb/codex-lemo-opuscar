#!/usr/bin/env python3
"""Original, license-free, procedurally scored ambience for 12 chapters."""
from pathlib import Path
import numpy as np,wave,math,json
HERE=Path(__file__).resolve().parent
OUT=HERE/"out";OUT.mkdir(exist_ok=True)
SR=24000
CH=30
rng=np.random.default_rng(20261022)
# stable 4-chord harmonic motif across a 6-minute essay
chords=[
 (146.83,185.0,220.0),(130.81,164.81,196.0),(146.83,174.61,220.0),
 (164.81,196.0,261.63),(130.81,164.81,196.0),(146.83,185.0,220.0),
 (146.83,196.0,246.94),(123.47,164.81,196.0),(130.81,174.61,220.0),
 (146.83,185.0,220.0),(110,146.83,185),(123.47,164.81,196)]
def note(freq,dur=1.05):
    t=np.arange(int(SR*dur))/SR
    osc=np.sin(2*np.pi*freq*t)+.27*np.sin(2*np.pi*(2.004*freq)*t)
    return osc*np.exp(-3.6*t)*(1-np.exp(-130*t))
def birds(buf,chapter):
    if chapter in (0,1,3,4,5,7):
        for start in [3.2,8.8,14.0,20.6,25.7]:
            tr=np.arange(int(.34*SR))/SR
            fq=1330+220*np.sin(2*np.pi*4*tr)
            call=np.sin(2*np.pi*np.cumsum(fq)/SR)*np.sin(np.pi*np.arange(len(tr))/len(tr))**2
            put(buf,call,start,.010)
def put(buf,x,at,amp):
    idx=int(at*SR)
    nn=min(len(x),len(buf)-idx)
    if nn>0:buf[idx:idx+nn]+=amp*x[:nn]
def chapter_audio(k):
    t=np.arange(CH*SR,dtype=np.float64)/SR
    noise=rng.standard_normal(len(t)).astype(np.float32)
    # O(n) rolling filtered wind, not expensive convolution.
    roll=(np.cumsum(np.r_[0,noise.astype(np.float64)])[900:]-np.cumsum(np.r_[0,noise.astype(np.float64)])[:-900])/900
    wind=np.pad(roll,(899,0))[:len(t)]
    bed=.045*wind*(1+.2*np.sin(2*np.pi*t*.18))
    if k in (2,):bed+=.004*noise
    if k in (9,):bed+=.009*wind*np.sin(t*4)
    if k in (10,):bed+=.011*wind
    chord=chords[k]
    for j,f in enumerate(chord):
        ss=(np.sin(2*np.pi*f*t)+.13*np.sin(2*np.pi*f*2*t)+.07*np.sin(2*np.pi*f*3*t))
        fade=np.minimum(1,t/3)*np.minimum(1,(CH-t)/3)
        bed+=.012*ss*fade*(1+.18*np.sin(t*.24+j))
    motif=[0,2,1,2,0,1,2,1]
    for j,start in enumerate(np.arange(1,28,.82)):
        f=chord[motif[j%8]]*(2 if j%3==0 else 1)
        put(bed,note(f,.83),start,.014 if k not in (2,10,11) else .010)
    birds(bed,k)
    for st in ([5,18,25] if k in (2,3,4,6,8,11) else [6,21]):
        put(bed,note(chord[2]*3,1.9),st,.019)
    bed*=np.minimum(1,t/.7)*np.minimum(1,(CH-t)/.7)
    return (np.clip(bed,-.8,.8)*32767).astype('<i2')
p=OUT/"music.wav"
with wave.open(str(p),"wb") as f:
    f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR)
    for k in range(12):
        f.writeframes(chapter_audio(k).tobytes())
print("Music ready",p,"12 × 30 seconds")
