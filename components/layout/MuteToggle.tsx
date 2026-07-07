"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAudio } from "@/context/AudioProvider";

/**
 * Toggle de mute flotante, siempre accesible (CLAUDE.md §6): botón fijo
 * abajo-derecha, compacto para no colisionar con futuros elementos de
 * esa esquina. `muted` viene del store externo del AudioProvider: SSR
 * pinta el default (muteado) y el valor guardado llega tras hidratar.
 */
export function MuteToggle() {
  const { muted, toggleMute } = useAudio();
  const { t } = useTranslation();
  const isMuted = muted;

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-pressed={!isMuted}
      aria-label={isMuted ? t("sound.unmute") : t("sound.mute")}
      title={isMuted ? t("sound.unmute") : t("sound.mute")}
      data-cursor-hover
      className="fixed right-4 bottom-4 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full border border-border text-text-muted shadow-card transition-colors hover:text-accent-ink focus-visible:text-accent-ink"
      style={{
        background: "color-mix(in srgb, var(--surface-solid) 88%, transparent)",
        backdropFilter: "blur(8px)",
      }}
    >
      {isMuted ? (
        <VolumeX size={18} aria-hidden />
      ) : (
        <Volume2 size={18} aria-hidden />
      )}
    </button>
  );
}
