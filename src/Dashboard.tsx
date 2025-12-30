import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getCanvases,
  createCanvas,
  updateCanvasMeta,
  renameCanvas,
  deleteCanvas,
} from "./storage/storage"
import { CanvasMeta } from "./types/canvas"
import { supabase } from "./lib/supabaseClient"

export default function Dashboard() {
  const navigate = useNavigate()

  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [canvases, setCanvases] = useState<CanvasMeta[]>([])

  useEffect(() => {
    let mounted = true

    async function refresh(uid: string) {
      const list = await getCanvases(uid)
      if (mounted) setCanvases(list)
    }

    async function init() {
      const { data } = await supabase.auth.getSession()
      const uid = data.session?.user?.id ?? null
      if (!mounted) return

      setOwnerId(uid)
      setAuthLoading(false)

      if (!uid) {
        navigate("/signin", { replace: true })
        return
      }
      await refresh(uid)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id ?? null
      setOwnerId(uid)
      setAuthLoading(false)

      if (!uid) {
        setCanvases([])
        navigate("/signin", { replace: true })
      } else {
        await refresh(uid)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  if (authLoading) return <div style={{ padding: 20 }}>Loading…</div>
  if (!ownerId) return null

  const refresh = async () => setCanvases(await getCanvases(ownerId))

  const onOpenCanvas = async (canvasId: string) => {
    await updateCanvasMeta(ownerId, canvasId, {})
    await refresh()
    navigate(`/app/${canvasId}`)
  }

  const onNewCanvas = async () => {
    const canvas = await createCanvas(ownerId)
    await refresh()
    navigate(`/app/${canvas.id}`)
  }

  return (
    <div style={styles.page}>
      <header style={styles.topbar}>
        <div style={styles.brandRow}>
          <div style={styles.logoMark}>◎</div>
          <div>
            <div style={styles.brand}>IdeaSpace</div>
            <div style={styles.tagline}>Your canvases</div>
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button style={styles.primaryBtn} onClick={onNewCanvas}>
            + New Canvas
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              navigate("/signin", { replace: true })
            }}
            style={styles.ghostBtn}
          >
            Sign out
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.grid}>
          {canvases.map((c) => (
            <button
              key={c.id}
              style={styles.card}
              onClick={() => onOpenCanvas(c.id)}
              title="Open canvas"
            >
              <div style={styles.thumb}>
                {c.thumbnail && (
                  <img src={c.thumbnail} alt="Canvas preview" style={styles.thumbImg} />
                )}
              </div>

              <input
                value={c.title}
                onChange={async (e) => {
                  await renameCanvas(ownerId, c.id, e.target.value)
                  await refresh()
                }}
                onClick={(e) => e.stopPropagation()}
                style={styles.titleInput}
              />

              <div style={styles.metaRow}>
                <div style={styles.cardSub}>Edited {new Date(c.updatedAt).toLocaleDateString()}</div>

                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    const ok = confirm(`Delete "${c.title}"?`)
                    if (!ok) return
                    await deleteCanvas(ownerId, c.id)
                    await refresh()
                  }}
                  style={styles.deleteBtn}
                  title="Delete canvas"
                >
                  Delete
                </button>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1000px 600px at 20% 0%, rgba(99,102,241,0.12), transparent 60%)," +
      "radial-gradient(900px 520px at 90% 10%, rgba(16,185,129,0.10), transparent 60%)," +
      "linear-gradient(180deg, #ffffff, #f6f7ff 60%, #ffffff)",
    color: "#0f172a",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    height: 68,
    display: "flex",
    alignItems: "center",
    padding: "0 18px",
    borderBottom: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(10px)",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 10 },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(236,72,153,1))",
    color: "white",
    fontWeight: 900,
    boxShadow: "0 12px 36px rgba(99,102,241,0.18)",
  },
  brand: { fontWeight: 900, letterSpacing: 0.2 },
  tagline: { opacity: 0.65, fontSize: 12, marginTop: 2 },
  main: {
    maxWidth: 1100,
    width: "100%",
    margin: "0 auto",
    padding: "22px 18px",
  },
  primaryBtn: {
    border: "none",
    background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(236,72,153,1))",
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
    boxShadow: "0 14px 40px rgba(99,102,241,0.20)",
  },
  ghostBtn: {
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.7)",
    color: "#0f172a",
    padding: "10px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 900,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 14,
  },
  card: {
    textAlign: "left",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 16,
    padding: 12,
    background: "rgba(255,255,255,0.78)",
    cursor: "pointer",
    boxShadow: "0 18px 60px rgba(15,23,42,0.10)",
  },
  thumb: {
    height: 130,
    borderRadius: 12,
    background: "rgba(99,102,241,0.06)",
    marginBottom: 10,
    overflow: "hidden",
    border: "1px solid rgba(15,23,42,0.08)",
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  titleInput: {
    border: "1px solid transparent",
    fontWeight: 900,
    width: "100%",
    background: "transparent",
    cursor: "text",
    color: "#0f172a",
    outline: "none",
    padding: "6px 8px",
    borderRadius: 10,
  },
  metaRow: {
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardSub: { fontSize: 12, opacity: 0.6 },
  deleteBtn: {
    fontSize: 12,
    background: "transparent",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "rgba(220,38,38,0.95)",
    padding: "6px 10px",
    borderRadius: 10,
    cursor: "pointer",
  },
}
