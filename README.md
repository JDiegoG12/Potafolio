# Portafolio — Diego Gomez

Portafolio personal de **Diego Gomez** (Desarrollador con IA): una SPA construida con Next.js cuya pieza central es un sistema de **3 mundos intercambiables** que transforman por completo la identidad visual del sitio — no solo los colores, sino tipografía, texturas, movimiento, cursor, sonido y hasta la foto del autor.

> *Building the future, one prompt at a time.*

## ✨ Los 3 mundos

| Mundo | Esencia |
|---|---|
| 🌤️ **Teyvat** | Aventura y magia elemental: dorados, cielos suaves, partículas flotantes, serif épica |
| 🏋️ **Gym** | Fuerza y disciplina: negro carbón, rojo energético, tipografía brutal, impactos secos |
| 🖥️ **Cyber** | Alta tecnología: neón cyan/magenta, grid en perspectiva, glitch, HUD |

- **Theme-switcher de portales**: 3 mini-escenas vivas en el navbar (tarjetas grandes en móvil) con preview al hover; al elegir mundo, un **radial reveal** se expande desde el portal pulsado trayendo la textura del mundo entrante (View Transitions API + WAAPI).
- **Cada mundo re-skinea todo**: paleta, fuentes, radios, sombras, cursor custom, preloader, efectos de los títulos, botones, fondos animados, sonidos y reveal on scroll.
- **Idioma ES/EN** con toggle propio (react-i18next); tema e idioma persisten en `localStorage`.
- **Sonido por mundo** sintetizado con Web Audio (opt-in, toggle de mute flotante).
- Accesibilidad cuidada: `prefers-reduced-motion` respetado en todo, foco visible por teclado, skip-link, contraste AA.

## 📸 Capturas

<!-- TODO: añadir capturas/GIFs de los 3 mundos y de la transición -->

## 🛠️ Stack

- [Next.js](https://nextjs.org/) (App Router) + **TypeScript**
- [Tailwind CSS v4](https://tailwindcss.com/) — theming vía CSS variables + `data-theme`
- [Framer Motion](https://www.framer.com/motion/) — animaciones, reveals y layout animations
- [react-i18next](https://react.i18next.com/) — internacionalización ES/EN
- [Lenis](https://lenis.darkroom.engineering/) — smooth scroll
- **Web Audio API** — sonidos por tema sintetizados (cero assets de audio)
- [lucide-react](https://lucide.dev/) — iconografía

## 🚀 Correr localmente

Requiere Node.js 18.18+ (recomendado 20+).

```bash
# instalar dependencias
npm install

# desarrollo (http://localhost:3000)
npm run dev

# build de producción + servir
npm run build
npm start
```

## 📁 Estructura

```
/app                 # App Router: layout raíz (providers, fuentes) y página
/components
  /layout            # Navbar, theme-switcher de portales, menú móvil, toggles
  /sections          # Hero, About, FeaturedProjects, ChillProjects, Contact, Footer
  /ui                # Botón temático, título con efecto firma, cards, iconos
  /effects           # Cursor, preloader, transición de tema, fondos, reveal, scroll
/context             # ThemeProvider (mundos + transición), I18nProvider, AudioProvider
/lib                 # Tokens de temas, i18n, motor de audio, hooks
/data                # portfolio.ts — datos centralizados (proyectos, autor, contacto)
/locales             # es.json · en.json
/styles              # Tokens CSS por tema y hojas de efectos
/public/images       # Fotos del autor (una por mundo) e imágenes de proyectos
```

## 📄 Licencia

El **código** de este proyecto se distribuye bajo la licencia [MIT](./LICENSE).

**Excepción — contenido personal:** las fotos, textos, branding, identidad visual y datos personales de Diego Gomez que aparecen en este repositorio y en el sitio **quedan reservados** y **no** se concede permiso para reutilizarlos, con o sin modificación. Si haces fork del código, reemplaza el contenido personal por el tuyo.
