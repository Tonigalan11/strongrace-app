# Strong Race · App de entrenos

App web para móvil (que acabará siendo una PWA) para seguir el plan de la Strong Race Mallorca (10 abr 2027).

## Estructura

```
strongrace_app/
├── index.html        → el esqueleto de la página
├── css/styles.css    → el aspecto (colores, tamaños, tarjetas)
├── js/app.js         → la lógica: carga el plan, decide qué pantalla toca y la pinta
├── data/plan.json    → EL PLAN. Para cambiar el entreno se cambia esto, no el código
└── img/              → fotos de los ejercicios (ver img/LEEME.txt)
```

## Probarla en el ordenador

1. Abre la carpeta en VS Code (`Archivo → Abrir carpeta`).
2. Instala la extensión **Live Server** (de Ritwick Dey).
3. Clic derecho en `index.html` → **Open with Live Server**.
4. Pulsa F12 → icono de móvil (Ctrl+Shift+M) para verla con tamaño de iPhone.

> Si abres `index.html` con doble clic no carga el plan: por seguridad, el navegador no deja
> que una página leída desde el disco (`file://`) lea otros archivos con `fetch`. Live Server
> crea un mini servidor (`http://127.0.0.1:5500`) y así sí funciona.

## Subirla a internet (GitHub Pages)

En la terminal de VS Code (`Ctrl+ñ`), dentro de la carpeta:

```powershell
git init
git add .
git commit -m "v0.1: semana y sesiones"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/strongrace-app.git
git push -u origin main
```

(Antes crea el repositorio vacío `strongrace-app` en github.com → New repository.)

Después, en GitHub: **Settings → Pages → Branch: main / (root) → Save**. En 1-2 minutos estará en
`https://TU_USUARIO.github.io/strongrace-app/`. Ábrelo en Safari en el iPhone.

## Qué has aprendido en la lección 1

| Concepto | Dónde |
|---|---|
| HTML, CSS y JS: cada uno hace una cosa | los tres archivos |
| Diseño mobile-first y variables CSS (`--acento`) | `styles.css` |
| `fetch` + `async/await` para leer un JSON | `init()` en `app.js` |
| Plantillas de texto con `` `${...}` `` para generar HTML | `renderSemana()` |
| `.map()`, `.filter()`, `.find()` sobre listas | `renderSemana()`, `renderSesion()` |
| Router con `#hash` (varias "pantallas" en una sola página) | `router()` |
| Guardar datos en el móvil con `localStorage` | `estaHecha()`, `cambiarHecha()` |

## Retos

1. **Fácil:** cambia `--acento` en `styles.css` por otro color.
2. **Medio:** en la tarjeta de cada sesión, muestra también la fecha de la semana. Pista: `fechaCorta(semana.inicio)`.
3. **Difícil:** añade en cada ejercicio un campo para apuntar los kg que has usado y guárdalo en `localStorage`.
   Pista: copia la idea de `estaHecha()` con una clave tipo `kg-SEMANA-SESION-EJERCICIO`.

## Próximas lecciones

- **L2:** modo entreno paso a paso con temporizador de descansos.
- **L3:** registro de cargas e historial.
- **L4:** PWA: icono en la pantalla de inicio y que funcione sin cobertura.
- **L5:** fotos propias de los ejercicios.
