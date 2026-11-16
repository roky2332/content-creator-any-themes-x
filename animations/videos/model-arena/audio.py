import numpy as np, wave, sys
sr=44100; D=12.0; n=int(sr*D); t=np.arange(n)/sr; rng=np.random.default_rng(7)
def lp(x,a):
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): s+=a*(x[i]-s); y[i]=s
    return y
def env(a,b,c,d):  # piecewise: 0 before a, ramp a->b, hold b->c, ramp c->d to 0
    e=np.zeros(n); e[(t>=a)&(t<b)]=(t[(t>=a)&(t<b)]-a)/(b-a); e[(t>=b)&(t<c)]=1; m=(t>=c)&(t<d); e[m]=1-(t[m]-c)/(d-c); return e
out=np.zeros(n)
# ambient wind
w=lp(rng.standard_normal(n),0.01); out+=0.25*w/np.abs(w).max()*env(0,0.5,11,12)
# countdown beeps
for k,ts in enumerate([0.15,0.6,1.05]):
    m=(t>=ts)&(t<ts+0.09); out[m]+=0.18*np.sin(2*np.pi*(880 if k<2 else 1320)*(t[m]-ts))*np.exp(-(t[m]-ts)*30)
# ignition hiss
h=rng.standard_normal(n); h=h-lp(h,0.2); out+=0.22*h*env(1.45,1.7,2.4,3.4)
# rumble: brown noise, two lowpasses
b=np.cumsum(rng.standard_normal(n)); b=b-lp(b,0.0005); b=lp(b,0.03); b/=np.abs(b).max()
rum=env(1.5,3.0,7.0,10.2)*0.8+0.0; out+=0.9*b*rum
# crackle
c=np.zeros(n); idx=rng.integers(int(1.6*sr),int(9.5*sr),2600); c[idx]=rng.uniform(-1,1,len(idx)); c=lp(c,0.35); c/=np.abs(c).max()+1e-9; out+=0.35*c*env(1.6,2.6,6.5,9.6)
# rank pops 4->1
for ts,f in zip([9.0,9.35,9.7,10.05],[523.25,659.25,783.99,1046.5]):
    m=(t>=ts)&(t<ts+0.35); x=t[m]-ts; out[m]+=0.22*np.sin(2*np.pi*f*x)*np.exp(-x*12)
# winner chord
m=t>=10.4; x=t[m]-10.4
for f,dl in [(523.25,0),(659.25,0.06),(783.99,0.12),(1046.5,0.18),(1318.5,0.24)]:
    xx=np.clip(x-dl,0,None); out[m]+=0.11*np.sin(2*np.pi*f*xx)*np.exp(-xx*1.6)*(x>=dl)
out*=env(0,0.05,11.6,12.0)
out/=np.abs(out).max()*1.08
st=np.stack([out,np.roll(out,90)],1)
with wave.open(sys.argv[1],'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(sr); wf.writeframes((st*32767).astype(np.int16).tobytes())
print('wav ok')
