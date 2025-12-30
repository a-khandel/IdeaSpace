import { memo, useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "./lib/supabaseClient"
import { useAuth } from "./auth"

// Memoized Auth component to prevent re-renders from parent
const MemoizedAuth = memo(function MemoizedAuth({ appearance }: { appearance: any }) {
  return (
    <Auth
      supabaseClient={supabase}
      appearance={appearance}
      providers={[]}
    />
  )
})

export default function SignIn() {
  const [tiltEnabled, setTiltEnabled] = useState(true)
  const { session, loading } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from || "/dashboard"

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  useEffect(() => {
    if (session && !loading) nav(from, { replace: true })
  }, [session, loading, nav, from])

  const year = useMemo(() => new Date().getFullYear(), [])

  const authAppearance = useMemo(
    () => ({
      theme: ThemeSupa,
      variables: {
        default: {
          colors: {
            brand: "rgba(99,102,241,1)",
            brandAccent: "rgba(16,185,129,1)",

            // Light theme inputs
            inputBackground: "rgba(255,255,255,.95)",
            inputBorder: "rgba(15,23,42,.14)",
            inputText: "rgba(15,23,42,.92)",
            inputPlaceholder: "rgba(15,23,42,.38)",
            messageText: "rgba(15,23,42,.72)",
          },
          radii: {
            borderRadiusButton: "12px",
            buttonBorderRadius: "12px",
            inputBorderRadius: "12px",
          },
        },
      },
    }),
    []
  )

  return (
    <main
      style={{
        minHeight: "100svh",
        width: "100%",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,.18), transparent 60%)," +
          "radial-gradient(1000px 500px at 90% 30%, rgba(16,185,129,.12), transparent 55%)," +
          "radial-gradient(900px 500px at 30% 90%, rgba(236,72,153,.10), transparent 55%)," +
          "linear-gradient(180deg, #ffffff, #f6f7ff 55%, #ffffff)",
      }}
    >
      {/* animated background blobs */}
      <div style={blobStyle({ top: -140, left: -160, size: 420, alpha: 0.22, hue: 220 })} />
      <div style={blobStyle({ top: 80, right: -180, size: 520, alpha: 0.18, hue: 155, delay: "0.4s" })} />
      <div style={blobStyle({ bottom: -180, left: 120, size: 560, alpha: 0.14, hue: 320, delay: "0.8s" })} />

      <div
        style={{
          width: "min(520px, calc(100vw - 32px))",
          position: "relative",
          zIndex: 2,
        }}
      >
        <button
          onClick={() => nav("/")}
          style={{
            ...secondaryBtn,
            marginBottom: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ← Back
        </button>

        <section
          onMouseMove={(e) => {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
            const px = (e.clientX - rect.left) / rect.width
            const py = (e.clientY - rect.top) / rect.height
            const ry = (px - 0.5) * 8
            const rx = (0.5 - py) * 8
            setTilt({ rx, ry })
          }}
          onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
          style={{
            borderRadius: 22,
            padding: 22,
            border: "1px solid rgba(15,23,42,.10)",
            background: "rgba(255, 255, 255, 0.72)",
            boxShadow: "0 30px 90px rgba(15,23,42,.14)",
            backdropFilter: "blur(10px)",
            transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transition: "transform 160ms ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ color: "#0f172a", fontSize: 18, fontWeight: 900 }}>Sign in</div>
              <div style={{ color: "rgba(15,23,42,.65)", fontSize: 12, marginTop: 4 }}>
                Use email + password to continue.
              </div>
            </div>

            <div style={{ color: "rgba(15,23,42,.45)", fontSize: 12 }}>© {year}</div>
          </div>

          <div style={{ marginTop: 12 }}>
            <MemoizedAuth appearance={authAppearance} />
          </div>

          <div style={{ marginTop: 12, color: "rgba(15,23,42,.55)", fontSize: 12 }}>
            Tip: use a strong password — your canvases are private.
          </div>
        </section>
      </div>

      <style>{`
        @keyframes floaty {
          0% { transform: translate3d(0,0,0) scale(1); filter: blur(0px); }
          50% { transform: translate3d(0,-14px,0) scale(1.03); filter: blur(0.3px); }
          100% { transform: translate3d(0,0,0) scale(1); filter: blur(0px); }
        }
      `}</style>
    </main>
  )
}

const secondaryBtn: React.CSSProperties = {
  border: "1px solid rgba(15,23,42,.12)",
  background: "rgba(255,255,255,.7)",
  color: "#0f172a",
  padding: "10px 12px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 12,
  boxShadow: "0 10px 28px rgba(15,23,42,.08)",
}

function blobStyle(opts: {
  top?: number
  left?: number
  right?: number
  bottom?: number
  size: number
  alpha: number
  hue: number
  delay?: string
}): React.CSSProperties {
  const { size, alpha, hue, delay } = opts
  return {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: size,
    background: `radial-gradient(circle at 30% 30%, hsla(${hue}, 90%, 60%, ${alpha}), transparent 60%)`,
    top: opts.top,
    left: opts.left,
    right: opts.right,
    bottom: opts.bottom,
    animation: "floaty 6s ease-in-out infinite",
    animationDelay: delay ?? "0s",
    pointerEvents: "none",
  }
}
