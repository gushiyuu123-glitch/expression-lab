// src/pages/EntranceHall.jsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./EntranceHall.module.css";

gsap.registerPlugin(ScrollTrigger);

const ROOM_JUMP_MS = 980;
const CLOSE_BACK_MS = 1500;

const ENTRIES = [
  {
    id: "art-door",
    no: "01",
    title: "3D Art",
    jp: "立体表現",
    tone: "rgba(87, 221, 238, 0.68)",
    skin: "#57ddec",
    path: "/rooms/art-door",
  },
{
  id: "scroll-depth",
  no: "02",
  title: "Scroll Depth",
  jp: "奥行き",
  tone: "rgba(255, 184, 74, 0.62)",
  skin: "#f2ad42",
  path: "/rooms/scroll-depth",
},
{
  id: "typography",
  no: "03",
  title: "Typography",
  jp: "文字表現",
  tone: "rgba(255, 105, 168, 0.58)",
  skin: "#ef6fa4",
  path: "/rooms/typography",
},
  {
    id: "image-light",
    no: "04",
    title: "Image Light",
    jp: "像と光",
    tone: "rgba(170, 138, 255, 0.58)",
    skin: "#a98aff",
  },
  {
    id: "interaction",
    no: "05",
    title: "Interaction",
    jp: "触れる表現",
    tone: "rgba(124, 236, 163, 0.58)",
    skin: "#7bea9e",
  },
  {
    id: "weird-art",
    no: "06",
    title: "Weird Art",
    jp: "異物感",
    tone: "rgba(105, 160, 255, 0.6)",
    skin: "#6aa0ff",
  },
  {
    id: "veil",
    no: "07",
    title: "Veil",
    jp: "膜",
    tone: "rgba(210, 245, 255, 0.5)",
    skin: "#d7f6ff",
  },
  {
    id: "cursor-light",
    no: "08",
    title: "Cursor Light",
    jp: "光の追従",
    tone: "rgba(124, 236, 163, 0.58)",
    skin: "#7bea9e",
  },
  {
    id: "grid-flash",
    no: "09",
    title: "Grid Flash",
    jp: "構造線",
    tone: "rgba(105, 160, 255, 0.6)",
    skin: "#6aa0ff",
  },

  // ここから下は拡張枠。追加すればスクロールで増える。
  {
    id: "type-carving",
    no: "10",
    title: "Type Carving",
    jp: "彫る文字",
    tone: "rgba(255, 105, 168, 0.56)",
    skin: "#ef6fa4",
  },
  {
    id: "image-develop",
    no: "11",
    title: "Image Develop",
    jp: "現像",
    tone: "rgba(255, 184, 74, 0.6)",
    skin: "#f2ad42",
  },
  {
    id: "liquid-noise",
    no: "12",
    title: "Liquid Noise",
    jp: "液体ノイズ",
    tone: "rgba(105, 160, 255, 0.62)",
    skin: "#6aa0ff",
  },
];

