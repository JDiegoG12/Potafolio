import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Arcade } from "@/components/sections/Arcade";
import { Certifications } from "@/components/sections/Certifications";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { ChillProjects } from "@/components/sections/ChillProjects";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

/**
 * Home: composición de las secciones (CLAUDE.md §3) en el orden del
 * spec, más la sala de juegos (Arcade) como cierre interactivo antes
 * del footer. Server component sin lógica; cada sección es un client
 * component que lee i18n y, si le toca, el tema activo.
 */
export default function Home() {
  return (
    <>
      <main id="main" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Hero />
        <About />
        <Certifications />
        <FeaturedProjects />
        <ChillProjects />
        <Contact />
        <Arcade />
      </main>
      <Footer />
    </>
  );
}
