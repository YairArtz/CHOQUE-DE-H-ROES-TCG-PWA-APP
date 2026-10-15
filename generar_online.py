# Genera online.html a partir de simulacion.html (misma lógica, mismos archivos) + online.js
# Uso: python3 generar_online.py simulacion.html online.html
import sys,re
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c<n: raise SystemExit('No encontré: '+a[:60])
    s=s.replace(a,b)
s=re.sub(r'<title>.*?</title>','<title>Choque de Héroes · Online</title>',s,count=1,flags=re.S)
rep('href="simulacion.html" class="hdr-back"','href="online.html" class="hdr-back"')
rep('</body>','<script src="online.js"></script>\n</body>')
s=s.replace('<!-- PANTALLA DE ENTRADA','<!-- ONLINE: generado desde simulacion.html con generar_online.py; no editar a mano -->\n<!-- PANTALLA DE ENTRADA',1)
open(dst,'w',encoding='utf-8').write(s)
print('ok',dst,len(s))
