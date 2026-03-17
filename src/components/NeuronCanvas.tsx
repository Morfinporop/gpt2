import { useRef, useEffect } from 'react';

interface DisplayNeuron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  brightness: number;
  connections: number[];
}

export default function NeuronCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const neuronsRef = useRef<DisplayNeuron[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Размер канваса
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNeurons(canvas.width, canvas.height);
    };

    // Инициализация нейронов
    const initNeurons = (width: number, height: number) => {
      const count = 60;
      const neurons: DisplayNeuron[] = [];

      for (let i = 0; i < count; i++) {
        const connections: number[] = [];
        // Каждый нейрон связан с 2-4 другими
        const connCount = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < connCount; j++) {
          connections.push(Math.floor(Math.random() * count));
        }

        neurons.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 2 + Math.random() * 3,
          brightness: 0.2 + Math.random() * 0.3,
          connections
        });
      }

      neuronsRef.current = neurons;
    };

    // Отслеживание мыши
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Анимация
    const animate = () => {
      const neurons = neuronsRef.current;
      const { width, height } = canvas;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Обновление и отрисовка нейронов
      neurons.forEach((neuron, i) => {
        // Притяжение к мыши
        const dx = mx - neuron.x;
        const dy = my - neuron.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200 && dist > 0) {
          neuron.vx += (dx / dist) * 0.02;
          neuron.vy += (dy / dist) * 0.02;
          neuron.brightness = Math.min(1, neuron.brightness + 0.05);
        } else {
          neuron.brightness *= 0.98;
          neuron.brightness = Math.max(0.15, neuron.brightness);
        }

        // Движение
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;

        // Затухание скорости
        neuron.vx *= 0.99;
        neuron.vy *= 0.99;

        // Границы
        if (neuron.x < 0 || neuron.x > width) neuron.vx *= -1;
        if (neuron.y < 0 || neuron.y > height) neuron.vy *= -1;
        neuron.x = Math.max(0, Math.min(width, neuron.x));
        neuron.y = Math.max(0, Math.min(height, neuron.y));

        // Связи
        neuron.connections.forEach(connIdx => {
          if (connIdx >= neurons.length || connIdx === i) return;
          const other = neurons[connIdx];
          const cdx = other.x - neuron.x;
          const cdy = other.y - neuron.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < 200) {
            const alpha = (1 - cdist / 200) * 0.3 * neuron.brightness;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(neuron.x, neuron.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });

        // Нейрон
        const glow = neuron.brightness * 20;
        const gradient = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, neuron.radius + glow
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${neuron.brightness})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${neuron.brightness * 0.3})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, neuron.radius + glow, 0, Math.PI * 2);
        ctx.fill();

        // Ядро
        ctx.fillStyle = `rgba(255, 255, 255, ${neuron.brightness + 0.2})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouse);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
    />
  );
}
