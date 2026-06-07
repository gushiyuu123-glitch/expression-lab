// src/rooms/TypographyRoom.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import styles from "./TypographyRoom.module.css";

const MAIN_WORD = "TYPOGRAPHY";

const MODULES = [
  {
    id: "kinetic",
    no: "01",
    title: "kinetic.type",
    jp: "動く文字",
    tone: "rgba(255, 105, 168, 0.68)",
    skin: "#ef6fa4",
    code: [
      "letters = text.split('')",
      "char.style.transform = translateZ(depth)",
      "stagger.from = 'center'",
      "type becomes motion",
    ],
  },
  {
    id: "vertical",
    no: "02",
    title: "vertical.flow",
    jp: "縦の流れ",
    tone: "rgba(87, 221, 238, 0.72)",
    skin: "#57ddec",
    code: [
      "writing-mode: vertical-rl",
      "line-height = rhythm",
      "letter-spacing = breath",
      "japanese type as architecture",
    ],
  },
  {
    id: "noise",
    no: "03",
    title: "noise.break",
    jp: "文字の破片",
    tone: "rgba(170, 138, 255, 0.7)",
    skin: "#a98aff",
    code: [
      "glyph.x += random(-1, 1)",
      "glyph.z = index * depth",
      "opacity = distance",
      "readable ⇄ abstract",
    ],
  },
  {
    id: "scale",
    no: "04",
    title: "scale.axis",
    jp: "巨大化",
    tone: "rgba(255, 184, 74, 0.7)",
    skin: "#f2ad42",
    code: [
      "font-size: clamp(72px, 18vw, 260px)",
      "letter-spacing: -0.08em",
      "weight = visual gravity",
      "type becomes object",
    ],
  },
];

const WALL_LINES = [
  "font-size / letter-spacing / line-height / transform / translateZ / preserve-3d",
  "TYPE TYPE TYPE TYPE TYPE TYPE TYPE TYPE TYPE TYPE TYPE TYPE",
  "文字は情報であり、構造であり、空間であり、重さである。",
  "splitText() / stagger() / opacity() / rotateX() / scale()",
  "ABCDEFGHIJKLMN OPQRSTUVWXYZ 0123456789 {} [] () => ;",
  "TYPOGRAPHY IS NOT TEXT. TYPOGRAPHY IS A STAGE.",
  "行間 / 字間 / 余白 / 密度 / 重心 / 呼吸 / 速度 / 残像",
];

const RIBBONS = [
  "KERNING / LEADING / TRACKING / BASELINE / GRID / RHYTHM",
  "TEXT AS OBJECT / TEXT AS LIGHT / TEXT AS ROOM",
  "コードで文字をばらし、空間に戻す。",
];

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]().;=><*/+-";

function createGlyphs() {
  return Array.from({ length: 72 }, (_, i) => {
    const x = 5 + ((i * 37) % 90);
    const y = 9 + ((i * 53) % 82);
    const z = -420 + (i % 14) * 70;
    const r = -28 + (i % 11) * 5.6;
    const size = 14 + (i % 8) * 6;
    const opacity = 0.22 + (i % 6) * 0.09;

    return {
      id: `glyph-${i}`,
      char: CHARS[i % CHARS.length],
      x,
      y,
      z,
      r,
      size,
      opacity,
    };
  });
}

