(function(){'use strict';var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function scene(cv,cf,hol,A){
    var c=cv.getContext("2d"),dpr=Math.min(window.devicePixelRatio||1,1.5),W=0,H=0,CW=16,cand=[],p=0,off=0,S=0,last=0,nC=0,nF=0,side="FALL",ctr=[],chips=[],cols=[],i,
    still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function newC(){var o=p;p+=(Math.random()-.5)*7-p*.04;cand.push({o:o,c:p,h:Math.max(o,p)+Math.random()*3,l:Math.min(o,p)-Math.random()*3});if(cand.length>W/CW+3)cand.shift()}
    function size(){W=cv.clientWidth;H=cv.clientHeight;if(!W)return;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0);
      cand=[];p=0;for(i=0;i<W/CW+3;i++)newC();cols=[];
      for(i=0;i<W/54;i++){var d=[];for(var m=0;m<7;m++)d.push((Math.random()*10)|0);cols.push({x:i*54+10,y:Math.random()*H,v:14+Math.random()*34,d:d})}}
    function Y(v){return H*.5-v*H*.016}
    function draw(T,dt){
      if(!W||!cand.length)return;
      var k=cf(),up=k[0],dn=k[1],tc=k[2],n=cand.length,j,x,yy,cd,hx=W-off,hy=Y(cand[n-1].c),M=H+160;
      c.clearRect(0,0,W,H);c.font="12px ui-monospace,Menlo,monospace";c.fillStyle=up;
      cols.forEach(function(o){o.y-=o.v*dt;if(Math.random()<.015)o.d[(Math.random()*7)|0]=(Math.random()*10)|0;
        for(var m=0;m<7;m++){c.globalAlpha=(.05+.1*(1-m/7))*A;c.fillText(o.d[m],o.x,((o.y+m*18)%M+M)%M-80)}});
      c.globalAlpha=.25*A;c.lineWidth=2;c.strokeStyle=dn;c.beginPath();
      for(j=0;j<n;j++){x=W-off-(n-1-j)*CW;yy=H*.64-cand[j].c*H*.009;if(j)c.lineTo(x,yy);else c.moveTo(x,yy)}c.stroke();
      for(j=0;j<n;j++){cd=cand[j];x=W-off-(n-1-j)*CW;var upc=cd.c>=cd.o,col=upc?up:dn;
        c.globalAlpha=.5*A;c.strokeStyle=col;c.fillStyle=col;c.lineWidth=1.5;c.beginPath();c.moveTo(x,Y(cd.h));c.lineTo(x,Y(cd.l));c.stroke();
        var y1=Y(Math.max(cd.o,cd.c)),hh=Math.max(2,Math.abs(Y(cd.o)-Y(cd.c)));
        if(upc||!hol)c.fillRect(x-4.5,y1,9,hh);else c.strokeRect(x-4.5,y1,9,hh)}
      c.globalAlpha=.95*A;c.lineWidth=2.5;c.lineJoin="round";c.strokeStyle=up;c.shadowColor=up;c.shadowBlur=18;c.beginPath();
      for(j=0;j<n;j++){x=W-off-(n-1-j)*CW;yy=Y(cand[j].c);if(j)c.lineTo(x,yy);else c.moveTo(x,yy)}c.stroke();c.shadowBlur=0;
      var pr=(T*1.5)%1;c.globalAlpha=(1-pr)*.7*A;c.lineWidth=2;c.beginPath();c.arc(hx,hy,6+pr*22,0,6.283);c.stroke();
      c.globalAlpha=A;c.fillStyle=up;c.beginPath();c.arc(hx,hy,5,0,6.283);c.fill();
      if(T>nC){nC=T+4.5;side=side==="RISE"?"FALL":"RISE";ctr.push({s:side,t:T,sx:S,py:cand[n-1].c})}
      ctr=ctr.filter(function(o){return T-o.t<5.7});
      ctr.forEach(function(o){var a=T-o.t,ex=hx-(S-o.sx),ey=Y(o.py),col=o.s==="RISE"?up:dn,fade=a<5?1:Math.max(0,1-(a-5)/.7);
        c.globalAlpha=.9*fade*A;c.setLineDash([6,6]);c.strokeStyle=col;c.lineWidth=1.3;c.beginPath();c.moveTo(ex,ey);c.lineTo(hx,ey);c.stroke();c.setLineDash([]);
        c.fillStyle=col;c.beginPath();c.arc(ex,ey,5,0,6.283);c.fill();
        c.font="700 12px sans-serif";var lab=(o.s==="RISE"?"\u25B2 RISE":"\u25BC FALL")+"  $10",w=c.measureText(lab).width+18;
        c.globalAlpha=.9*fade*A;c.fillStyle=col;c.beginPath();if(c.roundRect)c.roundRect(ex+8,ey-32,w,22,11);else c.rect(ex+8,ey-32,w,22);c.fill();
        c.fillStyle=tc;c.fillText(lab,ex+17,ey-17);
        c.lineWidth=3;c.strokeStyle=col;c.beginPath();
        if(a<5)c.arc(hx,hy,18,-1.5708,-1.5708+6.283*(a/5));else{var b=(a-5)/.7;c.globalAlpha=(1-b)*.8*A;c.arc(hx,hy,18+b*55,0,6.283)}
        c.stroke()});
      if(T>nF){nF=T+1.4;chips.push({x:Math.random()*W,y:H+20,v:30+Math.random()*45,u:Math.random()<.5})}
      chips=chips.filter(function(o){return o.y>-40});
      c.font="700 16px sans-serif";
      chips.forEach(function(o){o.y-=o.v*dt;var f=Math.max(0,Math.min(1,(H-o.y)/120,(o.y+40)/160)),col=o.u?up:dn;
        c.globalAlpha=.6*f*A;c.fillStyle=col;c.shadowColor=col;c.shadowBlur=14;c.fillText(o.u?"\u25B2":"\u25BC",o.x,o.y);c.shadowBlur=0});
      c.globalAlpha=1;
    }
    function loop(t){requestAnimationFrame(loop);if(!cv.getClientRects().length||document.hidden){last=t;return}
      if(!W||W!==cv.clientWidth||H!==cv.clientHeight)size();if(!W)return;
      var dt=Math.min((t-last)/1000,.1);last=t;off+=dt*46;S+=dt*46;while(off>=CW){off-=CW;newC()}draw(t/1000,dt)}
    if(still){size();draw(0,0);window.addEventListener("resize",function(){size();draw(0,0)})}else requestAnimationFrame(loop);
  }
  function fx(cv,cf,fn){
    var c=cv.getContext("2d"),dpr=Math.min(window.devicePixelRatio||1,1.5),W=0,H=0,last=0,s={};
    function size(){W=cv.clientWidth;H=cv.clientHeight;if(!W)return;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0);s={}}
    function tick(T,dt){if(!W)return;c.clearRect(0,0,W,H);fn(c,W,H,T,dt,cf(),s)}
    function loop(t){requestAnimationFrame(loop);if(!cv.getClientRects().length||document.hidden){last=t;return}
      if(!W||W!==cv.clientWidth||H!==cv.clientHeight)size();var dt=Math.min((t-last)/1000,.1);last=t;tick(t/1000,dt)}
    cv.rd=function(){size();for(var k=0;k<40;k++)tick(k*.2,.05)};
    if(RM){cv.rd();window.addEventListener("resize",cv.rd)}else requestAnimationFrame(loop);
  }
  function digFn(c,W,H,T,dt,k,s){
    if(!s.c){s.c=[];for(var i=0;i<W/20;i++)s.c.push({x:i*20+4,y:Math.random()*H*1.5,v:70+Math.random()*130,n:8+((Math.random()*10)|0),d:[]})}
    c.font="700 15px ui-monospace,Menlo,monospace";
    s.c.forEach(function(o){o.y+=o.v*dt;if(o.y-o.n*18>H){o.y=-Math.random()*H*.4;o.v=70+Math.random()*130}
      for(var m=0;m<o.n;m++){if(o.d[m]===undefined||Math.random()<.02)o.d[m]=(Math.random()*10)|0;
        c.globalAlpha=m?(1-m/o.n)*.55:1;c.fillStyle=m?k[0]:k[1];if(!m){c.shadowColor=k[1];c.shadowBlur=14}else c.shadowBlur=0;c.fillText(o.d[m],o.x,o.y-m*18)}});
    c.shadowBlur=0;c.globalAlpha=1}
  function pulseFn(c,W,H,T,dt,k,s){
    var n=Math.ceil(W/3),g,i;if(!s.p){s.p=[];s.a=0;s.t=0;for(i=0;i<n;i++)s.p.push(0)}
    s.a+=dt;while(s.a>=.016){s.a-=.016;s.t++;var ph=s.t%120,v=(Math.random()-.5)*.1;if(ph<8)v+=ph*.1;else if(ph<14)v-=(ph-8)*.18;else if(ph<20)v+=(ph-14)*.12;s.p.push(v);s.p.shift()}
    c.strokeStyle=k[0];c.lineWidth=1;c.globalAlpha=.1;
    for(g=1;g<6;g++){c.beginPath();c.moveTo(0,H*g/6);c.lineTo(W,H*g/6);c.stroke()}
    c.lineJoin="round";c.lineWidth=3;c.shadowColor=k[0];c.shadowBlur=20;c.globalAlpha=.95;c.beginPath();
    s.p.forEach(function(v,j){var y=H*.5-v*H*.42;if(j)c.lineTo(j*3,y);else c.moveTo(0,y)});c.stroke();
    c.shadowBlur=0;c.globalAlpha=.25;c.strokeStyle=k[1];c.lineWidth=2;c.beginPath();
    s.p.forEach(function(v,j){var y=H*.5+v*H*.2;if(j)c.lineTo(j*3,y);else c.moveTo(0,y)});c.stroke();
    c.globalAlpha=1;c.fillStyle=k[1];c.shadowColor=k[1];c.shadowBlur=18;c.beginPath();c.arc((s.p.length-1)*3,H*.5-s.p[s.p.length-1]*H*.42,5,0,6.283);c.fill();c.shadowBlur=0}
  function arrFn(c,W,H,T,dt,k,s){
    if(!s.a){s.a=[];s.n=0}
    s.n-=dt;if(s.n<=0){s.n=.3;s.a.push({x:Math.random()*W,y:H+40,v:50+Math.random()*110,z:18+Math.random()*40,u:Math.random()<.5,p:Math.random()*6.28})}
    s.a=s.a.filter(function(o){return o.y>-60});
    s.a.forEach(function(o){o.y-=o.v*dt;var f=Math.max(0,Math.min(1,(H-o.y)/140,(o.y+60)/200)),col=o.u?k[0]:k[1];
      c.globalAlpha=.8*f;c.fillStyle=col;c.shadowColor=col;c.shadowBlur=22;c.font="700 "+o.z+"px sans-serif";c.fillText(o.u?"\u25B2":"\u25BC",o.x+Math.sin(T+o.p)*14,o.y)});
    c.shadowBlur=0;c.globalAlpha=1}
  function lcg(n){var x=n;return function(){x=(x*1664525+1013904223)%4294967296;return x/4294967296}}
  function imgBG(kind,a,b){
    var r=lcg(7),i,j,s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">';
    if(kind==="img-mesh")return "radial-gradient(50% 60% at 15% 20%,"+a+"88,transparent),radial-gradient(45% 55% at 85% 30%,"+b+"77,transparent),radial-gradient(55% 60% at 50% 100%,"+a+"55,transparent)";
    if(kind==="img-chart"){var p=250;for(j=1;j<6;j++)s+='<line x1="0" x2="800" y1="'+j*83+'" y2="'+j*83+'" stroke="'+b+'" opacity=".12"/>';
      for(i=0;i<40;i++){var o=p;p+=(r()-.5)*60-(p-250)*.05;var hi=Math.max(o,p)+r()*20,lo=Math.min(o,p)-r()*20,cx=i*20+10,up=p<=o,col=up?a:b;
        s+='<line x1="'+cx+'" x2="'+cx+'" y1="'+hi+'" y2="'+lo+'" stroke="'+col+'" stroke-width="2" opacity=".5"/><rect x="'+(cx-6)+'" y="'+Math.min(o,p)+'" width="12" height="'+Math.max(3,Math.abs(o-p))+'" fill="'+(up?a:"none")+'" stroke="'+col+'" opacity=".6"/>'}}
    if(kind==="img-grid"){s+='<defs><linearGradient id="h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+a+'" stop-opacity=".5"/><stop offset="1" stop-color="'+a+'" stop-opacity="0"/></linearGradient></defs><rect width="800" height="250" fill="url(#h)"/>';
      for(i=-12;i<=12;i++)s+='<line x1="400" y1="250" x2="'+(400+i*130)+'" y2="500" stroke="'+b+'" opacity=".35"/>';
      for(j=1;j<9;j++)s+='<line x1="0" x2="800" y1="'+(250+j*j*3.9)+'" y2="'+(250+j*j*3.9)+'" stroke="'+b+'" opacity=".35"/>'}
    if(kind==="img-digits"){for(i=0;i<60;i++)s+='<text x="'+(r()*780|0)+'" y="'+(r()*480|0)+'" font-size="'+(18+r()*60|0)+'" font-family="monospace" font-weight="700" fill="'+(r()<.5?a:b)+'" opacity="'+(.08+r()*.22).toFixed(2)+'">'+(r()*10|0)+'</text>'}
    return "url('data:image/svg+xml,"+encodeURIComponent(s+'</svg>')+"')";
  }
  var E={};
  E.ticker=function(c,W,H,T,dt,k,s){
    var P=["EUR/USD","GBP/USD","USD/JPY","BTC/USD","XAU/USD","R_100","BOOM 500","CRASH 500","USD/KES","AUD/USD"],n=Math.ceil(H/46),i,j,o,x,h,idx;
    if(!s.r){s.r=[];for(i=0;i<n;i++)s.r.push({o:Math.random()*5000,v:30+Math.random()*70})}
    c.font="600 15px ui-monospace,Menlo,monospace";
    for(i=0;i<n;i++){o=s.r[i];o.o+=o.v*dt;for(j=-1;j<W/170+2;j++){idx=Math.floor(o.o/170)+j;x=j*170-(o.o%170);h=((idx*2654435761)^(i*40503))>>>0;
      c.globalAlpha=.4;c.fillStyle=h&1?k[0]:k[1];c.fillText(P[h%P.length]+" "+(1+((h>>8)%900)/100).toFixed(2)+(h&1?" \u25B2":" \u25BC"),x,i*46+30)}}
    c.globalAlpha=1};
  E.coins=function(c,W,H,T,dt,k,s){
    if(!s.a){s.a=[];s.n=0}s.n-=dt;if(s.n<=0){s.n=.18;s.a.push({x:Math.random()*W,y:-30,v:70+Math.random()*120,r:10+Math.random()*14,p:Math.random()*6.28,w:2+Math.random()*3})}
    s.a=s.a.filter(function(o){return o.y<H+40});
    s.a.forEach(function(o){o.y+=o.v*dt;o.p+=o.w*dt;var rx=o.r*Math.abs(Math.cos(o.p));c.globalAlpha=.75;c.fillStyle=k[0];c.strokeStyle=k[1];c.lineWidth=2;c.shadowColor=k[0];c.shadowBlur=12;
      c.beginPath();c.ellipse(o.x,o.y,Math.max(1,rx),o.r,0,0,6.283);c.fill();c.stroke();
      if(rx>o.r*.5){c.shadowBlur=0;c.fillStyle=k[1];c.font="700 "+o.r+"px sans-serif";c.textAlign="center";c.fillText("$",o.x,o.y+o.r*.35);c.textAlign="left"}});
    c.shadowBlur=0;c.globalAlpha=1};
  E.currency=function(c,W,H,T,dt,k,s){
    var S=["$","\u20AC","\u00A3","\u00A5","\u20BF","\u20A6","\u20B9","R","\u20A9"];
    if(!s.a){s.a=[];s.n=0}s.n-=dt;if(s.n<=0){s.n=.35;s.a.push({x:Math.random()*W,y:H+50,v:40+Math.random()*90,z:24+Math.random()*50,t:S[(Math.random()*9)|0],p:Math.random()*6.28,c:Math.random()<.5})}
    s.a=s.a.filter(function(o){return o.y>-80});
    s.a.forEach(function(o){o.y-=o.v*dt;var f=Math.max(0,Math.min(1,(H-o.y)/140,(o.y+80)/200)),col=o.c?k[0]:k[1];c.globalAlpha=.7*f;c.fillStyle=col;c.shadowColor=col;c.shadowBlur=18;c.font="700 "+o.z+"px sans-serif";c.fillText(o.t,o.x+Math.sin(T*.8+o.p)*18,o.y)});
    c.shadowBlur=0;c.globalAlpha=1};
  E.moneyrain=function(c,W,H,T,dt,k,s){
    var S=["$","\u20AC","\u00A3","\u00A5"];
    if(!s.c){s.c=[];for(var i=0;i<W/26;i++)s.c.push({x:i*26+4,y:Math.random()*H*1.5,v:60+Math.random()*120,n:7+((Math.random()*8)|0),d:[]})}
    c.font="700 18px sans-serif";
    s.c.forEach(function(o){o.y+=o.v*dt;if(o.y-o.n*22>H){o.y=-Math.random()*H*.4;o.v=60+Math.random()*120}
      for(var m=0;m<o.n;m++){if(o.d[m]===undefined)o.d[m]=S[(Math.random()*4)|0];c.globalAlpha=m?(1-m/o.n)*.5:1;c.fillStyle=m?k[0]:k[1];if(!m){c.shadowColor=k[1];c.shadowBlur=14}else c.shadowBlur=0;c.fillText(o.d[m],o.x,o.y-m*22)}});
    c.shadowBlur=0;c.globalAlpha=1};
  E.waves=function(c,W,H,T,dt,k){
    for(var i=0;i<5;i++){c.beginPath();c.moveTo(0,H);for(var x=0;x<=W;x+=12)c.lineTo(x,H*(.45+.1*i)+Math.sin(x*.006+T*(.4+i*.12)+i)*H*.07+Math.sin(x*.015-T*.6)*H*.02);
      c.lineTo(W,H);c.closePath();c.globalAlpha=.16;c.fillStyle=i%2?k[1]:k[0];c.fill();c.globalAlpha=.7;c.lineWidth=1.5;c.strokeStyle=i%2?k[1]:k[0];c.stroke()}c.globalAlpha=1};
  E.bars=function(c,W,H,T,dt,k){
    var n=Math.ceil(W/22),i,h;for(i=0;i<n;i++){h=(Math.sin(T*1.3+i*.7)+Math.sin(T*.8+i*1.9)+2)/4*H*.62;c.globalAlpha=.55;c.fillStyle=Math.cos(T*1.3+i*.7)>0?k[0]:k[1];c.shadowColor=c.fillStyle;c.shadowBlur=10;c.fillRect(i*22+3,H-h,14,h)}
    c.shadowBlur=0;c.globalAlpha=1};
  E.radar=function(c,W,H,T,dt,k,s){
    var cx=W*.5,cy=H*.5,R=Math.min(W,H)*.42,a=T*1.1,j,i;
    if(!s.b){s.b=[];s.n=0}
    c.strokeStyle=k[0];c.lineWidth=1;c.globalAlpha=.25;for(i=1;i<=4;i++){c.beginPath();c.arc(cx,cy,R*i/4,0,6.283);c.stroke()}
    c.beginPath();c.moveTo(cx-R,cy);c.lineTo(cx+R,cy);c.moveTo(cx,cy-R);c.lineTo(cx,cy+R);c.stroke();
    c.fillStyle=k[0];for(j=0;j<26;j++){c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,R,a-j*.035-.035,a-j*.035);c.closePath();c.globalAlpha=.3*(1-j/26);c.fill()}
    s.n-=dt;if(s.n<=0){s.n=.5;var r=R*(.2+Math.random()*.75),an=a-Math.random()*.5;s.b.push({x:cx+Math.cos(an)*r,y:cy+Math.sin(an)*r,t:0})}
    s.b=s.b.filter(function(o){return o.t<3});c.fillStyle=k[1];
    s.b.forEach(function(o){o.t+=dt;c.globalAlpha=.9*(1-o.t/3);c.shadowColor=k[1];c.shadowBlur=12;c.beginPath();c.arc(o.x,o.y,4,0,6.283);c.fill()});c.shadowBlur=0;c.globalAlpha=1};
  E.rings=function(c,W,H,T,dt,k,s){
    if(!s.a){s.a=[];s.n=0}s.n-=dt;if(s.n<=0){s.n=.6;s.a.push({x:Math.random()*W,y:Math.random()*H,t:0,c:Math.random()<.5})}
    s.a=s.a.filter(function(o){return o.t<4});c.lineWidth=2;
    s.a.forEach(function(o){o.t+=dt;var col=o.c?k[0]:k[1];c.strokeStyle=col;c.fillStyle=col;c.shadowColor=col;c.shadowBlur=10;
      for(var m=0;m<2;m++){var r=Math.max(0,o.t-m*.5)*55;c.globalAlpha=Math.max(0,.7*(1-r/220));c.beginPath();c.arc(o.x,o.y,r,0,6.283);c.stroke()}
      c.globalAlpha=Math.max(0,1-o.t/1.2);c.beginPath();c.arc(o.x,o.y,4,0,6.283);c.fill()});c.shadowBlur=0;c.globalAlpha=1};
  E.digitgrid=function(c,W,H,T,dt,k,s){
    var cs=56,cols=Math.ceil(W/cs),rows=Math.ceil(H/cs),i,j;if(!s.f){s.f=[];s.n=0}
    c.font="600 20px ui-monospace,Menlo,monospace";c.textAlign="center";c.fillStyle=k[0];c.globalAlpha=.13;
    for(i=0;i<cols;i++)for(j=0;j<rows;j++)c.fillText((i*7+j*13+i*j)%10,i*cs+cs/2,j*cs+cs/2+7);
    s.n-=dt;if(s.n<=0){s.n=.25;s.f.push({i:(Math.random()*cols)|0,j:(Math.random()*rows)|0,t:0})}
    s.f=s.f.filter(function(o){return o.t<1.6});
    s.f.forEach(function(o){o.t+=dt;var a=1-o.t/1.6;c.globalAlpha=.3*a;c.fillStyle=k[1];c.fillRect(o.i*cs+2,o.j*cs+2,cs-4,cs-4);c.globalAlpha=.95*a;c.shadowColor=k[1];c.shadowBlur=12;c.fillText((o.i*7+o.j*13+o.i*o.j)%10,o.i*cs+cs/2,o.j*cs+cs/2+7);c.shadowBlur=0});
    c.textAlign="left";c.globalAlpha=1};
  E.spark=function(c,W,H,T,dt,k,s){
    var cw=170,ch=84,cols=Math.ceil(W/cw),n=cols*Math.ceil(H/ch),i,j;
    if(!s.c){s.c=[];s.a=0;for(i=0;i<n;i++){var a=[],v=0;for(j=0;j<24;j++){v+=Math.random()-.5;a.push(v)}s.c.push(a)}}
    s.a+=dt;if(s.a>.25){s.a=0;s.c.forEach(function(a){a.push(a[a.length-1]+Math.random()-.5);a.shift()})}
    c.lineWidth=1.6;
    s.c.forEach(function(a,q){var x0=(q%cols)*cw+16,y0=Math.floor(q/cols)*ch+ch/2;c.strokeStyle=a[23]>=a[0]?k[0]:k[1];c.globalAlpha=.5;c.beginPath();
      a.forEach(function(v,m){var x=x0+m*5.5,y=y0-v*9;if(m)c.lineTo(x,y);else c.moveTo(x,y)});c.stroke()});c.globalAlpha=1};
  E.depth=function(c,W,H,T,dt,k,s){
    var n=Math.ceil(H/20),i,o,w1,w2;if(!s.v){s.v=[];for(i=0;i<n;i++)s.v.push({a:Math.random(),b:Math.random(),p:Math.random()*6.28})}
    for(i=0;i<n;i++){o=s.v[i];if(Math.random()<.02){o.a=Math.random();o.b=Math.random()}
      w1=W*.38*(.3+.7*o.a)*(.8+.2*Math.sin(T*2+o.p));w2=W*.38*(.3+.7*o.b)*(.8+.2*Math.cos(T*2+o.p));
      c.globalAlpha=.4;c.fillStyle=k[0];c.fillRect(0,i*20+3,w1,14);c.fillStyle=k[1];c.fillRect(W-w2,i*20+3,w2,14)}c.globalAlpha=1};
  E.gauge=function(c,W,H,T,dt,k){
    var cx=W*.5,cy=H*.62,R=Math.min(W*.45,H*.55),a0=Math.PI*.8,a1=Math.PI*2.2,i,t,q,v=.5+.4*Math.sin(T*.5)+.08*Math.sin(T*2.3),an=a0+(a1-a0)*v,g;
    c.lineWidth=14;c.lineCap="round";c.globalAlpha=.18;c.strokeStyle=k[0];c.beginPath();c.arc(cx,cy,R,a0,a1);c.stroke();
    g=c.createLinearGradient(cx-R,0,cx+R,0);g.addColorStop(0,k[1]);g.addColorStop(1,k[0]);c.strokeStyle=g;c.globalAlpha=.6;c.shadowColor=k[0];c.shadowBlur=18;c.beginPath();c.arc(cx,cy,R,a0,an);c.stroke();c.shadowBlur=0;
    c.lineWidth=2;c.globalAlpha=.35;c.strokeStyle=k[0];
    for(i=0;i<=24;i++){t=a0+(a1-a0)*i/24;q=R-(i%4?36:46);c.beginPath();c.moveTo(cx+Math.cos(t)*(R-26),cy+Math.sin(t)*(R-26));c.lineTo(cx+Math.cos(t)*q,cy+Math.sin(t)*q);c.stroke()}
    c.lineWidth=4;c.globalAlpha=.9;c.strokeStyle=k[1];c.shadowColor=k[1];c.shadowBlur=12;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(an)*(R-30),cy+Math.sin(an)*(R-30));c.stroke();c.shadowBlur=0;
    c.fillStyle=k[1];c.beginPath();c.arc(cx,cy,8,0,6.283);c.fill();c.lineCap="butt";c.globalAlpha=1};
  E.network=function(c,W,H,T,dt,k,s){
    var i,j,a,b,d,n=Math.min(46,Math.ceil(W*H/22000));
    if(!s.n){s.n=[];for(i=0;i<n;i++)s.n.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*24,vy:(Math.random()-.5)*24});s.p=[]}
    s.n.forEach(function(o){o.x+=o.vx*dt;o.y+=o.vy*dt;if(o.x<0||o.x>W)o.vx*=-1;if(o.y<0||o.y>H)o.vy*=-1});
    c.lineWidth=1;
    for(i=0;i<n;i++)for(j=i+1;j<n;j++){a=s.n[i];b=s.n[j];d=Math.hypot(a.x-b.x,a.y-b.y);if(d<170){c.globalAlpha=.3*(1-d/170);c.strokeStyle=k[0];c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();if(Math.random()<.0015)s.p.push({a:a,b:b,t:0})}}
    s.p=s.p.filter(function(o){return o.t<1});c.fillStyle=k[1];c.shadowColor=k[1];c.shadowBlur=12;
    s.p.forEach(function(o){o.t+=dt*.8;c.globalAlpha=.9;c.beginPath();c.arc(o.a.x+(o.b.x-o.a.x)*o.t,o.a.y+(o.b.y-o.a.y)*o.t,3.5,0,6.283);c.fill()});c.shadowBlur=0;
    c.fillStyle=k[0];s.n.forEach(function(o){c.globalAlpha=.7;c.beginPath();c.arc(o.x,o.y,2.6,0,6.283);c.fill()});c.globalAlpha=1};
  E.ticks=function(c,W,H,T,dt,k,s){
    if(!s.p){s.p=[];s.v=0;s.a=0}s.a+=dt;while(s.a>.05){s.a-=.05;s.v+=(Math.random()-.5)*.5-s.v*.03;s.p.push({x:W+10,y:s.v})}
    s.p.forEach(function(o){o.x-=110*dt});s.p=s.p.filter(function(o){return o.x>-10});
    c.lineWidth=1;c.strokeStyle=k[1];c.globalAlpha=.25;c.beginPath();s.p.forEach(function(o,i){var y=H*.5-o.y*H*.2;if(i)c.lineTo(o.x,y);else c.moveTo(o.x,y)});c.stroke();
    c.fillStyle=k[0];c.shadowColor=k[0];c.shadowBlur=8;s.p.forEach(function(o,i){c.globalAlpha=.85;c.beginPath();c.arc(o.x,H*.5-o.y*H*.2,i===s.p.length-1?5:3,0,6.283);c.fill()});c.shadowBlur=0;c.globalAlpha=1};
  E.trend=function(c,W,H,T,dt,k,s){
    var i,m=14,y;
    if(!s.q||s.t>11){s.t=0;s.q=[];y=H*.8;for(i=0;i<=m;i++){s.q.push({x:W*.06+i*(W*.88/m),y:y});y-=(Math.random()-.3)*H*.1;y=Math.max(H*.12,Math.min(H*.9,y))}}
    s.t+=dt;var p=Math.min(1,s.t/7),f=s.t>9?Math.max(0,1-(s.t-9)/2):1,tot=p*m,seg=Math.floor(tot),fr=tot-seg,sg=Math.min(seg,m),lx=s.q[sg].x,ly=s.q[sg].y;
    c.lineJoin="round";c.lineWidth=3;c.strokeStyle=k[0];c.shadowColor=k[0];c.shadowBlur=16;c.globalAlpha=.9*f;c.beginPath();c.moveTo(s.q[0].x,s.q[0].y);
    for(i=1;i<=sg;i++)c.lineTo(s.q[i].x,s.q[i].y);
    if(seg<m){lx+=(s.q[seg+1].x-lx)*fr;ly+=(s.q[seg+1].y-ly)*fr;c.lineTo(lx,ly)}
    c.stroke();c.fillStyle=k[1];c.shadowColor=k[1];c.shadowBlur=14;c.beginPath();c.arc(lx,ly,6,0,6.283);c.fill();c.shadowBlur=0;
    c.setLineDash([6,6]);c.lineWidth=1;c.strokeStyle=k[1];c.globalAlpha=.3*f;c.beginPath();c.moveTo(0,s.q[0].y);c.lineTo(W,s.q[0].y);c.stroke();c.setLineDash([]);c.globalAlpha=1};
  E.heatmap=function(c,W,H,T,dt,k){
    var cs=46,cols=Math.ceil(W/cs),rows=Math.ceil(H/cs),i,j,v;
    for(i=0;i<cols;i++)for(j=0;j<rows;j++){v=Math.sin(T*.6+i*.5+j*.7+Math.sin(i*j*.3));c.globalAlpha=.06+.3*Math.abs(v);c.fillStyle=v>0?k[0]:k[1];c.fillRect(i*cs+3,j*cs+3,cs-6,cs-6)}c.globalAlpha=1};
  E.orbit=function(c,W,H,T,dt,k){var i,r=Math.min(W,H)*.12;c.lineWidth=1;for(i=0;i<5;i++){c.strokeStyle=i%2?k[1]:k[0];c.globalAlpha=.24;c.beginPath();c.ellipse(W/2,H/2,r+i*22,r*.45+i*12,T*.15+i*.4,0,6.283);c.stroke();c.fillStyle=i%2?k[0]:k[1];c.beginPath();c.arc(W/2+Math.cos(T*.45+i)* (r+i*22),H/2+Math.sin(T*.45+i)*(r*.45+i*12),3+i%2,0,6.283);c.fill()}c.globalAlpha=1};
  E.bubbles=function(c,W,H,T,dt,k){var i,x,y,r;for(i=0;i<28;i++){x=(i*79%W);y=H-((T*24+i*53)%(H+30));r=3+(i*7%16);c.globalAlpha=.1+(i%4)*.07;c.strokeStyle=i%2?k[0]:k[1];c.beginPath();c.arc(x+Math.sin(T+i)*12,y,r,0,6.283);c.stroke()}c.globalAlpha=1};
  E.spiral=function(c,W,H,T,dt,k){var i,a,r;c.lineWidth=2;c.beginPath();for(i=0;i<420;i++){a=i*.11+T*.35;r=i*.28;var x=W/2+Math.cos(a)*r,y=H/2+Math.sin(a)*r;if(i)c.lineTo(x,y);else c.moveTo(x,y)}c.strokeStyle=k[0];c.globalAlpha=.5;c.stroke();c.globalAlpha=1};
  E.starfield=function(c,W,H,T,dt,k){var i,x,y;for(i=0;i<130;i++){x=(i*137.5)%W;y=(i*71.3)%H;c.globalAlpha=.2+.65*Math.abs(Math.sin(T*(.3+i%4*.12)+i));c.fillStyle=i%3?k[0]:k[1];c.fillRect(x,y,1+i%3,1+i%3)}c.globalAlpha=1};
  E.aurora=function(c,W,H,T,dt,k){var i,x,y;c.lineWidth=2;for(i=0;i<13;i++){c.beginPath();for(x=0;x<=W;x+=8){y=H*.32+i*13+Math.sin(x*.008+T*.5+i*.8)*28+Math.sin(x*.018-T*.22+i)*10;if(x)c.lineTo(x,y);else c.moveTo(x,y)}c.globalAlpha=.08+i*.018;c.strokeStyle=i%2?k[0]:k[1];c.stroke()}c.globalAlpha=1};
  E.waveform=function(c,W,H,T,dt,k){var i,j,y;c.lineWidth=2;for(i=0;i<7;i++){c.beginPath();for(j=0;j<=W;j+=4){y=H/2+Math.sin(j*.018-T*(.8+i*.13)+i)*H*(.025+i*.008);if(j)c.lineTo(j,y);else c.moveTo(j,y)}c.globalAlpha=.13+i*.07;c.strokeStyle=i%2?k[0]:k[1];c.stroke()}c.globalAlpha=1};
  E.pulsegrid=function(c,W,H,T,dt,k){var x,y,s=34;c.lineWidth=1;for(x=0;x<W;x+=s)for(y=0;y<H;y+=s){var a=.08+.3*Math.max(0,Math.sin(T*2-x*.02-y*.015));c.globalAlpha=a;c.strokeStyle=(Math.floor(x/s)+Math.floor(y/s))%2?k[0]:k[1];c.strokeRect(x+5,y+5,s-10,s-10)}c.globalAlpha=1};
  E.comet=function(c,W,H,T,dt,k){var i,x,y;for(i=0;i<9;i++){x=(T*75+i*W/9)%(W+130)-65;y=H*(.15+(i*37%70)/100);c.globalAlpha=.4;c.strokeStyle=i%2?k[0]:k[1];c.lineWidth=2;c.beginPath();c.moveTo(x-80,y+22);c.lineTo(x,y);c.stroke();c.globalAlpha=.8;c.beginPath();c.arc(x,y,3,0,6.283);c.fillStyle=k[1];c.fill()}c.globalAlpha=1};
  E.matrix=function(c,W,H,T,dt,k){var x,y; c.font="14px monospace";for(x=0;x<W;x+=18){y=((T*55+x*19)%(H+100))-50;c.globalAlpha=.28;c.fillStyle=x%3?k[0]:k[1];c.fillText(String((x+Math.floor(T*3))%10),x,y);c.fillText(String((x+5)%10),x,y-24)}c.globalAlpha=1};
  E.rain=function(c,W,H,T,dt,k){var i,x,y;c.lineWidth=1;for(i=0;i<95;i++){x=(i*53.7)%W;y=(T*100+i*47)%(H+50)-25;c.globalAlpha=.15+(i%5)*.07;c.strokeStyle=i%2?k[0]:k[1];c.beginPath();c.moveTo(x,y);c.lineTo(x-4,y+12+i%20);c.stroke()}c.globalAlpha=1};
  E.radial=function(c,W,H,T,dt,k){var i,a,r;c.lineWidth=2;for(i=0;i<72;i++){a=i*6.283/72+T*.08;r=Math.min(W,H)*(.12+.035*Math.sin(T+i));c.globalAlpha=.35;c.strokeStyle=i%2?k[0]:k[1];c.beginPath();c.moveTo(W/2+Math.cos(a)*r,H/2+Math.sin(a)*r);c.lineTo(W/2+Math.cos(a)*(r+18),H/2+Math.sin(a)*(r+18));c.stroke()}c.globalAlpha=1};
  E.fan=function(c,W,H,T,dt,k){var i,a;c.lineWidth=1;for(i=0;i<45;i++){a=-1.25+i*.057+Math.sin(T*.35)*.1;c.globalAlpha=.14+i*.009;c.strokeStyle=i%2?k[0]:k[1];c.beginPath();c.moveTo(W*.5,H*.93);c.lineTo(W*.5+Math.sin(a)*H*.85,H*.93-Math.cos(a)*H*.85);c.stroke()}c.globalAlpha=1};
  E.hex=function(c,W,H,T,dt,k){var x,y,r=16,i,a;c.lineWidth=1;for(x=-20;x<W+30;x+=45)for(y=-20;y<H+30;y+=39){c.globalAlpha=.15+.18*Math.abs(Math.sin(T+x*.01+y*.02));c.strokeStyle=(Math.floor(x/45)+Math.floor(y/39))%2?k[0]:k[1];c.beginPath();for(i=0;i<6;i++){a=i*Math.PI/3;var px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i)c.lineTo(px,py);else c.moveTo(px,py)}c.closePath();c.stroke()}c.globalAlpha=1};
  E.candleGlow=function(c,W,H,T,dt,k){var i,x,y,h;c.globalAlpha=.38;for(i=0;i<22;i++){x=i*W/22+8;y=H*(.25+(i*17%55)/100);h=12+(i*13%40);c.fillStyle=i%2?k[0]:k[1];c.shadowColor=c.fillStyle;c.shadowBlur=7+5*Math.sin(T+i);c.fillRect(x,y,5,h);c.fillRect(x+2,y-7,1,h+14)}c.shadowBlur=0;c.globalAlpha=1};
  E.constellation=function(c,W,H,T,dt,k){var i,j,x,y,a,b,d;for(i=0;i<38;i++){x=(i*131.7)%W;y=(i*73.1)%H;c.fillStyle=i%3?k[0]:k[1];c.globalAlpha=.65;c.beginPath();c.arc(x,y,2,0,6.283);c.fill();for(j=i+1;j<Math.min(i+4,38);j++){a=(j*131.7)%W;b=(j*73.1)%H;d=Math.hypot(x-a,y-b);if(d<95){c.globalAlpha=.14;c.strokeStyle=k[0];c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke()}}}c.globalAlpha=1};

