// src/rooms/ScrollDepthRoom.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ScrollDepthRoom.module.css";

gsap.registerPlugin(ScrollTrigger);

const MODULES = [
  {
    id: "z-axis",
    no: "01",
    title: "z-axis",
    jp: "奥へ送る",
    tone: "rgba(255, 184, 74, 0.72)",
    skin: "#f2ad42",
    code: [
      "translateZ(-depth)",
      "perspective: 1600px",
      "transform-style: preserve-3d",
      "scroll → z-position",
    ],
  },
  {
    id: "scrub",
    no: "02",
    title: "scrub.sync",
    jp: "同期",
    tone: "rgba(87, 221, 238, 0.72)",
    skin: "#57ddec",
    code: [
      "ScrollTrigger.create({",
      "  scrub: 1.2,",
      "  start: 'top top',",
      "  end: 'bottom bottom'",
      "})",
    ],
  },
  {
    id: "parallax",
    no: "03",
    title: "parallax.mass",
    jp: "質量差",
    tone: "rgba(170, 138, 255, 0.7)",
    skin: "#a98aff",
    code: [
      "nearLayer += 120px",
      "midLayer += 48px",
      "farLayer -= 180px",
      "speed = distance * depth",
    ],
  },
  {
    id: "fog",
    no: "04",
    title: "depth.fog",
    jp: "奥の霞み",
    tone: "rgba(124, 236, 163, 0.64)",
    skin: "#7bea9e",
    code: [
      "opacity = 1.0 - distance",
      "blur = depth * 0.004",
      "fog += scrollProgress",
      "image becomes atmosphere",
    ],
  },
];

const PLANES = Array.from({ length: 11 }).map((_, i) => ({
  id: `plane-${i + 1}`,
  label: String(i + 1).padStart(2, "0"),
}));

const CODE_STREAM = [
  "const depth = scroll.progress * 2400;",
  "layer.style.transform = translateZ(-depth);",
  "camera.fov = mix(34, 58, progress);",
  "fog.opacity = progress * 0.72;",
  "code becomes distance;",
  "scroll is not movement;",
  "scroll is camera;",
];

