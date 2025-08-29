import React, { useEffect, useRef } from "react";

export const LimitlessVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    let time = 0;
    
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      ctx.clearRect(0, 0, width, height);

      // Animation parameters
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.15;
      const maxRadius = Math.min(width, height) * 0.25;
      
      // Animated offsets and scales
      const offset1X = Math.sin(time * 0.8) * 60 + Math.cos(time * 0.3) * 30;
      const offset1Y = Math.cos(time * 0.6) * 40 + Math.sin(time * 0.4) * 20;
      const offset2X = -Math.sin(time * 0.7) * 50 - Math.cos(time * 0.5) * 35;
      const offset2Y = -Math.cos(time * 0.9) * 45 - Math.sin(time * 0.2) * 25;
      
      const scale1 = 1 + Math.sin(time * 0.5) * 0.3;
      const scale2 = 1 + Math.cos(time * 0.4) * 0.25;
      
      // Create gradients for the blobs
      const gradient1 = ctx.createRadialGradient(
        centerX + offset1X, centerY + offset1Y, 0,
        centerX + offset1X, centerY + offset1Y, baseRadius * scale1
      );
      gradient1.addColorStop(0, "rgba(255, 215, 0, 0.8)"); // Gold center
      gradient1.addColorStop(0.4, "rgba(255, 165, 0, 0.6)"); // Orange mid
      gradient1.addColorStop(0.7, "rgba(255, 140, 0, 0.4)"); // Darker orange
      gradient1.addColorStop(1, "rgba(255, 215, 0, 0.1)"); // Transparent gold edge

      const gradient2 = ctx.createRadialGradient(
        centerX + offset2X, centerY + offset2Y, 0,
        centerX + offset2X, centerY + offset2Y, baseRadius * scale2
      );
      gradient2.addColorStop(0, "rgba(0, 255, 255, 0.8)"); // Cyan center
      gradient2.addColorStop(0.4, "rgba(64, 224, 208, 0.6)"); // Turquoise mid
      gradient2.addColorStop(0.7, "rgba(32, 178, 170, 0.4)"); // Darker teal
      gradient2.addColorStop(1, "rgba(0, 255, 255, 0.1)"); // Transparent cyan edge

      // Enable blending for intersection effect
      ctx.globalCompositeOperation = "screen";

      // Draw first blob (gold/yellow)
      ctx.beginPath();
      ctx.fillStyle = gradient1;
      ctx.arc(centerX + offset1X, centerY + offset1Y, baseRadius * scale1, 0, Math.PI * 2);
      ctx.fill();

      // Draw second blob (cyan/blue)
      ctx.beginPath();
      ctx.fillStyle = gradient2;
      ctx.arc(centerX + offset2X, centerY + offset2Y, baseRadius * scale2, 0, Math.PI * 2);
      ctx.fill();

      // Add extra glow effect
      ctx.globalCompositeOperation = "source-over";
      
      // Outer glow for blob 1
      const outerGlow1 = ctx.createRadialGradient(
        centerX + offset1X, centerY + offset1Y, baseRadius * scale1,
        centerX + offset1X, centerY + offset1Y, maxRadius * scale1
      );
      outerGlow1.addColorStop(0, "rgba(255, 215, 0, 0.2)");
      outerGlow1.addColorStop(1, "rgba(255, 215, 0, 0)");
      
      ctx.beginPath();
      ctx.fillStyle = outerGlow1;
      ctx.arc(centerX + offset1X, centerY + offset1Y, maxRadius * scale1, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow for blob 2
      const outerGlow2 = ctx.createRadialGradient(
        centerX + offset2X, centerY + offset2Y, baseRadius * scale2,
        centerX + offset2X, centerY + offset2Y, maxRadius * scale2
      );
      outerGlow2.addColorStop(0, "rgba(0, 255, 255, 0.2)");
      outerGlow2.addColorStop(1, "rgba(0, 255, 255, 0)");
      
      ctx.beginPath();
      ctx.fillStyle = outerGlow2;
      ctx.arc(centerX + offset2X, centerY + offset2Y, maxRadius * scale2, 0, Math.PI * 2);
      ctx.fill();

      // Add sparkle particles
      for (let i = 0; i < 20; i++) {
        const sparkleX = centerX + Math.sin(time * 2 + i) * (width * 0.3) + Math.cos(time + i * 0.5) * 50;
        const sparkleY = centerY + Math.cos(time * 1.5 + i) * (height * 0.3) + Math.sin(time * 0.8 + i * 0.3) * 40;
        const sparkleSize = (Math.sin(time * 3 + i * 2) + 1) * 1.5;
        const opacity = (Math.sin(time * 2.5 + i * 1.8) + 1) * 0.3;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
      }

      time += 0.02;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          filter: "blur(0.5px) brightness(1.1)",
          mixBlendMode: "screen"
        }}
      />
    </div>
  );
};