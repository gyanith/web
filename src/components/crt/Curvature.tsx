import React, { useRef, useEffect, useState } from "react";
import {
  Renderer,
  Camera,
  Transform,
  Program,
  Mesh,
  Texture,
  Geometry,
} from "ogl";

interface CRTCurvature3DProps {
  children: React.ReactNode;
  curvature?: number;
  className?: string;
  style?: React.CSSProperties;
  segments?: number;
}

const vertexShader = `
attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D tMap;
varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(tMap, vUv);
}
`;

export default function CRTCurvature3D({
  children,
  curvature = 0.15,
  className = "",
  style = {},
  segments = 32,
}: CRTCurvature3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glContainerRef = useRef<HTMLDivElement>(null);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    // Trigger content render
    setContentReady(true);
  }, [children]);

  useEffect(() => {
    const glContainer = glContainerRef.current;
    const contentCanvas = canvasRef.current;
    const contentDiv = contentRef.current;

    if (!glContainer || !contentCanvas || !contentDiv || !contentReady) return;

    const renderer = new Renderer({ dpr: 2, alpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);

    const camera = new Camera(gl, { fov: 45 });
    camera.position.set(0, 0, 3);

    const scene = new Transform();

    // Create curved plane geometry
    function createCurvedPlane(
      width: number,
      height: number,
      segments: number,
      curvature: number
    ) {
      const positions = [];
      const uvs = [];
      const indices = [];

      for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
          const u = j / segments;
          const v = i / segments;

          // Map to [-1, 1]
          const x = (u - 0.5) * width;
          const y = (v - 0.5) * height;

          // Apply curvature (push z based on distance from center)
          const dist = Math.sqrt(x * x + y * y);
          const z = -curvature * dist * dist;

          positions.push(x, y, z);
          uvs.push(u, 1 - v);
        }
      }

      // Create indices for triangles
      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
          const a = i * (segments + 1) + j;
          const b = a + segments + 1;
          const c = a + 1;
          const d = b + 1;

          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }

      return {
        position: { size: 3, data: new Float32Array(positions) },
        uv: { size: 2, data: new Float32Array(uvs) },
        index: { data: new Uint16Array(indices) },
      };
    }

    const geometryData = createCurvedPlane(2, 2, segments, curvature);
    const geometry = new Geometry(gl, geometryData);

    // Render content div to canvas texture
    const updateTexture = () => {
      const ctx = contentCanvas.getContext("2d");
      if (!ctx) return null;

      const rect = contentDiv.getBoundingClientRect();
      const scale = 2; // For retina displays
      contentCanvas.width = rect.width * scale;
      contentCanvas.height = rect.height * scale;

      ctx.scale(scale, scale);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Use html2canvas-like approach with foreignObject
      const data = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width:${rect.width}px;height:${rect.height}px">
              ${contentDiv.innerHTML}
            </div>
          </foreignObject>
        </svg>
      `;

      const img = new Image();
      const blob = new Blob([data], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      return new Promise<Texture>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          URL.revokeObjectURL(url);

          const texture = new Texture(gl, {
            image: contentCanvas,
            generateMipmaps: false,
          });
          resolve(texture);
        };
        img.src = url;
      });
    };

    let texture: Texture | null = null;
    let program: Program | null = null;
    let mesh: Mesh | null = null;

    const init = async () => {
      texture = await updateTexture();

      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          tMap: { value: texture },
        },
      });

      mesh = new Mesh(gl, { geometry, program });
      mesh.setParent(scene);
    };

    const resize = () => {
      const { width, height } = glContainer.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(glContainer);
    resize();

    let rafId: number;
    const animate = (t: number) => {
      rafId = requestAnimationFrame(animate);

      if (mesh) {
        mesh.rotation.y = Math.sin(t * 0.0003) * 0.1;
        mesh.rotation.x = Math.sin(t * 0.0002) * 0.05;
      }

      renderer.render({ scene, camera });
    };

    init().then(() => {
      glContainer.appendChild(gl.canvas);
      rafId = requestAnimationFrame(animate);
    });

    // Update texture periodically to reflect content changes
    const intervalId = setInterval(async () => {
      const newTexture = await updateTexture();
      if (program && newTexture) {
        program.uniforms.tMap.value = newTexture;
        texture = newTexture;
      }
    }, 100);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(intervalId);
      resizeObserver.disconnect();
      if (gl.canvas.parentElement === glContainer) {
        glContainer.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [curvature, segments, contentReady, children]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      {/* Hidden content div that will be rendered to texture */}
      <div
        ref={contentRef}
        className="absolute inset-0"
        style={{
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>

      {/* Hidden canvas for rendering content */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* WebGL container */}
      <div ref={glContainerRef} className="w-full h-full" />
    </div>
  );
}