export default function TypographyRoom() {
  const navigate = useNavigate();

  const rootRef = useRef(null);
  const stageRef = useRef(null);

  const [activeId, setActiveId] = useState(MODULES[0].id);

  const glyphs = useMemo(() => createGlyphs(), []);

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
      const stage = q(`.${styles.typeStage}`)[0];
      const megaLetters = q(`.${styles.megaLetter}`);
      const glyphEls = q(`.${styles.glyph}`);
      const wallLines = q(`.${styles.wallLine}`);
      const ribbons = q(`.${styles.ribbon}`);
      const codeShards = q(`.${styles.codeShard}`);
      const modules = q(`.${styles.moduleButton}`);
      const verticals = q(`.${styles.verticalText}`);

      gsap.set([back, title, stage].filter(Boolean), {
        opacity: 0,
        y: 22,
        filter: "blur(0.18px)",
      });

      gsap.set([...megaLetters, ...glyphEls, ...wallLines, ...ribbons, ...codeShards, ...modules, ...verticals], {
        opacity: 0,
        y: 16,
        filter: "blur(0.16px)",
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(veil, { opacity: 0, duration: 0.82 }, 0)
        .to(back, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.58 }, 0.06)
        .to(title, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.58 }, 0.1)
        .to(stage, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.92 }, 0.14)
        .to(
          wallLines,
          {
            opacity: 0.42,
            y: 0,
            filter: "blur(0px)",
            duration: 0.56,
            stagger: 0.04,
          },
          0.24
        )
        .to(
          megaLetters,
          {
            opacity: 1,
            y: 0,
            z: (i) => i * 18,
            rotateX: (i) => -4 + i * 0.8,
            filter: "blur(0px)",
            duration: 0.76,
            stagger: { each: 0.035, from: "center" },
          },
          0.32
        )
        .to(
          glyphEls,
          {
            opacity: (i) => 0.28 + (i % 7) * 0.08,
            y: 0,
            filter: "blur(0px)",
            duration: 0.68,
            stagger: { each: 0.01, from: "random" },
          },
          0.38
        )
        .to(
          [...ribbons, ...verticals],
          {
            opacity: 0.82,
            y: 0,
            filter: "blur(0px)",
            duration: 0.64,
            stagger: 0.055,
          },
          0.46
        )
        .to(
          codeShards,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.48,
            stagger: 0.035,
          },
          0.52
        )
        .to(
          modules,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.5,
            stagger: 0.045,
          },
          0.58
        );

      gsap.to(megaLetters, {
        y: (i) => (i % 2 ? -10 : 10),
        rotateX: (i) => (i % 2 ? 8 : -8),
        z: (i) => 40 + i * 14,
        duration: (i) => 4 + i * 0.12,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(glyphEls, {
        x: (i) => (i % 2 ? -18 : 18),
        y: (i) => (i % 3 ? 12 : -12),
        rotateZ: (i) => (i % 2 ? 10 : -10),
        duration: (i) => 3.2 + (i % 8) * 0.22,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(codeShards, {
        x: (i) => (i % 2 ? -12 : 12),
        y: (i) => (i % 2 ? 9 : -9),
        duration: (i) => 3.6 + i * 0.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (reduce) return;

    const codeShards = root.querySelectorAll(`.${styles.codeShard}`);
    const activePanel = root.querySelector(`.${styles.activeCode}`);
    const megaLetters = root.querySelectorAll(`.${styles.megaLetter}`);

    gsap.fromTo(
      activePanel,
      { opacity: 0.76, y: 8, filter: "blur(0.12px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.36, ease: "power3.out" }
    );

    gsap.fromTo(
      codeShards,
      { opacity: 0, y: 12, filter: "blur(0.14px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.4,
        stagger: 0.035,
        ease: "power3.out",
      }
    );

    gsap.fromTo(
      megaLetters,
      { scale: 0.96, filter: "brightness(1.24)" },
      { scale: 1, filter: "brightness(1)", duration: 0.52, ease: "power3.out" }
    );
  }, [activeId]);

  function burstTypography() {
    const stage = stageRef.current;
    if (!stage) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (reduce) return;

    const glyphEls = stage.querySelectorAll(`.${styles.glyph}`);
    const megaLetters = stage.querySelectorAll(`.${styles.megaLetter}`);
    const codeShards = stage.querySelectorAll(`.${styles.codeShard}`);

    gsap.killTweensOf([glyphEls, megaLetters, codeShards]);

    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .to(
        megaLetters,
        {
          y: (i) => (i % 2 ? -32 : 32),
          z: (i) => 120 + i * 28,
          rotateX: (i) => (i % 2 ? 18 : -18),
          scale: 1.08,
          duration: 0.28,
          stagger: { each: 0.018, from: "center" },
        },
        0
      )
      .to(
        glyphEls,
        {
          x: (i) => (i % 2 ? -1 : 1) * (42 + (i % 8) * 10),
          y: (i) => (i % 3 ? -1 : 1) * (34 + (i % 6) * 8),
          rotateZ: (i) => (i % 2 ? -36 : 36),
          opacity: 1,
          duration: 0.24,
          stagger: { each: 0.004, from: "random" },
        },
        0
      )
      .to(
        codeShards,
        {
          scale: 1.08,
          opacity: 1,
          duration: 0.26,
          stagger: 0.025,
        },
        0.04
      )
      .to(
        [megaLetters, glyphEls, codeShards],
        {
          x: 0,
          y: 0,
          z: 0,
          rotateX: 0,
          rotateZ: 0,
          scale: 1,
          duration: 0.82,
          ease: "power4.out",
        },
        0.34
      );
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

      <p className={styles.titleMark}>Typography / text becomes space</p>

      <section className={styles.typeTheater} aria-label="Typography code theater">
        <button
          ref={stageRef}
          type="button"
          className={styles.typeStage}
          onClick={burstTypography}
          aria-label="Burst typography"
        >
          <div className={styles.wall} aria-hidden="true">
            {WALL_LINES.map((line, index) => (
              <span
                key={line}
                className={`${styles.wallLine} ${styles[`wallLine${index + 1}`]}`}
              >
                {line}
              </span>
            ))}
          </div>

          <div className={styles.megaWord} aria-hidden="true">
            {MAIN_WORD.split("").map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className={styles.megaLetter}
                style={{
                  "--lz": `${index * 18}px`,
                  "--delay": `${index * 0.04}s`,
                }}
              >
                {letter}
              </span>
            ))}
          </div>

          <div className={styles.ribbonField} aria-hidden="true">
            {RIBBONS.map((text, index) => (
              <span
                key={text}
                className={`${styles.ribbon} ${styles[`ribbon${index + 1}`]}`}
              >
                {text}
              </span>
            ))}
          </div>

          <div className={styles.verticalField} aria-hidden="true">
            <span className={`${styles.verticalText} ${styles.verticalTextA}`}>
              文字は空間になる
            </span>
            <span className={`${styles.verticalText} ${styles.verticalTextB}`}>
              余白と密度で読む
            </span>
            <span className={`${styles.verticalText} ${styles.verticalTextC}`}>
              TYPE / CODE / SPACE
            </span>
          </div>

          <div className={styles.glyphCloud} aria-hidden="true">
            {glyphs.map((glyph) => (
              <span
                key={glyph.id}
                className={styles.glyph}
                style={{
                  "--x": `${glyph.x}%`,
                  "--y": `${glyph.y}%`,
                  "--z": `${glyph.z}px`,
                  "--r": `${glyph.r}deg`,
                  "--size": `${glyph.size}px`,
                  "--o": glyph.opacity,
                }}
              >
                {glyph.char}
              </span>
            ))}
          </div>

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

          <i className={styles.typeCore} aria-hidden="true" />
          <i className={styles.stageShadow} aria-hidden="true" />
        </button>

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

        <div className={styles.moduleDock} aria-label="Typography modes">
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