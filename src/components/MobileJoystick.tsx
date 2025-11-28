import { useRef, useState, useEffect } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
}

export default function MobileJoystick({ onMove }: JoystickProps) {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !joystickRef.current) return;
      
      e.preventDefault();
      const touch = e.touches[0];
      const rect = joystickRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      let deltaX = touch.clientX - centerX;
      let deltaY = touch.clientY - centerY;
      
      const maxDistance = 50;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
      }
      
      setPosition({ x: deltaX, y: deltaY });
      onMove(deltaX / maxDistance, deltaY / maxDistance);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setPosition({ x: 0, y: 0 });
      onMove(0, 0);
    };

    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, onMove]);

  return (
    <div className="fixed bottom-24 left-8 z-50">
      <div
        ref={joystickRef}
        className="relative w-32 h-32 bg-white/30 backdrop-blur rounded-full border-4 border-white/50"
        onTouchStart={() => setIsDragging(true)}
      >
        <div
          className="absolute w-12 h-12 bg-primary rounded-full shadow-lg transition-transform"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          }}
        />
      </div>
    </div>
  );
}
