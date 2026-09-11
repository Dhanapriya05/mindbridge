import React, { useEffect, useMemo, useRef } from 'react';
import { Rocket, Sparkles } from 'lucide-react';

const STAR_COUNT = 34;

export const GalaxyDecor = () => {
  const sceneRef = useRef(null);
  const stars = useMemo(() => Array.from({ length: STAR_COUNT }, (_, index) => ({
    id: index,
    left: `${(index * 29) % 97}%`,
    top: `${(index * 47) % 92}%`,
    size: `${2 + (index % 3)}px`,
    delay: `${-((index * 1.7) % 9)}s`,
    duration: `${5 + (index % 5)}s`,
    depth: index % 3
  })), []);

  useEffect(() => {
    let frameId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const moveScene = (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const render = () => {
      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;
      if (sceneRef.current) {
        sceneRef.current.style.setProperty('--parallax-x', `${currentX}px`);
        sceneRef.current.style.setProperty('--parallax-y', `${currentY}px`);
        sceneRef.current.style.setProperty('--astronaut-tilt', `${currentX * 2.2}deg`);
      }
      frameId = requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', moveScene, { passive: true });
    frameId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('pointermove', moveScene);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div ref={sceneRef} className="galaxy-decor" aria-hidden="true">
      <div className="galaxy-nebula galaxy-nebula-back" />
      <div className="galaxy-nebula galaxy-nebula-front" />
      <div className="galaxy-dust" />
      <div className="galaxy-star-layer galaxy-star-layer-back">
        {stars.map((star) => <span key={star.id} className="galaxy-star" style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay, animationDuration: star.duration }} />)}
      </div>
      <div className="shooting-star" />
      <div className="galaxy-planet galaxy-planet-one" title="A calm little planet" />
      <div className="galaxy-planet galaxy-planet-two" title="A drifting pink planet" />
      <div className="galaxy-planet galaxy-planet-three" title="A ringed planet"><span /></div>
      <div className="galaxy-planet galaxy-planet-four" title="A tiny orbiting planet"><i /><i /><i /></div>
      <div className="galaxy-astronaut">
        <span className="astronaut-glow" />
        <span className="astronaut-backpack" />
        <Rocket className="astronaut-body" />
        <span className="astronaut-reflection" />
        <Sparkles className="astronaut-star" />
      </div>
    </div>
  );
};