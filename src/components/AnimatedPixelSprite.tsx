import React, { useState, useEffect } from 'react';

interface AnimatedPixelSpriteProps {
  frames?: string[][];
  matrix?: string[];
  fps?: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  pixelSizeClass?: string;
}

export const AnimatedPixelSprite: React.FC<AnimatedPixelSpriteProps> = ({
  frames,
  matrix,
  fps = 4,
  className = '',
  size = 'md',
  pixelSizeClass,
}) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  const effectiveFrames = frames && frames.length > 0 ? frames : matrix ? [matrix] : [];

  useEffect(() => {
    if (effectiveFrames.length <= 1) return;

    const intervalMs = Math.max(50, Math.floor(1000 / (fps || 4)));
    const timer = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % effectiveFrames.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [effectiveFrames.length, fps]);

  const activeFrame = effectiveFrames[currentFrameIndex] || effectiveFrames[0];

  if (!activeFrame || activeFrame.length === 0) {
    return <span className="text-xl">✨</span>;
  }

  // Determine container dimensions based on size prop
  let containerSize = 'w-10 h-10';
  if (size === 'xs') containerSize = 'w-5 h-5';
  if (size === 'sm') containerSize = 'w-8 h-8';
  if (size === 'md') containerSize = 'w-12 h-12';
  if (size === 'lg') containerSize = 'w-16 h-16';
  if (size === 'xl') containerSize = 'w-24 h-24';

  return (
    <div
      className={`grid grid-cols-8 rounded-lg overflow-hidden bg-gray-950 p-0.5 select-none shadow-sm ${containerSize} ${className}`}
      title={effectiveFrames.length > 1 ? `Sprite animado (${effectiveFrames.length} quadros a ${fps} FPS)` : 'Pixel Art 8x8'}
    >
      {activeFrame.map((color, cellIdx) => (
        <div
          key={cellIdx}
          style={{ backgroundColor: color && color !== 'transparent' ? color : 'transparent' }}
          className={`w-full h-full ${pixelSizeClass || ''}`}
        />
      ))}
    </div>
  );
};
