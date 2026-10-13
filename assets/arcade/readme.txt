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

CRÉDITOS
  Cada ruta tiene sus propios créditos: I = 5 · II = 5 · III = 3.
  Al completar una ruta por primera vez, los créditos que te sobren (máx. 3) se suman como bonus
  a la siguiente ruta. Ruta Épica: al vencer al rival 5 ganas un SELLO; si después haces GAME OVER
  vuelves al combate 6 en lugar del 1.
