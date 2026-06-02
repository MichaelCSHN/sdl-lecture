import { useRef, useEffect } from 'react';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform float time;
  varying vec2 vUv;

  #define ITERATIONS 4
  #define SPEED 0.003
  #define FREQ 8.0
  #define AMP 0.05
  #define LINES 5.0
  #define THICKNESS 0.05

  float sine(float x, float t) {
    return sin(x * FREQ + t) * AMP;
  }

  float line(float y, float x, float t, float o) {
    float s = sine(x + o, t);
    float s2 = sine(x + o * 1.5, t + o) * 0.5;
    float lw = pow(THICKNESS, y - s - s2 + 0.3);
    float gl = pow(THICKNESS, abs(y - s) * 4.0);
    return max(lw, gl * 0.5);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    float t = time * SPEED;
    vec3 baseColor = vec3(0.00, 0.03, 0.05);
    vec3 col = baseColor;

    vec3 colors[3];
    colors[0] = vec3(0.0, 0.96, 0.83);
    colors[1] = vec3(0.2, 0.6, 1.0);
    colors[2] = vec3(0.99, 0.89, 0.25);

    for(float i = 0.0; i < LINES; i += 1.0) {
      float cIdx = mod(i, 3.0);
      float o = (i / LINES) * 6.2831;
      float yOff = (i / (LINES - 1.0)) * 0.5 - 0.25;
      float li = line(uv.y - yOff, uv.x, t, o);
      vec3 lc = colors[int(cIdx)];
      if (cIdx == 0.0) {
        lc = colors[0];
      }
      col += lc * li;
    }

    float scan = smoothstep(0.0, 0.5, uv.y) * smoothstep(1.0, 0.5, uv.y);
    col *= scan * 1.5;

    col += vec3(hash(uv * time) * 0.08);

    gl_FragColor = vec4(col, 0.9);
  }
`;

export default function SinePlotShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationId: number;

    const init = async () => {
      const THREE = await import('three');

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          time: { value: 0 },
        },
        transparent: true,
      });

      const geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const startTime = performance.now();

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        material.uniforms.time.value = performance.now() - startTime;
        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!canvas || !renderer) return;
        const parent = canvas.parentElement;
        if (!parent) return;
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        canvas.width = w;
        canvas.height = h;
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        renderer.dispose();
      };
    };

    const cleanup = init();

    return () => {
      cleanup.then((fn) => fn?.());
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
