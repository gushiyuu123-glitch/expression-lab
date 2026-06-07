// src/rooms/ArtDoorRoom.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import styles from "./ArtDoorRoom.module.css";

const MODULES = [
  {
    id: "raymarch",
    no: "01",
    title: "raymarch()",
    jp: "距離場",
    mode: 0,
    tone: "rgba(87, 221, 238, 0.76)",
    skin: "#57ddec",
    code: [
      "for(int i=0;i<96;i++){",
      "  p = ro + rd * depth;",
      "  d = scene(p);",
      "  glow += 0.02 / abs(d);",
      "}",
    ],
  },
  {
    id: "fracture",
    no: "02",
    title: "fracture.field",
    jp: "破片化",
    mode: 1,
    tone: "rgba(255, 105, 168, 0.66)",
    skin: "#ef6fa4",
    code: [
      "p = abs(p) - 0.42;",
      "p.xy *= rotate(time);",
      "float cut = sdOctahedron(p);",
      "color += edgeGlow(normal);",
    ],
  },
  {
    id: "orbit",
    no: "03",
    title: "orbit.signal",
    jp: "軌道",
    mode: 2,
    tone: "rgba(170, 138, 255, 0.7)",
    skin: "#a98aff",
    code: [
      "d = min(torusA, torusB);",
      "orbit += sin(time + length(p));",
      "light = mouse.xy;",
      "rim *= 1.8;",
    ],
  },
  {
    id: "core",
    no: "04",
    title: "core.burst",
    jp: "核爆ぜ",
    mode: 3,
    tone: "rgba(255, 184, 74, 0.7)",
    skin: "#f2ad42",
    code: [
      "boost = clickImpulse;",
      "core *= 1.0 + boost;",
      "fog += burst * 0.8;",
      "finalColor = codeToLight();",
    ],
  },
];

const vertexShaderSource = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;
uniform float uMode;
uniform float uBoost;

varying vec2 vUv;

#define MAX_STEPS 96
#define MAX_DIST 34.0
#define SURF_DIST 0.0014

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.23));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdOcta(vec3 p, float s) {
  p = abs(p);
  return (p.x + p.y + p.z - s) * 0.57735027;
}

float sdCross(vec3 p, float s) {
  float a = sdBox(p, vec3(s, 0.045, 0.045));
  float b = sdBox(p, vec3(0.045, s, 0.045));
  float c = sdBox(p, vec3(0.045, 0.045, s));
  return min(a, min(b, c));
}

float field(vec3 p) {
  float n = 0.0;
  n += sin(p.x * 2.2 + uTime * 0.8);
  n += sin(p.y * 3.0 - uTime * 0.55);
  n += sin(p.z * 3.6 + uTime * 0.42);
  return n / 3.0;
}

float scene(vec3 p) {
  vec2 m = (uMouse - 0.5) * 2.0;

  p.xz *= rot(uTime * 0.16 + m.x * 0.28);
  p.yz *= rot(-0.22 + m.y * 0.18);

  float burst = uBoost;
  float d = 10.0;

  if (uMode < 0.5) {
    vec3 q = p;
    q.xy *= rot(uTime * 0.28);
    q.xz *= rot(-uTime * 0.13);

    float boxA = sdBox(q, vec3(0.54 + burst * 0.1, 0.94, 0.075));
    float boxB = sdBox(q, vec3(0.075, 0.94, 0.54 + burst * 0.1));
    float ring = sdTorus(p, vec2(0.82 + burst * 0.12, 0.018));
    float core = sdSphere(p, 0.31 + burst * 0.16);
    d = min(max(min(boxA, boxB), -core), ring);
  } else if (uMode < 1.5) {
    vec3 q = p;
    q = abs(q) - vec3(0.18 + 0.08 * sin(uTime));
    q.xy *= rot(0.8 + uTime * 0.24);
    q.xz *= rot(-0.6 + uTime * 0.12);

    float a = sdOcta(q, 0.72 + burst * 0.22);
    float b = sdBox(q, vec3(0.32, 0.78, 0.32));
    float c = sdCross(p, 0.88 + burst * 0.16);
    d = min(max(a, -b), c);
  } else if (uMode < 2.5) {
    vec3 q = p;
    float r1 = sdTorus(q, vec2(0.82 + burst * 0.1, 0.018));
    q.xy *= rot(1.57 + uTime * 0.22);
    float r2 = sdTorus(q, vec2(0.58 + burst * 0.06, 0.014));
    q.yz *= rot(1.1 - uTime * 0.18);
    float r3 = sdTorus(q, vec2(0.42, 0.012));
    float core = sdSphere(p, 0.18 + 0.06 * sin(uTime * 2.0) + burst * 0.18);
    d = min(min(r1, r2), min(r3, core));
  } else {
    vec3 q = p;
    q.x += sin(q.z * 2.4 + uTime) * 0.16;
    q.y += sin(q.x * 3.2 - uTime * 0.9) * 0.12;
    q.z += field(q * 1.2) * 0.16;

    float liquid = sdTorus(q, vec2(0.72 + field(q) * 0.12 + burst * 0.18, 0.054));
    float sphere = sdSphere(q, 0.46 + field(q * 1.7) * 0.055 + burst * 0.16);
    float cut = sdBox(q, vec3(0.7, 0.08, 0.7));
    d = min(min(liquid, sphere), cut);
  }

  return d;
}

