import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

const COMMANDS = [
  "“Make a flowchart for my semester plan”",
  "“Add a decision node for ‘study vs gym’”",
  "“Connect classes → deadlines”",
  "“Group these ideas into 3 buckets”",
  "“Turn this brainstorm into a clean diagram”",
]

export default function Welcome() {
  const nav = useNavigate()
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [cmdIdx, setCmdIdx] = useState(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  useEffect(() => {
    const id = window.setInterval(
      () => setCmdIdx((i) => (i + 1) % COMMANDS.length),
      2600
    )
    return () => window.clearInterval(id)
  }, [])

  const glowStyle = useMemo(() => {
    return {
      background: `radial-gradient(700px circle at ${mouse.x}px ${mouse.y}px, rgba(99,102,241,0.16), transparent 45%)`,
    } as const
  }, [mouse.x, mouse.y])

  return (
    <div style={styles.page}>
      <div style={{ ...styles.glow, ...glowStyle }} />

      <header style={styles.topbar}>
        <div style={styles.brand}>
          <div style={styles.logoMark}>I</div>
          <div>
            <div style={styles.brandName}>IdeaSpace</div>
            <div style={styles.brandTag}>Voice → Diagram → Clarity</div>
          </div>
        </div>

        <div style={styles.topbarRight}>
          <button style={styles.ghostBtn} onClick={() => nav("/signin")}>
            Sign in
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.heroLeft}>
            <div style={styles.typeRow}>
              <span style={styles.bigLogo}>IdeaSpace</span>
            </div>

            <h1 style={styles.h1}>
              Turn messy thoughts into clean diagrams with{" "}
              <span style={styles.gradText}>your voice</span>.
            </h1>

            <p style={styles.sub}>
              IdeaSpace is a voice-driven whiteboard where your canvases save
              automatically and stay private to your account.
            </p>

            <div style={styles.ticker}>
              <div style={styles.tickerLabel}>Try saying:</div>
              <div style={styles.tickerBubble} key={cmdIdx}>
                {COMMANDS[cmdIdx]}
              </div>
            </div>

            <div style={styles.ctaRow}>
              <button style={styles.primaryBtnBig} onClick={() => nav("/signin")}>
                Sign in to your dashboard →
              </button>
            </div>

            <div style={styles.smallNote}>
              Tip: if you’re signed out, the dashboard will redirect you to sign in.
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.previewCard}>
              <div style={styles.previewTop}>
                <div style={styles.dotRow}>
                  <span style={{ ...styles.dot, background: "#ff5f57" }} />
                  <span style={{ ...styles.dot, background: "#febc2e" }} />
                  <span style={{ ...styles.dot, background: "#28c840" }} />
                </div>
                <div style={styles.previewTitle}>Example</div>
              </div>

              <div style={styles.previewBody}>
                <div style={styles.previewGrid}>
                  <div style={styles.previewChip}>“Make a flowchart”</div>
                  <div style={styles.previewChip}>“Add decision node”</div>
                  <div style={styles.previewChip}>“Connect A → B”</div>
                  <div style={styles.previewChip}>“Group these ideas”</div>
                </div>

                <div style={styles.previewCanvasMock}>
                  <div style={styles.mockBox} />
                  <div style={styles.mockArrow}>→</div>
                  <div style={{ ...styles.mockBox, opacity: 0.7 }} />
                </div>
              </div>
            </div>

            <div style={styles.featureRow}>
              <Feature title="Private Canvases" desc="Only accessible after sign in." />
              <Feature title="Autosave" desc="Never lose work (saving indicator)." />
              <Feature title="Fast" desc="Vite + React Router flow." />
            </div>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <span style={{ opacity: 0.7 }}>© {new Date().getFullYear()} IdeaSpace</span>
        <span style={{ opacity: 0.7 }}>StanfordXR Hackathon Project</span>
      </footer>

      <style>{`
        @keyframes popIn {
          from { transform: translateY(6px); opacity: 0; }
          to { transform: translateY(0px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={styles.featureCard}>
      <div style={styles.featureTitle}>{title}</div>
      <div style={styles.featureDesc}>{desc}</div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    position: "relative",
    background:
      "radial-gradient(1000px 520px at 15% 5%, rgba(99,102,241,0.12), transparent 55%)," +
      "radial-gradient(900px 520px at 90% 15%, rgba(16,185,129,0.10), transparent 55%)," +
      "linear-gradient(180deg, #ffffff, #f6f7ff 60%, #ffffff)",
    color: "#0f172a",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  glow: { position: "absolute", inset: 0, pointerEvents: "none" },

  topbar: {
    position: "relative",
    zIndex: 2,
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { display: "flex", gap: 12, alignItems: "center" },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(236,72,153,1))",
    color: "white",
    boxShadow: "0 10px 30px rgba(99,102,241,0.22)",
  },
  brandName: { fontWeight: 900, letterSpacing: 0.2, fontSize: 14 },
  brandTag: { opacity: 0.7, fontSize: 12 },

  topbarRight: { display: "flex", gap: 10, alignItems: "center" },

  main: {
    position: "relative",
    zIndex: 2,
    padding: "10px 22px 28px",
    flex: 1,
    display: "flex",
  },
  hero: {
    maxWidth: 1120,
    width: "100%",
    margin: "0 auto",
    paddingTop: 18,
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: 22,
    alignItems: "center",
  },

  heroLeft: { padding: "28px 6px" },

  h1: { margin: "14px 0 10px", fontSize: 44, lineHeight: 1.05, letterSpacing: -0.8 },
  gradText: {
    background: "linear-gradient(90deg, rgba(99,102,241,1), rgba(236,72,153,1))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  sub: { margin: 0, opacity: 0.78, fontSize: 15, lineHeight: 1.6, maxWidth: 520 },

  ticker: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  tickerLabel: { fontSize: 12, opacity: 0.65 },
  tickerBubble: {
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.75)",
    padding: "8px 10px",
    borderRadius: 999,
    fontSize: 12,
    animation: "popIn 220ms ease-out",
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
  },

  ctaRow: { marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" },
  ghostBtn: {
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.7)",
    color: "#0f172a",
    padding: "8px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 10px 26px rgba(15,23,42,0.08)",
  },
  primaryBtnBig: {
    border: "none",
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(236,72,153,1))",
    color: "white",
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 18px 50px rgba(99,102,241,0.22)",
  },
  smallNote: { marginTop: 10, fontSize: 12, opacity: 0.6 },

  heroRight: { padding: "18px 0" },

  previewCard: {
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.72)",
    overflow: "hidden",
    boxShadow: "0 26px 90px rgba(15,23,42,0.10)",
  },
  previewTop: {
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(255,255,255,0.55)",
  },
  dotRow: { display: "flex", gap: 6, alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 999 },
  previewTitle: { fontSize: 12, opacity: 0.7 },

  previewBody: { padding: 14 },
  previewGrid: { display: "flex", gap: 8, flexWrap: "wrap" },
  previewChip: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.75)",
    fontSize: 12,
    opacity: 0.9,
  },
  previewCanvasMock: {
    marginTop: 14,
    height: 140,
    borderRadius: 14,
    border: "1px dashed rgba(15,23,42,0.18)",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.9))",
  },
  mockBox: {
    width: 120,
    height: 60,
    borderRadius: 14,
    background: "rgba(99,102,241,0.10)",
    border: "1px solid rgba(99,102,241,0.22)",
    display: "inline-block",
  },
  mockArrow: { display: "inline-block", margin: "0 10px", opacity: 0.7, fontSize: 18 },

  featureRow: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
  },
  featureCard: {
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.72)",
    padding: 12,
    boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
  },
  featureTitle: { fontWeight: 900, fontSize: 12, marginBottom: 4 },
  featureDesc: { fontSize: 12, opacity: 0.7, lineHeight: 1.4 },

  footer: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 22px",
    borderTop: "none",
    marginTop: 0,
  },

  bigLogo: {
    fontWeight: 950,
    letterSpacing: "-1px",
    fontSize: "clamp(54px, 7vw, 84px)",
    lineHeight: 1,
    background: "linear-gradient(90deg, rgba(99,102,241,1), rgba(236,72,153,1))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  },
  typeRow: { display: "flex", alignItems: "center", gap: 12 },
}
