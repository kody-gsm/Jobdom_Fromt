import { useEffect, useState } from "react";

export type HomeStage = "hero" | "hero-exit" | "services";

const HERO_ANIMATION_MS = 1200;
const HERO_HOLD_MS = 1000;
const HERO_EXIT_MS = 600;

export const useHomeStage = () => {
  const [stage, setStage] = useState<HomeStage>("hero");
  const [isHeroVisible, setIsHeroVisible] = useState(false);

  useEffect(() => {
    const entranceFrame = window.requestAnimationFrame(() => {
      setIsHeroVisible(true);
    });

    const exitTimer = window.setTimeout(() => {
      setStage("hero-exit");
    }, HERO_ANIMATION_MS + HERO_HOLD_MS);

    const servicesTimer = window.setTimeout(() => {
      setStage("services");
    }, HERO_ANIMATION_MS + HERO_HOLD_MS + HERO_EXIT_MS);

    return () => {
      window.cancelAnimationFrame(entranceFrame);
      window.clearTimeout(exitTimer);
      window.clearTimeout(servicesTimer);
    };
  }, []);

  return {
    stage,
    isHeroVisible,
    isServicesStage: stage === "services",
  };
};
