#!/usr/bin/env python3
"""Original procedural forest ambience + acoustic score. Deterministic, no paid assets."""
import numpy as np
import wave
from pathlib import Path
SR=24000
DUR=30
N=SR*DUR
t=np.arange(N,dtype=np.float64)/SR
r=np.random.default_rng(58417)
buf=np.zeros(N,dtype=np.float64)
def add(x,at,volume=1):
    i=int(at*SR)
    if i>=N:return
    n=min(len(x),N-i)
    if n>0:buf[i:i+n]+=volume*x[:n]
noise=r.standard_normal(N)
kernel=np.ones(900)/900
wind=np.convolve(noise,kernel,mode="same")
buf+=.21*wind*(1+.32*np.sin(2*np.pi*.084*t))
chords=[(0,8,[146.83,185.00,220.00]),(8,15,[123.47,146.83,185.00]),(15,23,[98.,146.83,196.]),(23,30,[110.,164.81,220.])]
for a,b,notes in chords:
    mask=(t>=a)&(t<b)
    tr=t[mask]-a
    fade=np.minimum(1,tr/1.4)*np.minimum(1,(b-a-tr)/1.4)
    for j,f in enumerate(notes):
        s=(np.sin(2*np.pi*f*tr)+.2*np.sin(2*np.pi*2*f*tr)+.07*np.sin(2*np.pi*3*f*tr))
        buf[mask]+=.008*fade*s
notes=[293.66,329.63,369.99,440.0,493.88,587.33,659.25,739.99]
for k,start in enumerate(np.arange(0.8,29,.65)):
    f=notes[[0,2,4,2,1,4,5,3][k%8]]
    tr=np.arange(int(.74*SR))/SR
    pluck=(np.sin(2*np.pi*f*tr)+.29*np.sin(2*np.pi*2*f*tr)+.13*np.sin(2*np.pi*3.03*f*tr))
    pluck*=np.exp(-6*tr)*(1-np.exp(-110*tr))
    add(pluck,start,.020 if start<24 else .027)
for st in [1.9,3.3,6.2,7.1,10.5,12.8,16.1,17.6,21.3,26.0,28.1]:
    for rep in range(2):
        tr=np.arange(int(.16*SR))/SR
        freq=1120+380*np.sin(2*np.pi*2.8*tr+rep)
        phase=2*np.pi*np.cumsum(freq)/SR
        envelope=np.sin(np.pi*np.arange(len(tr))/len(tr))**1.5
        add(np.sin(phase)*envelope,st+rep*.27,.018)
for st in np.arange(4.6,19.5,.47):
    tr=np.arange(int(.09*SR))/SR
    tick=r.standard_normal(len(tr))*np.exp(-45*tr)
    add(tick,st,.013)
for st,f in [(5.1,698.46),(20.5,783.99),(24.6,987.77),(25.1,1174.66)]:
    tr=np.arange(int(2.4*SR))/SR
    ch=np.sin(2*np.pi*f*tr)+.35*np.sin(2*np.pi*2.01*f*tr)+.11*np.sin(2*np.pi*3.98*f*tr)
    ch*=np.exp(-2.6*tr)*(1-np.exp(-80*tr))
    add(ch,st,.035)
buf*=np.minimum(1,t/.65)*np.minimum(1,(DUR-t)/.9)
peak=max(np.max(np.abs(buf)),1e-8)
buf*=min(1,.82/peak)
out=Path(__file__).resolve().parent/"out"/"mix.wav"
out.parent.mkdir(exist_ok=True)
with wave.open(str(out),"wb") as f:
    f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR)
    f.writeframes((np.clip(buf,-1,1)*32767).astype("<i2").tobytes())
print(f"Audio generated: {out}, duration={DUR}s, peak={peak:.3f}")