export default function ScrollDepthRoom() {
  const navigate = useNavigate();

  const rootRef = useRef(null);
  const activeIndexRef = useRef(0);

  const [activeId, setActiveId] = useState(MODULES[0].id);

  const active = useMemo(
    () => MODULES.find((item) => item.id === activeId) ?? MODULES[0],
    [activeId]
  );

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

        root.style.setProperty("--mx", `${x * 100}%`);
        root.style.setProperty("--my", `${y * 100}%`);
      });
    };

    const onLeave = () => {
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
      const theater = q(`.${styles.depthTheater}`)[0];
      const planes = q(`.${styles.depthPlane}`);
      const streams = q(`.${styles.codeStream}`);
      const modules = q(`.${styles.moduleButton}`);
      const codeLines = q(`.${styles.codeLine}`);
      const railFill = q(`.${styles.progressFill}`)[0];
      const core = q(`.${styles.coreMass}`)[0];
      const bg = q(`.${styles.bg}`)[0];

      gsap.set([back, title, theater].filter(Boolean), {
        opacity: 0,
        y: 22,
        filter: "blur(0.18px)",
      });

      gsap.set([...planes, ...streams, ...modules, ...codeLines], {
        opacity: 0,
        y: 18,
        filter: "blur(0.16px)",
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(veil, { opacity: 0, duration: 0.82 }, 0)
        .to(back, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.62 }, 0.06)
        .to(title, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.62 }, 0.1)
        .to(theater, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.92 }, 0.16)
        .to(
          planes,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.72,
            stagger: { each: 0.035, from: "center" },
          },
          0.28
        )
        .to(
          streams,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.62,
            stagger: 0.04,
          },
          0.34
        )
        .to(
          modules,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.52,
            stagger: 0.05,
          },
          0.44
        )
        .to(
          codeLines,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.42,
            stagger: 0.035,
          },
          0.5
        );

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.05,
          onUpdate: (self) => {
            const progress = self.progress;
            root.style.setProperty("--scroll-progress", progress.toFixed(3));

            if (railFill) {
              gsap.set(railFill, {
                scaleY: progress,
              });
            }

            const nextIndex = Math.min(
              MODULES.length - 1,
              Math.floor(progress * MODULES.length)
            );

            if (nextIndex !== activeIndexRef.current) {
              activeIndexRef.current = nextIndex;
              setActiveId(MODULES[nextIndex].id);
            }
          },
        },
      });

      scrollTl
        .to(
          planes,
          {
            z: (i) => 820 - i * 220,
            y: (i) => -120 + i * 26,
            rotateX: (i) => -18 + i * 2.2,
            rotateY: (i) => (i % 2 ? -16 : 16),
            scale: (i) => 1.18 - i * 0.028,
            opacity: (i) => 0.9 - i * 0.045,
            filter: (i) => `blur(${Math.max(0, i * 0.08)}px)`,
            ease: "none",
          },
          0
        )
        .to(
          streams,
          {
            xPercent: (i) => (i % 2 ? -36 : 36),
            yPercent: (i) => -28 + i * 5,
            z: (i) => 120 + i * 60,
            rotateZ: (i) => (i % 2 ? -8 : 8),
            opacity: 0.78,
            ease: "none",
          },
          0
        )
        .to(
          core,
          {
            scale: 1.42,
            rotateZ: 34,
            z: 260,
            filter: "brightness(1.28) saturate(1.22)",
            ease: "none",
          },
          0
        )
        .to(
          bg,
          {
            scale: 1.18,
            yPercent: 5,
            filter: "brightness(0.32) contrast(1.36) saturate(0.68)",
            ease: "none",
          },
          0
        );

      gsap.to(streams, {
        y: (i) => (i % 2 ? -12 : 12),
        duration: (i) => 3.4 + i * 0.32,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (reduce) return;

    const codeLines = root.querySelectorAll(`.${styles.codeLine}`);
    const activePanel = root.querySelector(`.${styles.activeCode}`);

    gsap.fromTo(
      activePanel,
      { opacity: 0.72, y: 8, filter: "blur(0.12px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.36, ease: "power3.out" }
    );

    gsap.fromTo(
      codeLines,
      { opacity: 0, y: 10, filter: "blur(0.12px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.38,
        stagger: 0.035,
        ease: "power3.out",
      }
    );
  }, [activeId]);

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

      <p className={styles.titleMark}>Scroll Depth / scroll-driven code</p>

      <section className={styles.depthTheater} aria-label="Scroll Depth code theater">
        <div className={styles.stickyStage}>
          <div className={styles.depthScene} aria-hidden="true">
            <div className={styles.vanishPoint} />

            {PLANES.map((plane, index) => (
              <span
                key={plane.id}
                className={styles.depthPlane}
                style={{
                  "--i": index,
                }}
              >
                <i />
                <b>{plane.label}</b>
              </span>
            ))}

            <div className={styles.coreMass}>
              <span />
              <span />
              <span />
            </div>

            {CODE_STREAM.map((line, index) => (
              <code
                key={`${line}-${index}`}
                className={`${styles.codeStream} ${styles[`codeStream${index + 1}`]}`}
              >
                {line}
              </code>
            ))}
          </div>

          <aside className={styles.activeCode}>
            <div className={styles.activeHead}>
              <span>{active.no}</span>
              <strong>{active.title}</strong>
              <em>{active.jp}</em>
            </div>

            <div className={styles.codeBox}>
              {active.code.map((line) => (
                <code key={line} className={styles.codeLine}>
                  {line}
                </code>
              ))}
            </div>
          </aside>

          <div className={styles.moduleDock} aria-label="Scroll depth modes">
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

          <div className={styles.progressRail} aria-hidden="true">
            <span className={styles.progressFill} />
          </div>
        </div>
      </section>
    </main>
  );
}