export default function EntranceHall() {
  const navigate = useNavigate();

  const rootRef = useRef(null);
  const closeTimerRef = useRef(null);
  const jumpTimerRef = useRef(null);

  const [activeId, setActiveId] = useState(ENTRIES[0].id);
  const [openingId, setOpeningId] = useState(null);

  const activeEntry = useMemo(
    () => ENTRIES.find((entry) => entry.id === activeId) ?? ENTRIES[0],
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
        root.style.setProperty("--mx", `${(e.clientX / window.innerWidth) * 100}%`);
        root.style.setProperty("--my", `${(e.clientY / window.innerHeight) * 100}%`);
      });
    };

    const onLeave = () => {
      root.style.setProperty("--mx", "50%");
      root.style.setProperty("--my", "46%");
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

    if (reduce) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      const bg = q(`.${styles.factoryBg}`)[0];
      const entries = q(`.${styles.entry}`);
      const marks = q(`.${styles.indexMark}`);
      const hint = q(`.${styles.scrollHint}`)[0];

      gsap.set(entries, {
        opacity: 0,
        y: 34,
        rotateX: 4,
        filter: "blur(0.18px)",
      });

      gsap.set([...marks, hint], {
        opacity: 0,
        y: 12,
        filter: "blur(0.16px)",
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(entries, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 0.86,
          stagger: {
            each: 0.055,
            from: "center",
          },
        })
        .to(
          [...marks, hint],
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.58,
            stagger: 0.04,
          },
          0.24
        );

      if (bg) {
        gsap.to(bg, {
          scale: 1.15,
          yPercent: 4,
          filter: "brightness(0.42) contrast(1.3) saturate(0.72)",
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.1,
          },
        });
      }

      ScrollTrigger.batch(entries, {
        start: "top 88%",
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.68,
            stagger: 0.045,
            ease: "power3.out",
          });
        },
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      if (jumpTimerRef.current) window.clearTimeout(jumpTimerRef.current);
    };
  }, []);

  function openEntry(entry, e) {
    setActiveId(entry.id);
    setOpeningId(entry.id);

    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    if (jumpTimerRef.current) window.clearTimeout(jumpTimerRef.current);

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (!reduce && e?.currentTarget) {
      const target = e.currentTarget;
      const leaf = target.querySelector(`.${styles.doorFrame}`);
      const light = target.querySelector(`.${styles.innerLight}`);
      const shadow = target.querySelector(`.${styles.depthPlate}`);
      const title = target.querySelector(`.${styles.entryTitle}`);

      gsap.killTweensOf([target, leaf, light, shadow, title]);

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(
          target,
          {
            z: 120,
            scale: 1.055,
            duration: 0.44,
          },
          0
        )
        .to(
          leaf,
          {
            rotationY: -76,
            x: -8,
            duration: 0.58,
            transformOrigin: "left center",
          },
          0.04
        )
        .to(
          light,
          {
            opacity: 1,
            scale: 1.25,
            duration: 0.5,
          },
          0.08
        )
        .to(
          shadow,
          {
            opacity: 0.98,
            scaleX: 1.25,
            duration: 0.48,
          },
          0.08
        )
        .to(
          title,
          {
            y: 6,
            opacity: 0.42,
            duration: 0.42,
          },
          0.08
        );
    }

    if (entry.path) {
      jumpTimerRef.current = window.setTimeout(() => {
        navigate(entry.path);
      }, reduce ? 0 : ROOM_JUMP_MS);

      return;
    }

    closeTimerRef.current = window.setTimeout(() => {
      setOpeningId(null);

      if (!reduce && e?.currentTarget) {
        const target = e.currentTarget;
        const leaf = target.querySelector(`.${styles.doorFrame}`);
        const light = target.querySelector(`.${styles.innerLight}`);
        const shadow = target.querySelector(`.${styles.depthPlate}`);
        const title = target.querySelector(`.${styles.entryTitle}`);

        gsap.to(target, { z: 0, scale: 1, duration: 0.62, ease: "power3.out" });
        gsap.to(leaf, { rotationY: 0, x: 0, duration: 0.62, ease: "power3.out" });
        gsap.to(light, { opacity: 0, scale: 1, duration: 0.5, ease: "power3.out" });
        gsap.to(shadow, { opacity: 0.78, scaleX: 1, duration: 0.5, ease: "power3.out" });
        gsap.to(title, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" });
      }
    }, CLOSE_BACK_MS);
  }

  return (
    <main
      ref={rootRef}
      className={styles.hall}
      style={{
        "--active-tone": activeEntry.tone,
        "--active-skin": activeEntry.skin,
      }}
    >
      <div className={styles.backgroundWorld} aria-hidden="true">
        <img
          className={styles.factoryBg}
          src="/images/door-factory-night.png"
          alt=""
          decoding="async"
        />
        <i className={styles.bgVeil} />
        <i className={styles.cursorGlow} />
        <i className={styles.noise} />
      </div>

      <section className={styles.entryStage} aria-label="Expression entries">
        <div className={styles.entryGrid}>
          {ENTRIES.map((entry) => {
            const isActive = activeId === entry.id;
            const isOpening = openingId === entry.id;

            return (
              <button
                key={entry.id}
                type="button"
                className={[
                  styles.entry,
                  isActive ? styles.entryActive : "",
                  isOpening ? styles.entryOpening : "",
                ].join(" ")}
                style={{
                  "--tone": entry.tone,
                  "--skin": entry.skin,
                }}
                onMouseEnter={() => setActiveId(entry.id)}
                onFocus={() => setActiveId(entry.id)}
                onClick={(e) => openEntry(entry, e)}
                aria-label={`${entry.title} - ${entry.jp}`}
              >
                <span className={styles.indexMark} aria-hidden="true">
                  {entry.no}
                </span>

                <span className={styles.doorSculpture} aria-hidden="true">
                  <span className={`${styles.ring} ${styles.ringOuter}`} />
                  <span className={`${styles.ring} ${styles.ringMid}`} />
                  <span className={`${styles.ring} ${styles.ringInner}`} />

                  <span className={styles.doorFrame}>
                    <i />
                    <i />
                    <b />
                  </span>

                  <span className={styles.innerLight} />
                  <span className={styles.depthPlate} />
                  <span className={styles.lightCut} />
                </span>

                <span className={styles.entryTitle}>{entry.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className={styles.scrollHint} aria-hidden="true">
        <span />
      </div>
    </main>
  );
}