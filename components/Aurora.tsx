"use client";

import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useEffect, useRef, useState } from "react";
import "./Aurora.css";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uLightMode;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  if (uLightMode > 0.5) {
    float energy = clamp(max(intensity, 0.0), 0.0, 1.0);
    float coverage = clamp(auroraAlpha * (0.55 + 0.45 * energy), 0.0, 0.86);
    vec3 chroma = pow(clamp(rampColor, 0.0, 1.0), vec3(1.2));
    float chromaPeak = max(chroma.r, max(chroma.g, chroma.b));
    chroma /= max(chromaPeak, 0.0001);
    fragColor = vec4(mix(vec3(1.0), chroma, min(coverage * 1.08, 0.94)), 1.0);
  } else {
    fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
  }
}
`;


type AuroraProps = {
  colorStops?: [string, string, string];
  blend?: number;
  amplitude?: number;
  speed?: number;
};

export default function Aurora({
  colorStops = ["#7cff67", "#B497CF", "#5227FF"],
  blend = 0.5,
  amplitude = 1,
  speed = 1,
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const syncMotionRef = useRef<(() => void) | null>(null);
  const [first, second, third] = colorStops;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const canvas = document.createElement("canvas");
    // Keep the CSS aurora visible if this device cannot render the shader.
    if (!canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true })) return;
    const renderer = new Renderer({
      canvas, webgl: 2, alpha: true, premultipliedAlpha: true,
      antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT, fragment: FRAG, depthTest: false, depthWrite: false,
      uniforms: {
        uTime: { value: 4 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: [first, second, third].map(hex => Array.from(new Color(hex))) },
        uResolution: { value: [1, 1] },
        uBlend: { value: Math.max(0.001, blend) },
        uLightMode: { value: 0 },
      },
    });
    if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
      program.remove(); geometry.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }
    const mesh = new Mesh(gl, { geometry, program });
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    let lost = false;
    let frame = 0;
    let previous = 0;
    let elapsed = 4;
    const draw = () => renderer.render({ scene: mesh });
    const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
    const tick = (now: number) => {
      if (previous) elapsed += Math.min(now - previous, 50) * 0.001 * speed;
      previous = now;
      program.uniforms.uTime.value = elapsed;
      draw();
      frame = requestAnimationFrame(tick);
    };
    const syncMotion = () => {
      stop();
      if (!pausedRef.current && !preference.matches && visible && !document.hidden && !lost) frame = requestAnimationFrame(tick);
    };
    syncMotionRef.current = syncMotion;
    const resize = () => {
      if (lost) return;
      renderer.setSize(Math.max(1, container.clientWidth), Math.max(1, container.clientHeight));
      program.uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
      draw();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault(); lost = true; stop(); canvas.style.opacity = "0";
    };
    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncMotion(); });
    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    preference.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncMotion);
    canvas.addEventListener("webglcontextlost", onContextLost);
    // Recreate resources on remount; keep the static fallback after context loss.
    resize(); syncMotion();

    return () => {
      syncMotionRef.current = null;
      stop(); resizeObserver.disconnect(); visibilityObserver.disconnect();
      preference.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      program.remove(); geometry.remove(); canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [first, second, third, amplitude, blend, speed]);

  useEffect(() => {
    pausedRef.current = paused;
    syncMotionRef.current?.();
  }, [paused]);

  return (
    <div className="aurora-container">
      <div className="aurora-canvas" ref={containerRef} aria-hidden="true" />
      <button className="aurora-pause" type="button" aria-pressed={paused} aria-label={paused ? "Reprendre l’animation du fond" : "Mettre l’animation du fond en pause"} onClick={() => setPaused(value => !value)}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          {paused ? <path d="m6 3 11 7-11 7Z" /> : <path d="M5 3h3v14H5zm7 0h3v14h-3z" />}
        </svg>
      </button>
    </div>
  );
}
