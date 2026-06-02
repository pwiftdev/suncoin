import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useMemo, useRef, useState } from "react";

const CONTRACT = "5cwKHEEj52u3brpeu5LD9cU21uwMKRJFB3o7E7wrpump";

/* ---------- Reusable comic cloud (single clean outline) ---------- */
function Cloud({ scale = 1, opacity = 1 }) {
  return (
    <svg
      className="cloud-svg"
      viewBox="0 0 220 120"
      style={{ transform: `scale(${scale})`, opacity }}
      aria-hidden="true"
    >
      <path
        d="M34 96 C8 96 6 64 30 60 C24 36 58 28 70 44 C76 20 114 18 122 44 C133 27 166 32 163 56 C190 53 196 92 168 96 Z"
        fill="#ffffff"
        stroke="#111111"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Twinkling starfield (fades out at dawn) ---------- */
function Stars({ opacity }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 65,
        size: 1 + Math.random() * 2.6,
        delay: Math.random() * 3,
        dur: 1.5 + Math.random() * 2.5,
      })),
    []
  );

  return (
    <motion.div className="stars" style={{ opacity }} aria-hidden="true">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </motion.div>
  );
}

/* ---------- The fixed cinematic stage driven by scroll ---------- */
function Stage({ progress }) {
  const p = useSpring(progress, { stiffness: 80, damping: 24, mass: 0.4 });

  const nightOpacity = useTransform(p, [0, 0.32], [1, 0]);
  const dawnOpacity = useTransform(p, [0.04, 0.32, 0.6], [0, 1, 0]);
  const dayOpacity = useTransform(p, [0.42, 0.72], [0, 1]);
  const starsOpacity = useTransform(p, [0, 0.26], [1, 0]);

  const sunY = useTransform(p, [0, 0.7], ["58vh", "-14vh"]);
  const sunScale = useTransform(p, [0, 0.7], [0.78, 1.12]);
  const glowOpacity = useTransform(p, [0.08, 0.62], [0.15, 1]);
  const haloScale = useTransform(p, [0.08, 0.62], [0.7, 1.25]);

  const groundY = useTransform(p, [0.06, 0.52], ["102%", "0%"]);
  const hillBackY = useTransform(p, [0.06, 0.52], ["120%", "0%"]);

  const cloudsAX = useTransform(p, [0, 1], ["-6%", "46%"]);
  const cloudsBX = useTransform(p, [0, 1], ["8%", "-44%"]);
  const cloudsCX = useTransform(p, [0, 1], ["0%", "30%"]);

  // Blades placed along the hill's bezier top edge so they follow ground level.
  const blades = useMemo(() => {
    const segs = [
      { p0: [0, 120], c1: [220, 40], c2: [420, 60], p3: [720, 120] },
      { p0: [720, 120], c1: [1020, 180], c2: [1240, 70], p3: [1440, 120] },
    ];
    const bez = (a, b, c, d, t) => {
      const u = 1 - t;
      return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
    };
    const N = 70;
    return Array.from({ length: N }, (_, i) => {
      const g = i / (N - 1);
      const s = g < 0.5 ? segs[0] : segs[1];
      const t = g < 0.5 ? g * 2 : (g - 0.5) * 2;
      const x = bez(s.p0[0], s.c1[0], s.c2[0], s.p3[0], t);
      const y = bez(s.p0[1], s.c1[1], s.c2[1], s.p3[1], t);
      return { i, left: (x / 1440) * 100, top: (y / 320) * 100 };
    });
  }, []);

  return (
    <div className="stage" aria-hidden="true">
      <motion.div className="sky sky-night" style={{ opacity: nightOpacity }} />
      <motion.div className="sky sky-dawn" style={{ opacity: dawnOpacity }} />
      <motion.div className="sky sky-day" style={{ opacity: dayOpacity }} />

      <Stars opacity={starsOpacity} />

      {/* far clouds */}
      <motion.div className="cloud-layer back" style={{ x: cloudsAX }}>
        <div className="cloud-slot" style={{ top: "16%", left: "8%" }}>
          <motion.div animate={{ x: [0, 26, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}>
            <Cloud scale={0.7} opacity={0.9} />
          </motion.div>
        </div>
        <div className="cloud-slot" style={{ top: "30%", left: "70%" }}>
          <motion.div animate={{ x: [0, -22, 0] }} transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}>
            <Cloud scale={0.55} opacity={0.8} />
          </motion.div>
        </div>
      </motion.div>

      {/* the rising coin-sun */}
      <motion.div className="sun-wrap" style={{ x: "-50%", y: sunY, scale: sunScale }}>
        <motion.div className="sun-halo" style={{ opacity: glowOpacity, scale: haloScale }} />
        <motion.div
          className="sun-img"
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        >
          <img src="/suncoinnobg.png" alt="" />
        </motion.div>
      </motion.div>

      {/* near clouds (in front of sun) */}
      <motion.div className="cloud-layer mid" style={{ x: cloudsBX }}>
        <div className="cloud-slot" style={{ top: "40%", left: "18%" }}>
          <motion.div animate={{ x: [0, 34, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}>
            <Cloud scale={1} />
          </motion.div>
        </div>
        <div className="cloud-slot" style={{ top: "54%", left: "62%" }}>
          <motion.div animate={{ x: [0, -30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}>
            <Cloud scale={1.25} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div className="cloud-layer front" style={{ x: cloudsCX }}>
        <div className="cloud-slot" style={{ top: "62%", left: "30%" }}>
          <motion.div animate={{ x: [0, 40, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}>
            <Cloud scale={1.6} />
          </motion.div>
        </div>
      </motion.div>

      {/* rolling hills + grass growing up */}
      <motion.div className="hill hill-back" style={{ y: hillBackY }} />
      <motion.div className="ground" style={{ y: groundY }}>
        <svg className="hill-svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            d="M0 120 C 220 40 420 60 720 120 C 1020 180 1240 70 1440 120 L1440 320 L0 320 Z"
            fill="#5bb33a"
            stroke="#111"
            strokeWidth="6"
          />
        </svg>
        <div className="grass-row">
          {blades.map((blade) => (
            <span
              key={blade.i}
              className="blade-anchor"
              style={{ left: `${blade.left}%`, top: `${blade.top}%` }}
            >
              <motion.span
                className="blade"
                animate={{
                  rotate: [
                    (-3 + (blade.i % 3)) * 1.2,
                    (3 - (blade.i % 3)) * 1.2,
                    (-3 + (blade.i % 3)) * 1.2,
                  ],
                }}
                transition={{ duration: 2.4 + (blade.i % 5) * 0.3, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- Header ---------- */
function Header() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      /* clipboard not available */
    }
  };

  return (
    <header className="header">
      <div className="brand">
        <img src="/logo.png" alt="$SUN logo" className="brand-logo" />
        <span className="brand-name">$SUN</span>
      </div>
      <nav className="nav">
        <a href="#story">Story</a>
        <a href="#compare">Why $SUN</a>
        <a href="#buy">Buy</a>
        <a href="https://x.com/Suncoinpf" target="_blank" rel="noreferrer noopener">
          X Community
        </a>
      </nav>
      <button className={`ca-pill ${copied ? "copied" : ""}`} onClick={copy} title="Copy contract">
        {copied ? "COPIED!" : `CA: ${CONTRACT.slice(0, 4)}…${CONTRACT.slice(-4)}`}
      </button>
    </header>
  );
}

/* ---------- App ---------- */
export default function App() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll();

  return (
    <div className="app" ref={ref}>
      <Stage progress={scrollYProgress} />
      <div className="noise" />
      <Header />

      {/* HERO */}
      <section className="screen hero">
        <motion.div
          className="hero-inner"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div className="kicker">SUNCOIN · SOLANA</div>
          <h1 className="mega">
            THE SUN
            <br />
            ALWAYS RISES
          </h1>
          <p className="lead">
            Everything else pumps, dumps, and disappears. The <strong>$SUN</strong> rises every
            single day — and never forgets to come back.
          </p>
          <div className="cta-row">
            <a className="btn btn-sun" href="#buy">
              ☀ Buy $SUN
            </a>
            <a className="btn btn-ghost" href="#story">
              Scroll into the light ↓
            </a>
          </div>
        </motion.div>
        <motion.div
          className="scroll-hint"
          animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          ▼ scroll
        </motion.div>
      </section>

      {/* STORY PANELS */}
      <section id="story" className="screen story">
        <div className="story-grid">
          {[
            {
              t: "Nightfall",
              b: "In the dark, charts scream and candles roar. Every hype train promises forever… then the lights go out.",
              r: -2.5,
            },
            {
              t: "First Light",
              b: "But on schedule — never late, never asking — the horizon catches fire. Not luck. A law of the universe.",
              r: 2,
            },
            {
              t: "The Rise",
              b: "$SUN climbs again. Every dawn is chapter one. While others stay buried, the sun keeps coming back.",
              r: -1.5,
            },
          ].map((panel, i) => (
            <motion.article
              key={panel.t}
              className="panel"
              initial={{ opacity: 0, y: 80, rotate: panel.r }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              whileHover={{ rotate: panel.r / 2, y: -6 }}
            >
              <span className="panel-num">{i + 1}</span>
              <h3>{panel.t}</h3>
              <p>{panel.b}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* COMPARE */}
      <section id="compare" className="screen compare">
        <motion.div
          className="compare-card"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
        >
          <div className="compare-col">
            <h4>Other coins</h4>
            <motion.div
              className="line down"
              animate={{ y: [0, 8, 0], rotate: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ↘ rise · fall · gone
            </motion.div>
          </div>
          <div className="vs">VS</div>
          <div className="compare-col">
            <h4>$SUN</h4>
            <motion.div
              className="line up"
              animate={{ y: [0, -8, 0], rotate: [0, -1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ↗ rise · set · RISE AGAIN
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* BUY */}
      <section id="buy" className="screen buy">
        <motion.div
          className="buy-card"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
        >
          <h2>Catch the sunrise</h2>
          <p>Grab a bag and rise with it. Contract:</p>
          <code className="ca-full">{CONTRACT}</code>
          <div className="cta-row center">
            <a className="btn btn-sun" href={`https://pump.fun/${CONTRACT}`} target="_blank" rel="noreferrer noopener">
              Buy on Pump.fun
            </a>
            <a
              className="btn btn-ghost"
              href={`https://dexscreener.com/solana/${CONTRACT}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              View chart
            </a>
          </div>
        </motion.div>
      </section>

      {/* FINALE */}
      <section className="screen finale">
        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ type: "spring", stiffness: 160, damping: 14 }}
        >
          RISE. SET. RISE AGAIN.
        </motion.h2>
        <p>Not financial advice — pure cosmic meme energy. The sun never rage quits. ☀</p>
        <footer className="foot">$SUN · suncoin · {new Date().getFullYear()}</footer>
      </section>
    </div>
  );
}
