import { useEffect, useRef } from "react";

const SWING_AUDIO_PATH = "/assets/audio/saber-swing.mp3";

/** Doit rester identique a l'URL utilisee par #mouse-saber dans base.css. */
const SABER_IMAGE_SRC = "https://assets.codepen.io/28337/anakin-skywalker-hor.svg";

const useSaberEffects = () => {
  const saberRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canHover || !hasFinePointer) {
      return;
    }

    /**
     * Le curseur systeme n'est masque qu'une fois l'image du sabre
     * effectivement chargee. Sans ce garde-fou, un bloqueur de contenu
     * ou une panne du CDN laissait le visiteur sans aucun curseur : le
     * site devenait litteralement impossible a utiliser.
     */
    const saberImage = new Image();
    const markSaberReady = () => document.documentElement.classList.add("saber-ready");
    saberImage.addEventListener("load", markSaberReady);
    saberImage.src = SABER_IMAGE_SRC;

    let audioContext: AudioContext | null = null;
    let noiseBuffer: AudioBuffer | null = null;
    let saberAudioReady = false;
    const baseSwingAudio = new Audio(SWING_AUDIO_PATH);
    baseSwingAudio.preload = "auto";
    baseSwingAudio.load();
    const activeClips = new Set<HTMLAudioElement>();
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    const onCanPlay = () => {
      saberAudioReady = true;
    };

    const onAudioError = () => {
      saberAudioReady = false;
    };

    baseSwingAudio.addEventListener("canplaythrough", onCanPlay);
    baseSwingAudio.addEventListener("error", onAudioError);

    const ensureAudioContext = () => {
      if (!audioContext) {
        const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return null;
        audioContext = new Ctor();
      }

      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }

      return audioContext;
    };

    const getNoiseBuffer = (ctx: AudioContext) => {
      if (noiseBuffer) return noiseBuffer;
      const duration = 0.22;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < channel.length; i += 1) {
        channel[i] = (Math.random() * 2 - 1) * 0.6;
      }
      noiseBuffer = buffer;
      return buffer;
    };

    const playFallbackSwing = () => {
      const ctx = ensureAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const whoosh = ctx.createOscillator();
      const whooshGain = ctx.createGain();
      whoosh.type = "sawtooth";
      whoosh.frequency.setValueAtTime(640, now);
      whoosh.frequency.exponentialRampToValueAtTime(130, now + 0.16);
      whooshGain.gain.setValueAtTime(0.0001, now);
      whooshGain.gain.exponentialRampToValueAtTime(0.18, now + 0.012);
      whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      whoosh.connect(whooshGain).connect(ctx.destination);
      whoosh.start(now);
      whoosh.stop(now + 0.22);

      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 0.16);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.1, now + 0.015);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      noise.connect(filter).connect(noiseGain).connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.2);
    };

    const playMp3Swing = () => {
      const clip = baseSwingAudio.cloneNode() as HTMLAudioElement;
      clip.currentTime = 0;
      clip.volume = 0.95;
      activeClips.add(clip);

      void clip.play().catch(() => {
        activeClips.delete(clip);
        playFallbackSwing();
      });

      clip.addEventListener(
        "ended",
        () => {
          activeClips.delete(clip);
        },
        { once: true }
      );
    };

    const playSwing = () => {
      if (saberAudioReady) {
        playMp3Swing();
        return;
      }
      playFallbackSwing();
    };

    const createSparks = (x: number, y: number) => {
      if (reducedMotion) return;
      const count = 10 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i += 1) {
        const spark = document.createElement("span");
        spark.className = "saber-spark";
        const angle = Math.random() * Math.PI * 2;
        const distance = 18 + Math.random() * 24;
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
        spark.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
        document.body.appendChild(spark);
        spark.addEventListener("animationend", () => spark.remove(), { once: true });
      }
    };

    const moveSaber = (x: number, y: number) => {
      const saber = saberRef.current;
      if (!saber) return;
      lastX = x;
      lastY = y;
      saber.style.left = `${x}px`;
      saber.style.top = `${y}px`;
      saber.classList.add("is-visible");
    };

    const onPointerMove = (event: PointerEvent) => {
      moveSaber(event.clientX, event.clientY);
    };

    const onPointerDown = (event: PointerEvent) => {
      const saber = saberRef.current;
      if (!saber) return;

      moveSaber(event.clientX, event.clientY);
      saber.classList.remove("swing");
      void saber.offsetWidth;
      saber.classList.add("swing");

      // Trigger sound exactly on pointer down to keep sync with the swing animation.
      playSwing();
      createSparks(event.clientX, event.clientY);
    };

    const onWindowBlur = () => {
      const saber = saberRef.current;
      if (!saber) return;
      saber.style.left = `${lastX}px`;
      saber.style.top = `${lastY}px`;
      saber.classList.add("is-visible");
    };

    const onMouseLeave = () => {
      saberRef.current?.classList.remove("is-visible");
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("blur", onWindowBlur);
      saberImage.removeEventListener("load", markSaberReady);
      document.documentElement.classList.remove("saber-ready");
      baseSwingAudio.pause();
      baseSwingAudio.removeEventListener("canplaythrough", onCanPlay);
      baseSwingAudio.removeEventListener("error", onAudioError);
      activeClips.forEach((clip) => clip.pause());
      activeClips.clear();
      if (audioContext && audioContext.state !== "closed") {
        void audioContext.close();
      }
    };
  }, []);

  return { saberRef };
};

export default useSaberEffects;

