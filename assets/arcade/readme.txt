MODO ARCADE — ARCHIVOS PERSONALIZABLES
=======================================
Todo es opcional: si un archivo no existe, el Arcade usa sus valores por defecto.

  rivales.txt            Rivales, barajas, dificultad y frases. Se edita con el Bloc de notas.
  logo.png               Logo de la portada del Arcade (si no hay, usa el de la Simulación o el de la app).
  portada.jpg            Fondo de la portada y del menú de partidas.
  personajes/rival_01.png … rival_15.png
                         Personaje recortado, con fondo transparente. Recomendado: 900×1350 px (2:3).
  fondos/fondo_01.jpg … fondo_15.jpg
                         Fondo plano detrás del personaje. Recomendado: 1920×1080 px.
  musica/rival_01.mp3 … rival_15.mp3
                         Canción de cada rival (VS y combate). El nombre se cambia en rivales.txt (campo musica).
  musica/titulo.mp3      Música de la portada, partidas y ruta.
  musica/final.mp3       Música de la pantalla de ¡CAMPEÓN!
  personajes/jugador.png Imagen del jugador en la pantalla VS (si no hay, usa la portada de tu baraja).

Los nombres de los archivos de cada rival se cambian en rivales.txt (campos imagen y fondo).
Si un rival no tiene imagen, se muestra el arte de la carta indicada en "carta".

RUTA LEGENDARIA (RUTA II)
  rivales2.txt           Los 15 rivales de la Ruta II (mismo formato que rivales.txt).
                         Se desbloquea en cada partida al vencer al jefe de la Ruta I.
                         Dificultad auto: combates 1-7 DIFÍCIL, 8-15 MUY DIFÍCIL.
  personajes/rival2_01.png … rival2_15.png   (900×1350 px)
  fondos/fondo2_01.jpg … fondo2_15.jpg        (1920×1080 px)
  portada2.jpg           Fondo de la pantalla de ruta mientras juegas la Ruta Legendaria (1920×1080 px).
                         También sirve portada2.png o fondos/legendaria.jpg.
                         Si no existe, se usa portada.jpg teñida de carmesí.
  musica/legendaria.mp3  Canción de la pantalla de ruta en la Ruta Legendaria.
                         Si no existe, suena titulo.mp3.

RUTA ÉPICA (RUTA III)
  rivales3.txt           Los rivales de la Ruta III (mismo formato que rivales.txt).
                         Se desbloquea en cada partida al completar la Ruta Legendaria.
                         Dificultad ÉPICA fija: la CPU no comete errores, niega con más criterio,
                         busca el golpe letal y empieza con +3 corazones (más los del campo "corazones").
                         Campos extra (opcionales) de esta ruta:
                           mano  = 1   → el rival empieza con 1 carta extra en la mano
                           almas = 1   → el rival empieza con 1 alma activa (del tope de su BA)
                           robo  = 1   → el rival roba 1 carta extra de su BP cada turno
                         Sus barajas (r3_…) ignoran la banlist a propósito.
  personajes/rival3_01.png … rival3_10.png   (900×1350 px)
  fondos/fondo3_01.jpg … fondo3_10.jpg        (1920×1080 px)
                         Si un rival no tiene fondo, se usa un fondo rojo sangre automático.
  portada3.jpg           Fondo de la pantalla de ruta en la Ruta Épica (1920×1080 px).
                         También sirve portada3.png o fondos/epica.jpg.
                         Si no existe: fondo negro/sangre con latido, niebla roja y brasas rojas.
  musica/epica.mp3       Canción de la pantalla de ruta en la Ruta Épica.
                         Si no existe, suena legendaria.mp3 (o titulo.mp3).

RUTA CAÓTICA (RUTA IV)
  rivales4.txt           Los rivales de la Ruta IV (mismo formato que rivales.txt).
                         Se desbloquea en cada partida al completar la Ruta Épica.
                         Dificultad CAÓTICA fija: la CPU no comete errores, busca el golpe letal,
                         empieza con +3 corazones y además evita jugadas sin sentido
                         (no roba con la mano llena, no llama sin zona libre, no destruye sin objetivo…).
                         Sus barajas (r4_…) SÍ respetan la banlist.
  personajes/rival4_01.png … rival4_10.png   (900×1350 px)
  fondos/fondo4_01.jpg … fondo4_10.jpg        (1920×1080 px)
                         Si un rival no tiene fondo, se usa un fondo violeta/cian automático.
  portada4.jpg           Fondo de la pantalla de ruta en la Ruta Caótica (1920×1080 px).
                         También sirve portada4.png o fondos/caotica.jpg.
                         Si no existe: fondo de grietas violeta/cian con distorsión.
  musica/caotica.mp3     Canción de la pantalla de ruta en la Ruta Caótica.
                         Si no existe, suena epica.mp3.

RUTA HEROICA (RUTA V)
  rivales5.txt           Los 16 rivales de la Ruta V (mismo formato que rivales.txt).
                         Se desbloquea en cada partida al completar la Ruta Caótica.
                         REGLA HEROICA: tu baraja solo puede llevar 1 copia de cada carta en la BP y la B.SOP,
                         respetando la banlist (cartas-limitadas.json). La Baraja de Almas es la única excepción.
                         Antes de pelear, el LOBBY HEROICO revisa tu baraja (botón «🛡 LOBBY» en la pantalla de ruta).
                         Rivales en dificultad CAÓTICA; el jefe final usa la dificultad CREADOR.
                         Campos extra (opcionales) para jefes:
                           borrador = 2   → niega hasta 2 cartas, habilidades o llamados tuyos en el combate
                           revivir = 10   → la primera vez que llega a 0 corazones, regresa con 10
  personajes/rival5_01.png … rival5_16.png   (900×1350 px · el 16 es Yair Artz, el Creador)
  fondos/fondo5_01.jpg … fondo5_16.jpg        (1920×1080 px)
                         Si un rival no tiene fondo, se usa un fondo dorado de rayos automático.
  portada5.jpg           Fondo de la pantalla de ruta en la Ruta Heroica (1920×1080 px).
                         También sirve portada5.png o fondos/heroica.jpg.
                         Si no existe: fondo dorado con rayos de sol girando.
  musica/heroica.mp3     Canción de la pantalla de ruta y del lobby en la Ruta Heroica.
                         Si no existe, suena caotica.mp3 (o titulo.mp3).

CRÉDITOS
  Cada ruta tiene sus propios créditos: I = 5 · II = 5 · III = 3 · IV = 3 · V = 3.
  Al completar una ruta por primera vez, los créditos que te sobren (máx. 3) se suman como bonus
  a la siguiente ruta. Rutas Épica, Caótica y Heroica: al vencer al rival 5 ganas un SELLO; si después haces GAME OVER
  vuelves al combate 6 en lugar del 1.

JUGAR SIN CONEXIÓN (Arcade v2.7)
  El Arcade descarga al dispositivo la música de las rutas y de cada rival, las portadas, retratos,
  fondos y tus micas/playmats. Lo descargado se queda aunque actualices la app.
  · Las imágenes se descargan siempre que haya internet.
  · La música se descarga sola con Wi-Fi (no con datos móviles ni "ahorro de datos").
  · En 🎨 APARIENCIA → JUGAR SIN CONEXIÓN: ver el avance, "⬇ DESCARGAR TODO" y activar/desactivar la música automática.
  · Sonido de logro personalizado: assets/audio/sfx/logro.mp3 (si no existe, suena el de siempre).
