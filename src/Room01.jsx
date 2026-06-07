import { useEffect, useMemo, useState } from "react";
import styles from "./Room01.module.css";

/** reduced-motion */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/** clipboard */
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* -----------------------------
  DEMOS (Room01)
  - 1表現 = メタ + デモ + “抜き取り用コード”
----------------------------- */

function Demo_VeilOpen({ reduced }) {
  return (
    <div className={styles.demoStage}>
      <div className={styles.demoBg} />
      <div className={`${styles.veil} ${reduced ? styles.noMotion : ""}`} />
      <div className={styles.demoContent}>
        <div className={styles.kicker}>ROOM 01 — ENTRANCE</div>
        <h1 className={styles.h1}>Veil Open</h1>
        <p className={styles.p}>幕が上がる。場が立つ。</p>
      </div>
    </div>
  );
}

function Demo_ResolveReveal({ reduced }) {
  return (
    <div className={styles.demoStage}>
      <div className={styles.demoBgSoft} />
      <div className={styles.demoContent}>
        <div className={styles.kicker}>ROOM 01 — ENTRANCE</div>
        <h1 className={`${styles.h1} ${styles.resolve} ${reduced ? styles.noMotion : ""}`}>
          Resolve Reveal
        </h1>
        <p className={`${styles.p} ${styles.resolveSub} ${reduced ? styles.noMotion : ""}`}>
          像が整って現れる（速め・薄い）。
        </p>
      </div>
    </div>
  );
}

export default function Room01() {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("veil_open");
  const [copied, setCopied] = useState("");

  const EXPRESSIONS = useMemo(
    () => [
      {
        id: "veil_open",
        name: "Veil Open",
        tags: ["Entrance", "Quiet", "Stage"],
        hook: "舞台が始まる。場が立つ。",
        bestUse: "Hero / セクション頭",
        risk: "連発すると演出臭。暗さ・膜の濃さに注意。",
        knobs: "veilOpacity / duration / easing",
        kill: "reduced-motion → 即表示",
        Demo: Demo_VeilOpen,
        pack: `/* DEMO: veil_open
Hook: 舞台が始まる（場が立つ）
BestUse: Hero / セクション頭
Risk: 連発で演出臭、膜が濃いと重い
Knobs: veilOpacity, duration
Kill: reduced-motionで即表示
*/

<div className="stage">
  <div className="bg" />
  <div className="veil" />
  <div className="content">...</div>
</div>

/* CSS例
.stage{ position:relative; min-height:100vh; overflow:hidden; }
.veil{ position:absolute; inset:0; background:rgba(255,255,255,.08);
  animation:veilOpen 820ms cubic-bezier(.22,1,.36,1) both; }
@keyframes veilOpen{
  from{ opacity:1; transform:translate3d(0,0,0); }
  to  { opacity:0; transform:translate3d(0,-10px,0); }
}
*/`,
      },
      {
        id: "resolve_reveal",
        name: "Resolve Reveal",
        tags: ["Entrance", "Perception", "Core"],
        hook: "像が整って現れる（気持ちいい）。",
        bestUse: "見出し / Hero / 重要導線",
        risk: "遅すぎるとだるい。blur強すぎ厳禁。",
        knobs: "y / duration / blur(<=0.3px)",
        kill: "reduced-motion → アニメなし",
        Demo: Demo_ResolveReveal,
        pack: `/* DEMO: resolve_reveal
Hook: 像が整って現れる
BestUse: 見出し / Hero / 重要導線
Risk: 遅いと重い、blur強すぎ禁止（<=0.3px）
Knobs: y, duration, blur
Kill: reduced-motionで即表示
*/

<h1 className="resolve">Resolve Reveal</h1>

/* CSS例（速め）
.resolve{
  opacity:0;
  transform:translate3d(0,18px,0) scale(.992);
  filter:blur(.18px);
  animation:resolve 680ms cubic-bezier(.22,1,.36,1) both;
}
@keyframes resolve{
  to{ opacity:1; transform:translate3d(0,0,0) scale(1); filter:blur(0px); }
}
*/`,
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EXPRESSIONS;
    return EXPRESSIONS.filter((e) => {
      const hay = `${e.name} ${e.tags.join(" ")} ${e.hook}`.toLowerCase();
      return hay.includes(q);
    });
  }, [EXPRESSIONS, query]);

  const active = useMemo(
    () => EXPRESSIONS.find((e) => e.id === activeId) ?? EXPRESSIONS[0],
    [EXPRESSIONS, activeId]
  );

  const ActiveDemo = active.Demo;

  async function onCopyPack() {
    const ok = await copy(active.pack);
    setCopied(ok ? active.id : "failed");
    window.clearTimeout(onCopyPack._t);
    onCopyPack._t = window.setTimeout(() => setCopied(""), 900);
  }

  return (
    <div className={styles.shell}>
      {/* Left: Index */}
      <aside className={styles.left}>
        <div className={styles.leftHead}>
          <div className={styles.brand}>EXPRESSION LAB</div>
          <div className={styles.room}>ROOM 01</div>
        </div>

        <input
          className={styles.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search… (veil / reveal / entrance)"
        />

        <div className={styles.list}>
          {filtered.map((e) => {
            const is = e.id === activeId;
            return (
              <button
                key={e.id}
                className={`${styles.item} ${is ? styles.itemActive : ""}`}
                onClick={() => setActiveId(e.id)}
              >
                <div className={styles.itemTop}>
                  <span className={styles.itemName}>{e.name}</span>
                  <span className={styles.itemId}>{e.id}</span>
                </div>
                <div className={styles.tags}>
                  {e.tags.map((t) => (
                    <span className={styles.tag} key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className={styles.leftFoot}>
          <div className={styles.footLine}>
            motion: <span className={styles.mono}>{reduced ? "reduced" : "normal"}</span>
          </div>
          <div className={styles.footLine}>
            rule: <span className={styles.mono}>Vault=原石 / 移植=減らす</span>
          </div>
        </div>
      </aside>

      {/* Center: Stage */}
      <main className={styles.center}>
        <div className={styles.stageFrame}>
          <ActiveDemo reduced={reduced} />
        </div>
      </main>

      {/* Right: Recipe + Code */}
      <aside className={styles.right}>
        <div className={styles.meta}>
          <div className={styles.metaTitle}>{active.name}</div>
          <div className={styles.metaRow}>
            <div className={styles.metaK}>Hook</div>
            <div className={styles.metaV}>{active.hook}</div>
          </div>
          <div className={styles.metaRow}>
            <div className={styles.metaK}>BestUse</div>
            <div className={styles.metaV}>{active.bestUse}</div>
          </div>
          <div className={styles.metaRow}>
            <div className={styles.metaK}>Risk</div>
            <div className={styles.metaV}>{active.risk}</div>
          </div>
          <div className={styles.metaRow}>
            <div className={styles.metaK}>Knobs</div>
            <div className={styles.metaV}>{active.knobs}</div>
          </div>
          <div className={styles.metaRow}>
            <div className={styles.metaK}>Kill</div>
            <div className={styles.metaV}>{active.kill}</div>
          </div>
        </div>

        <div className={styles.codeHead}>
          <div className={styles.codeTitle}>Pack</div>
          <button className={styles.copyBtn} onClick={onCopyPack}>
            {copied === active.id ? "copied" : "copy"}
          </button>
        </div>

        <pre className={styles.code}>
          <code>{active.pack}</code>
        </pre>
      </aside>
    </div>
  );
}