var mode='none',colors=['#377cfc','#ff7a5c','#fff'],state={};
var layer=document.createElement('div');layer.className='pf-client-background';
var candle=document.createElement('canvas'),canvas=document.createElement('canvas'),image=document.createElement('div');
layer.append(candle,canvas,image);document.body.prepend(layer);
layer.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:0;background:var(--pf-client-page)';
[candle,canvas,image].forEach(function(el){el.style.cssText='position:absolute;inset:0;width:100%;height:100%;background-size:cover;background-position:center'});
scene(candle,function(){return colors},true,.75);
fx(canvas,function(){return colors},function(c,W,H,T,dt,k){var fn=({digits:digFn,pulse:pulseFn,arrows:arrFn})[mode]||E[mode];if(fn)fn(c,W,H,T,dt,k,state)});
window.PipforgeBackground={update:function(key,a,b){if(key!==mode)state={};mode=key;colors=[a,b,'#fff'];candle.style.display=mode==='candles'?'block':'none';canvas.style.display=(E[mode]||['digits','pulse','arrows'].includes(mode))?'block':'none';image.style.backgroundImage=mode?.startsWith('img-')?imgBG(mode,a,b):'none';layer.style.display=document.documentElement.dataset.pfEmbedded==='true'?'none':'block';canvas.rd?.();}};
var site=window.__PF_SITE_BRANDING__;if(site){var style=getComputedStyle(document.documentElement);window.PipforgeBackground.update(site.background,style.getPropertyValue('--pf-client-accent').trim(),style.getPropertyValue('--pf-client-secondary').trim());}
})();