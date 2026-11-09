"use client";
import { useEffect, useRef } from "react";

/**
 * Subtle 3D object behind the hero portrait: a slowly turning sphere of
 * points with one orbit ring — "ideas in motion". Three.js is loaded only
 * after the page is interactive, rendering pauses when off-screen or when
 * the tab is hidden, phones get a static drawing instead of WebGL, and
 * reduced-motion visitors see a single still frame.
 */
export function HeroScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    // Phones and tablets get the static outline drawn in CSS instead of WebGL:
    // same identity, no 3D download, no GPU work, better battery and speed.
    const phone = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
    if (phone) return;

    const start = async () => {
      // WebGL availability check before downloading three.js
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;

      const THREE = await import("three");
      if (disposed) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const count = 1600;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 7.2);

      const group = new THREE.Group();
      group.rotation.set(0.35, 0, -0.18);
      scene.add(group);

      // Fibonacci sphere — evenly spread points
      const positions = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = golden * i;
        const jitter = 1 + (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.035;
        positions[i * 3] = Math.cos(theta) * r * 2 * jitter;
        positions[i * 3 + 1] = y * 2 * jitter;
        positions[i * 3 + 2] = Math.sin(theta) * r * 2 * jitter;
        sizes[i] = 0.6 + ((i * 7919) % 100) / 100;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

      const color = new THREE.Color();
      const readAccent = () => {
        const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
        color.set(v || "#2a36d4");
      };
      readAccent();

      const pointsMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uColor: { value: color },
          uScale: { value: renderer.getPixelRatio() * 2.6 },
        },
        vertexShader: `
          attribute float size;
          uniform float uScale;
          varying float vDepth;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vDepth = smoothstep(-9.0, -5.0, mv.z);
            gl_PointSize = size * uScale * (6.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform vec3 uColor;
          varying float vDepth;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.1, d) * mix(0.18, 0.95, vDepth);
            gl_FragColor = vec4(uColor, a);
          }`,
      });
      const points = new THREE.Points(geo, pointsMat);
      group.add(points);

      // Orbit ring
      const ringGeo = new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 181 }, (_, i) => {
          const a = (i / 180) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(a) * 2.75, 0, Math.sin(a) * 2.75);
        }),
      );
      const ringMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 });
      const ring = new THREE.Line(ringGeo, ringMat);
      ring.rotation.set(1.15, 0.2, 0.35);
      scene.add(ring);

      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      // Theme changes re-read the accent colour
      const mo = new MutationObserver(() => {
        readAccent();
        ringMat.color.copy(color);
        if (reduce) renderer.render(scene, camera);
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

      // Pointer influence (desktop only)
      const target = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        target.x = (e.clientX / window.innerWidth - 0.5) * 0.5;
        target.y = (e.clientY / window.innerHeight - 0.5) * 0.3;
      };
      if (!reduce) window.addEventListener("pointermove", onPointer, { passive: true });

      let visible = true;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduce) loop();
      });
      io.observe(el);

      let raf = 0;
      let last = performance.now();
      const loop = () => {
        cancelAnimationFrame(raf);
        if (!visible || document.hidden) return;
        raf = requestAnimationFrame((now) => {
          const dt = Math.min((now - last) / 1000, 0.05);
          last = now;
          group.rotation.y += dt * 0.08;
          group.rotation.x += (0.35 + target.y - group.rotation.x) * 0.03;
          group.rotation.z += (-0.18 + target.x * 0.4 - group.rotation.z) * 0.03;
          ring.rotation.z += dt * 0.03;
          renderer.render(scene, camera);
          loop();
        });
      };
      const onVis = () => {
        last = performance.now();
        if (!reduce) loop();
      };
      document.addEventListener("visibilitychange", onVis);

      renderer.render(scene, camera);
      renderer.domElement.dataset.ready = "true";
      if (!reduce) loop();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        mo.disconnect();
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVis);
        geo.dispose();
        ringGeo.dispose();
        pointsMat.dispose();
        ringMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    // Wait until the browser is idle so the 3D never competes with first paint.
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const kick = () => void start();
    const usesIdle = typeof w.requestIdleCallback === "function";
    const idle = usesIdle ? w.requestIdleCallback!(kick, { timeout: 1500 }) : window.setTimeout(kick, 400);

    return () => {
      disposed = true;
      if (usesIdle) {
        (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idle);
      } else {
        window.clearTimeout(idle);
      }
      cleanup?.();
    };
  }, []);

  return (
    <div ref={host} className="hero__scene" aria-hidden="true">
      {/* Static stand-in, shown until WebGL is ready and on phones */}
      <svg className="hero__scene-static" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
        <circle cx="200" cy="200" r="150" fill="none" strokeWidth="1" strokeDasharray="1 7" strokeLinecap="round" />
        <ellipse cx="200" cy="200" rx="196" ry="70" transform="rotate(-24 200 200)" fill="none" strokeWidth="1" />
        <ellipse cx="200" cy="200" rx="150" ry="52" transform="rotate(62 200 200)" fill="none" strokeWidth="0.6" opacity="0.6" />
      </svg>
    </div>
  );
}
