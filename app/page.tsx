import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { ChillProjects } from "@/components/sections/ChillProjects";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

/**
 * Home: composición de las 6 secciones (CLAUDE.md §3) en el orden del
 * spec. Server component sin lógica; cada sección es un client
 * component que lee i18n y, si le toca, el tema activo.
 */
export default function Home() {
  return (
    <>
      <main id="main" className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Hero />
        <About />
        <FeaturedProjects />
        <ChillProjects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