vec3 getNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  float d = scene(p);

  vec3 n = d - vec3(
    scene(p - e.xyy),
    scene(p - e.yxy),
    scene(p - e.yyx)
  );

  return normalize(n);
}

float raymarch(vec3 ro, vec3 rd, out float glow, out float codeGrid) {
  float dO = 0.0;
  glow = 0.0;
  codeGrid = 0.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;
    float dS = scene(p);

    glow += 0.018 / (0.038 + abs(dS) * 18.0);
    codeGrid += smoothstep(0.012, 0.0, abs(sin(p.x * 10.0) * sin(p.y * 10.0))) * 0.004;

    dO += dS * 0.68;

    if (dO > MAX_DIST || abs(dS) < SURF_DIST) break;
  }

  return dO;
}

vec3 palette(float t) {
  vec3 cyan = vec3(0.25, 0.88, 1.0);
  vec3 pink = vec3(1.0, 0.28, 0.62);
  vec3 violet = vec3(0.66, 0.50, 1.0);
  vec3 amber = vec3(1.0, 0.68, 0.24);

  if (uMode < 0.5) return mix(cyan, violet, t);
  if (uMode < 1.5) return mix(pink, cyan, t);
  if (uMode < 2.5) return mix(violet, cyan, t);
  return mix(amber, pink, t);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
  vec2 mouse = (uMouse - 0.5) * 2.0;

  vec3 ro = vec3(mouse.x * 0.32, mouse.y * 0.22, 3.8);
  vec3 rd = normalize(vec3(uv.x, uv.y, -1.72));

  rd.xz *= rot(mouse.x * 0.1);
  rd.yz *= rot(mouse.y * 0.08);

  float glow = 0.0;
  float codeGrid = 0.0;
  float d = raymarch(ro, rd, glow, codeGrid);

  vec3 col = vec3(0.0);
  vec3 base = palette(0.45 + 0.35 * sin(uTime * 0.28));

  if (d < MAX_DIST) {
    vec3 p = ro + rd * d;
    vec3 n = getNormal(p);

    vec3 lightPos = vec3(-1.8 + mouse.x * 0.8, 2.4 + mouse.y * 0.7, 2.4);
    vec3 l = normalize(lightPos - p);

    float diff = clamp(dot(n, l), 0.0, 1.0);
    float rim = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 2.2);
    float spec = pow(clamp(dot(reflect(-l, n), -rd), 0.0, 1.0), 34.0);

    col = base * (0.16 + diff * 0.76);
    col += vec3(1.0) * spec * 0.55;
    col += base * rim * (1.4 + uBoost * 1.2);
  }

  col += base * glow * (0.56 + uBoost * 0.9);
  col += palette(0.8) * codeGrid * 1.8;

  float burstRing = abs(length(uv) - (0.34 + uBoost * 0.34));
  col += palette(0.2) * smoothstep(0.035, 0.0, burstRing) * uBoost * 1.1;

  float scan = sin((uv.y + uTime * 0.08) * 220.0) * 0.012;
  col += scan;

  float fog = smoothstep(1.8, 8.0, d);
  col = mix(col, vec3(0.005, 0.008, 0.012), fog * 0.55);

  float vignette = smoothstep(1.42, 0.22, length(uv));
  col *= 0.44 + vignette * 0.92;

  float grain = hash(vec3(gl_FragCoord.xy, uTime)) * 0.04;
  col += grain;

  gl_FragColor = vec4(col, 1.0);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || "Shader compile error");
  }

  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || "Program link error");
  }

  return program;
}

