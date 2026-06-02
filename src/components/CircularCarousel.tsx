import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';

const IMAGES = [
  { src: '/assets/hero-robot-arm.jpg', label: 'Robotic Arm', desc: '高精度机械臂执行样品抓取与传送' },
  { src: '/assets/reaction-glow.jpg', label: 'Synthesis', desc: '自动化合成炉内的化学反应过程' },
  { src: '/assets/lab-corridor.jpg', label: 'A-Lab Facility', desc: 'A-Lab自动化实验设施内部走廊' },
  { src: '/assets/data-network.jpg', label: 'Data Network', desc: 'AI驱动的材料数据网络与关联分析' },
  { src: '/assets/xrd-pattern.jpg', label: 'XRD Analysis', desc: 'X射线衍射图谱 — 材料结构验证' },
  { src: '/assets/scientist-touch.jpg', label: 'Human-AI', desc: '科学家与AI系统的交互界面' },
  { src: '/assets/hero-robot-arm.jpg', label: 'Processing', desc: '高通量样品处理流水线' },
  { src: '/assets/reaction-glow.jpg', label: 'Discovery', desc: '新材料发现的荧光标记验证' },
];

const RADIUS = 280;

export default function CircularCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollTargetRef = useRef(0);
  const currentAngleRef = useRef(0);

  const positionImages = useCallback(() => {
    if (!carouselRef.current) return;
    const images = carouselRef.current.querySelectorAll<HTMLDivElement>('.carousel-item');
    images.forEach((img, i) => {
      const angle = i * 360 / IMAGES.length;
      const angleRad = angle * Math.PI / 180;
      const x = RADIUS * Math.cos(angleRad);
      const y = RADIUS * Math.sin(angleRad);
      const rotationAngle = -angle;
      gsap.set(img, { x, y, rotation: rotationAngle });
    });
  }, []);

  useEffect(() => {
    positionImages();

    const handleWheel = (e: WheelEvent) => {
      if (!carouselRef.current) return;
      scrollTargetRef.current += e.deltaY * 0.002;
      const currentAngle = -(scrollTargetRef.current * 0.4);
      currentAngleRef.current = currentAngle;
      gsap.to(carouselRef.current, {
        rotation: currentAngle,
        duration: 0.5,
        ease: 'power2.out',
      });
      const normalizedAngle = ((currentAngle % 360) + 360) % 360;
      const idx = Math.round(normalizedAngle / (360 / IMAGES.length)) % IMAGES.length;
      setCurrentIndex(idx);
    };

    const el = carouselRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: true });
    }

    return () => {
      if (el) {
        el.removeEventListener('wheel', handleWheel);
      }
    };
  }, [positionImages]);

  return (
    <div className="flex flex-col lg:flex-row items-center gap-12">
      {/* Carousel */}
      <div className="relative w-[400px] h-[400px] flex-shrink-0">
        <div
          ref={carouselRef}
          className="absolute inset-0"
          style={{ transformOrigin: 'center center' }}
        >
          {IMAGES.map((img, i) => (
            <div
              key={i}
              className="carousel-item absolute w-[120px] h-[90px] left-1/2 top-1/2 -ml-[60px] -mt-[45px] cursor-pointer"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent 5%, black 40%, black 60%, transparent 95%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 5%, black 40%, black 60%, transparent 95%)',
                filter: 'brightness(0.8) contrast(1.2)',
              }}
            >
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover rounded border border-[rgba(67,97,238,0.2)]"
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#8a92a3] whitespace-nowrap font-mono">
                {img.label}
              </div>
            </div>
          ))}
        </div>
        {/* Center info panel */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="glass-panel p-4 w-[180px] text-center">
            <div className="text-[#00f5d4] font-mono text-xs mb-1">STEP {currentIndex + 1}/{IMAGES.length}</div>
            <div className="text-[#d0d4dc] font-mono text-sm font-medium">{IMAGES[currentIndex].label}</div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="flex-1 max-w-md">
        <div className="glass-panel p-6 transition-all duration-300">
          <div className="text-[#00f5d4] font-mono text-xs mb-3 tracking-wider">
            A-LAB CASE STUDY
          </div>
          <h3 className="text-2xl font-semibold mb-3 font-mono" style={{ color: '#d0d4dc' }}>
            {IMAGES[currentIndex].label}
          </h3>
          <p className="text-[#8a92a3] leading-relaxed mb-4">
            {IMAGES[currentIndex].desc}
          </p>
          <div className="flex items-center gap-3 text-xs text-[#8a92a3] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-pulse" />
            <span>Automated Pipeline Active</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 flex gap-2">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                scrollTargetRef.current = i * (360 / IMAGES.length) / 0.4;
                const currentAngle = -(scrollTargetRef.current * 0.4);
                if (carouselRef.current) {
                  gsap.to(carouselRef.current, {
                    rotation: currentAngle,
                    duration: 0.5,
                    ease: 'power2.out',
                  });
                }
                setCurrentIndex(i);
              }}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-[#00f5d4]' : 'bg-[rgba(67,97,238,0.2)]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
