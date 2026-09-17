"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

type Detail = "low" | "medium" | "high";

type GradientWavesProps = {
  horizonColor?: string;
  waveColor?: string;
  crestColor?: string;
  speed?: number;
  amplitude?: number;
  waveScale?: number;
  waveRatio?: number;
  swell?: number;
  turbulence?: number;
  tilt?: number;
  zoom?: number;
  height?: number;
  fogDepth?: number;
  detail?: Detail;
  brightness?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  parallaxStrength?: number;
  grain?: boolean;
  grainIntensity?: number;
  className?: string;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match ? [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255] : [1, 1, 1];
};

const stepsFor = (detail: Detail) => detail === "low" ? 40 : detail === "high" ? 110 : 70;

const vertex = `#version 300 es
in vec2 position;
void main(){gl_Position=vec4(position,0.,1.);}`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution,uMouse;uniform float iTime,uSpeed,uAmplitude,uWaveScale,uWaveRatio,uSwell,uTurbulence,uTilt,uZoom,uHeight,uFogDepth,uSteps,uBrightness,uOpacity,uGrain,uGrainIntensity,uParallax;uniform bool uEnableMouse;uniform vec3 uHorizonColor,uWaveColor,uCrestColor;out vec4 fragColor;
const float MAX_DIST=20000.;
float hash21(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float plasma(vec3 r,vec2 f,vec4 tc){float mx=r.x+tc.x;mx+=uSwell*sin((r.y+mx)/20.+tc.y);float my=r.y-tc.z;my+=uTurbulence*cos(r.x/23.+tc.w);return r.z-(sin(mx*f.x)*uAmplitude+sin(my*f.y)*uAmplitude+uHeight);}
float raymarch(vec3 pos,vec3 dir,vec2 f,vec4 tc){float dist=0.;for(int i=0;i<128;i++){if(float(i)>=uSteps)break;float d=plasma(pos+dist*dir,f,tc);if(abs(d)<.1)break;dist+=.9*d;if(!(abs(dist)<MAX_DIST))return MAX_DIST;}return dist;}
void main(){float T=iTime*uSpeed;vec2 f=vec2(uWaveScale/7.,uWaveScale*uWaveRatio/3.);vec4 tc=vec4(T/.13,T/.81,T/.2,T/.71);float c,s;float vfov=(3.14159/2.3)/max(uZoom,.05);vec3 cam=vec3(0.,0.,30.);vec2 uv=gl_FragCoord.xy/iResolution.xy-.5;uv.x*=iResolution.x/iResolution.y;uv.y*=-1.;vec3 dir=vec3(0.,0.,-1.);float len=length(uv);float xrot=vfov*len;c=cos(xrot);s=sin(xrot);dir=mat3(1.,0.,0.,0.,c,-s,0.,s,c)*dir;vec2 nuv=len>1e-5?uv/len:vec2(1.,0.);c=nuv.x;s=nuv.y;dir=mat3(c,-s,0.,s,c,0.,0.,0.,1.)*dir;c=cos(uTilt);s=sin(uTilt);dir=mat3(c,0.,s,0.,1.,0.,-s,0.,c)*dir;if(uEnableMouse){float yaw=(uMouse.x-.5)*uParallax*.4;float pitch=(uMouse.y-.5)*uParallax*.4;c=cos(yaw);s=sin(yaw);dir=mat3(c,0.,s,0.,1.,0.,-s,0.,c)*dir;c=cos(pitch);s=sin(pitch);dir=mat3(1.,0.,0.,0.,c,-s,0.,s,c)*dir;}float dist=raymarch(cam,dir,f,tc);vec3 pos=cam+dist*dir;float t=clamp(uFogDepth/max(dist,.001),0.,1.);vec3 body=mix(uWaveColor,uCrestColor,clamp(pos.z*.08+.5,0.,1.));vec3 col=clamp(mix(uHorizonColor,body,t)*uBrightness,0.,1.);float alpha=clamp(t,0.,1.)*uOpacity;if(uGrain>.5)alpha+=(hash21(gl_FragCoord.xy+mod(iTime,64.)*11.)-.5)*uGrainIntensity;fragColor=vec4(col*clamp(alpha,0.,1.),clamp(alpha,0.,1.));}`;

export default function GradientWaves({
  horizonColor = "#261852", waveColor = "#8c73ff", crestColor = "#e8e2ff", speed = 0.35,
  amplitude = 2.45, waveScale = 0.6, waveRatio = 0.9, swell = 35, turbulence = 20, tilt = 1.11,
  zoom = 1, height = 5.5, fogDepth = 15, detail = "medium", brightness = 0.72, opacity = 0.34,
  mouseInteraction = true, parallaxStrength = 0.5, grain = true, grainIntensity = 0.035, className = "",
}: GradientWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.WebGL2RenderingContext) return;
    let renderer: Renderer;
    try { renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 2) }); } catch { return; }
    const gl = renderer.gl;
    const program = new Program(gl, { vertex, fragment, uniforms: {
      iTime: { value: 0 }, iResolution: { value: new Float32Array([1, 1]) }, uSpeed: { value: speed }, uAmplitude: { value: amplitude }, uWaveScale: { value: waveScale }, uWaveRatio: { value: waveRatio }, uSwell: { value: swell }, uTurbulence: { value: turbulence }, uTilt: { value: tilt }, uZoom: { value: zoom }, uHeight: { value: height }, uFogDepth: { value: fogDepth }, uSteps: { value: stepsFor(detail) }, uBrightness: { value: brightness }, uOpacity: { value: opacity }, uGrain: { value: grain ? 1 : 0 }, uGrainIntensity: { value: grainIntensity }, uMouse: { value: new Float32Array([.5, .5]) }, uParallax: { value: parallaxStrength }, uEnableMouse: { value: mouseInteraction }, uHorizonColor: { value: new Float32Array(hexToRgb(horizonColor)) }, uWaveColor: { value: new Float32Array(hexToRgb(waveColor)) }, uCrestColor: { value: new Float32Array(hexToRgb(crestColor)) },
    } });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const canvas = gl.canvas;
    canvas.style.cssText = "display:block;width:100%;height:100%";
    container.appendChild(canvas);
    const resize = () => { const rect = container.getBoundingClientRect(); renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height)); const resolution = program.uniforms.iResolution.value as Float32Array; resolution[0] = gl.drawingBufferWidth; resolution[1] = gl.drawingBufferHeight; };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
    const target = [.5, .5]; const current = [.5, .5];
    const onMove = (event: PointerEvent) => { const rect = canvas.getBoundingClientRect(); target[0] = (event.clientX - rect.left) / rect.width; target[1] = 1 - (event.clientY - rect.top) / rect.height; };
    const resetMouse = () => { target[0] = .5; target[1] = .5; };
    canvas.addEventListener("pointermove", onMove); canvas.addEventListener("pointerleave", resetMouse);
    let frame = 0; let active = true; const started = performance.now();
    const render = (time: number) => { if (!active) return; program.uniforms.iTime.value = (time - started) / 1000; current[0] += (target[0] - current[0]) * .05; current[1] += (target[1] - current[1]) * .05; const mouse = program.uniforms.uMouse.value as Float32Array; mouse[0] = current[0]; mouse[1] = current[1]; renderer.render({ scene: mesh }); frame = requestAnimationFrame(render); };
    const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting && !document.hidden; if (active && !frame) frame = requestAnimationFrame(render); if (!active && frame) { cancelAnimationFrame(frame); frame = 0; } }); observer.observe(container); frame = requestAnimationFrame(render);
    return () => { active = false; cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect(); canvas.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerleave", resetMouse); canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }, [amplitude, brightness, crestColor, detail, fogDepth, grain, grainIntensity, height, horizonColor, mouseInteraction, opacity, parallaxStrength, speed, swell, tilt, turbulence, waveColor, waveRatio, waveScale, zoom]);

  return <div aria-hidden="true" ref={containerRef} className={className} />;
}