export default function ArtDoorRoom() {
  const navigate = useNavigate();

  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const modeRef = useRef(MODULES[0].mode);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const boostRef = useRef({ value: 0 });

  const [activeId, setActiveId] = useState(MODULES[0].id);
  const [webglError, setWebglError] = useState(false);

  const active = useMemo(
    () => MODULES.find((item) => item.id === activeId) ?? MODULES[0],
    [activeId]
  );

  useEffect(() => {
    modeRef.current = active.mode;
  }, [active.mode]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const fine = window.matchMedia?.("(pointer: fine)")?.matches ?? false;

    if (reduce || !fine) return;

    let raf = 0;

    const onMove = (e) => {
      if (raf) cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        mouseRef.current = { x, y };

        root.style.setProperty("--mx", `${x * 100}%`);
        root.style.setProperty("--my", `${y * 100}%`);
      });
    };

    const onLeave = () => {
      mouseRef.current = { x: 0.5, y: 0.5 };

      root.style.setProperty("--mx", "50%");
      root.style.setProperty("--my", "48%");
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);

    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      setWebglError(true);
      return;
    }

    let program;
    let animationId = 0;
    const startTime = performance.now();

    try {
      program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    } catch (error) {
      console.error(error);
      setWebglError(true);
      return;
    }

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const mouseLocation = gl.getUniformLocation(program, "uMouse");
    const modeLocation = gl.getUniformLocation(program, "uMode");
    const boostLocation = gl.getUniformLocation(program, "uBoost");

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
      ]),
      gl.STATIC_DRAW
    );

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function render(now) {
      resize();

      const time = (now - startTime) * 0.001;
      const mouse = mouseRef.current;

      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(mouseLocation, mouse.x, 1.0 - mouse.y);
      gl.uniform1f(modeLocation, modeRef.current);
      gl.uniform1f(boostLocation, boostRef.current.value);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationId = requestAnimationFrame(render);
    }

    animationId = requestAnimationFrame(render);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const veil = root.querySelector(`.${styles.veil}`);

    if (reduce) {
      if (veil) veil.style.opacity = "0";
      return;
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      const back = q(`.${styles.backButton}`)[0];
      const title = q(`.${styles.titleMark}`)[0];
      const shell = q(`.${styles.webglShell}`)[0];
      const modules = q(`.${styles.moduleButton}`);
      const codes = q(`.${styles.codeShard}`);
      const floaters = q(`.${styles.floater}`);

      gsap.set([back, title, shell].filter(Boolean), {
        opacity: 0,
        y: 22,
        filter: "blur(0.18px)",
      });

      gsap.set([...modules, ...codes], {
        opacity: 0,
        y: 16,
        filter: "blur(0.16px)",
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(veil, { opacity: 0, duration: 0.82 }, 0)
        .to(back, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.62 }, 0.06)
        .to(title, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.66 }, 0.1)
        .to(shell, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.02 }, 0.16)
        .to(
          modules,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.52,
            stagger: 0.055,
          },
          0.4
        )
        .to(
          codes,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.46,
            stagger: 0.035,
          },
          0.46
        );

      gsap.to(floaters, {
        y: (i) => (i % 2 ? -22 : 22),
        x: (i) => (i % 2 ? 12 : -12),
        rotateZ: (i) => (i % 2 ? 12 : -12),
        duration: (i) => 3.8 + i * 0.34,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const shell = shellRef.current;
    if (!root || !shell) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (reduce) return;

    const shards = root.querySelectorAll(`.${styles.codeShard}`);

    gsap.fromTo(
      shell,
      { scale: 0.972, filter: "brightness(1.3) saturate(1.18)" },
      { scale: 1, filter: "brightness(1) saturate(1)", duration: 0.62, ease: "power3.out" }
    );

    gsap.fromTo(
      shards,
      { opacity: 0, y: 12, filter: "blur(0.14px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.42,
        stagger: 0.035,
        ease: "power3.out",
      }
    );

    boostRef.current.value = 0.72;
    gsap.to(boostRef.current, {
      value: 0,
      duration: 0.9,
      ease: "power3.out",
    });
  }, [activeId]);

  function explodeArt() {
    const shell = shellRef.current;
    if (!shell) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (reduce) return;

    gsap.killTweensOf(shell);
    gsap.killTweensOf(boostRef.current);

    boostRef.current.value = 1.4;

    gsap.to(boostRef.current, {
      value: 0,
      duration: 1.2,
      ease: "power3.out",
    });

    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .to(shell, {
        scale: 1.055,
        rotateY: -7,
        rotateX: 3,
        duration: 0.24,
      })
      .to(shell, {
        scale: 1,
        rotateY: 0,
        rotateX: 0,
        duration: 0.68,
        ease: "power4.out",
      });
  }

  return (
    <main
      ref={rootRef}
      className={styles.room}
      style={{
        "--tone": active.tone,
        "--skin": active.skin,
      }}
    >
      <div className={styles.background} aria-hidden="true">
        <img
          src="/images/door-factory-night.png"
          alt=""
          className={styles.bg}
          decoding="async"
        />
        <i className={styles.bgVeil} />
        <i className={styles.cursorGlow} />
        <i className={styles.gridAir} />
        <i className={styles.dust} />
      </div>

      <div className={styles.veil} aria-hidden="true" />

      <button type="button" className={styles.backButton} onClick={() => navigate("/")}>
        ← BACK
      </button>

      <p className={styles.titleMark}>3D Art / generated by code</p>

      <section className={styles.codeTheater} aria-label="3D Art code theater">
        <button
          ref={shellRef}
          type="button"
          className={styles.webglShell}
          onClick={explodeArt}
          aria-label="Explode generated 3D art"
        >
          <canvas ref={canvasRef} className={styles.webglCanvas} aria-hidden="true" />

          {webglError && (
            <span className={styles.fallback}>
              WebGL unavailable.
              <br />
              GPU rendering required.
            </span>
          )}

          <i className={`${styles.floater} ${styles.floaterA}`} aria-hidden="true" />
          <i className={`${styles.floater} ${styles.floaterB}`} aria-hidden="true" />
          <i className={`${styles.floater} ${styles.floaterC}`} aria-hidden="true" />
          <i className={`${styles.floater} ${styles.floaterD}`} aria-hidden="true" />
          <i className={`${styles.floater} ${styles.floaterE}`} aria-hidden="true" />
          <i className={styles.stageShadow} aria-hidden="true" />

          <span className={styles.runSignal} aria-hidden="true">
            RUN
          </span>
        </button>

        <div className={styles.codeCloud} aria-hidden="true">
          {active.code.map((line, index) => (
            <code
              key={`${active.id}-${line}`}
              className={`${styles.codeShard} ${styles[`codeShard${index + 1}`]}`}
            >
              {line}
            </code>
          ))}
        </div>

        <div className={styles.moduleDock} aria-label="3D Art modes">
          {MODULES.map((item) => {
            const isActive = item.id === activeId;

            return (
              <button
                key={item.id}
                type="button"
                className={[
                  styles.moduleButton,
                  isActive ? styles.moduleButtonActive : "",
                ].join(" ")}
                style={{
                  "--module-tone": item.tone,
                  "--module-skin": item.skin,
                }}
                onClick={() => setActiveId(item.id)}
              >
                <span>{item.no}</span>
                <strong>{item.title}</strong>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}