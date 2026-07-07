import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Acceso al dev server desde otros dispositivos de la red local.
  // Next rechaza los patrones "*" y "**" a secas (no hay "permitir todo"
  // literal), así que se cubren todos los hosts con puntos: cualquier
  // IPv4 (*.*.*.*) y nombres de 2-3 segmentos. localhost ya está permitido.
  allowedDevOrigins: ["*.*", "*.*.*", "*.*.*.*"],
};

export default nextConfig;
