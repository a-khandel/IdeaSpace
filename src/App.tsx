import { useEffect, useMemo, useState, useRef } from "react"
import {
  DefaultSizeStyle,
  ErrorBoundary,
  TLComponents,
  Tldraw,
  TldrawUiToastsProvider,
  TLUiOverrides,
  useEditor,
} from "tldraw"
import { useNavigate, useParams } from "react-router-dom"

import { TldrawAgent } from "./agent/TldrawAgent"
import { useTldrawAgent } from "./agent/useTldrawAgent"
import { ChatPanel } from "./components/ChatPanel"
import { ChatPanelFallback } from "./components/ChatPanelFallback"
import { CustomHelperButtons } from "./components/CustomHelperButtons"
import { AgentViewportBoundsHighlight } from "./components/highlights/AgentViewportBoundsHighlights"
import { ContextHighlights } from "./components/highlights/ContextHighlights"
import { SuggestionsBox } from "./components/SuggestionsBox"
import { TargetAreaTool } from "./tools/TargetAreaTool"
import { TargetShapeTool } from "./tools/TargetShapeTool"
import { BackToDashboardButton } from "./components/DashButton"

import {
  loadCanvasDocument,
  saveCanvasDocument,
  updateCanvasThumbnail,
} from "./storage/storage"

import { supabase } from "./lib/supabaseClient"

export const AGENT_ID = "agent-starter"

DefaultSizeStyle.setDefaultValue("s")

const tools = [TargetAreaTool, TargetShapeTool]
const overrides: TLUiOverrides = {
  tools: (editor, tools) => ({
    ...tools,
    "target-area": {
      id: "target-area",
      label: "Pick Area",
      kbd: "c",
      icon: "tool-frame",
      onSelect() {
        editor.setCurrentTool("target-area")
      },
    },
    "target-shape": {
      id: "target-shape",
      label: "Pick Shape",
      kbd: "s",
      icon: "tool-frame",
      onSelect() {
        editor.setCurrentTool("target-shape")
      },
    },
  }),
}

function App() {
  const [agent, setAgent] = useState<TldrawAgent | undefined>()
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const components: TLComponents = useMemo(() => {
    return {
      HelperButtons: () => agent && <CustomHelperButtons agent={agent} />,
      InFrontOfTheCanvas: () => (
        <>
          <BackToDashboardButton />
          {agent && <AgentViewportBoundsHighlight agent={agent} />}
          {agent && <ContextHighlights agent={agent} />}
        </>
      ),
    }
  }, [agent])

  // Microphone button logic
  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new window.MediaRecorder(stream)
      audioChunksRef.current = []
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log('Audio chunk received:', event.data.size, 'bytes')
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        alert('Recording error occurred. Please try again.')
        setIsRecording(false)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...')
        setIsTranscribing(true)

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        console.log('Audio blob size:', audioBlob.size, 'bytes')

        if (audioBlob.size < 100) {
          alert('Recording too short or empty. Please try again.')
          setIsTranscribing(false)
          return
        }

        const formData = new FormData()
        formData.append('audio', audioBlob, 'audio.webm')
        try {
          // Step 1: Transcribe audio
          const response = await fetch('http://localhost:8789/transcribe', {
            method: 'POST',
            body: formData,
          })
          const data = (await response.json()) as { success?: boolean; transcript?: string; error?: string }
          if (data.success && data.transcript) {
            // Step 2: Send transcript to /process for tldraw command
            const processRes = await fetch('http://localhost:8789/process', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: data.transcript })
            })
            const processData = (await processRes.json()) as { success?: boolean; actions?: any[]; transcript?: string; error?: string }
            if (processData.success && agent) {
              // Step 3: Pass transcript to tldraw agent to draw
              await agent.prompt({ message: data.transcript })
            } else {
              alert('Drawing failed: ' + (processData.error || 'Unknown error'))
            }
          } else {
            alert('Transcription failed: ' + (data.error || 'Unknown error'))
          }
        } catch (err) {
          alert('Failed to transcribe audio: ' + err)
        }
        setIsTranscribing(false)
      }

      // Start recording with 100ms timeslice to ensure data is captured
      mediaRecorder.start(100)
      setIsRecording(true)
    } catch (err) {
      alert('Microphone access denied or not available.')
    }
  }

  return (
    <TldrawUiToastsProvider>
      <div className="tldraw-agent-container" style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <button
          type="button"
          style={{
            position: 'absolute',
            top: 775,
            right: 466,
            zIndex: 2000,
            background: 'rgba(250, 250, 250, 1)',
            border: 'none',
            borderRadius: 16,
            padding: 8,
            margin: 0,
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(60, 60, 99, 0.15)',
            transition: 'background 0.2s',
            width: 49,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
          onClick={handleMicClick}
        >
          <span style={{ fontSize: 25, lineHeight: 1 }}>{isRecording ? '⏺️' : '🎤'}</span>
        </button>
        {(isRecording || isTranscribing) && (
          <div style={{
            position: 'absolute',
            top: 780,
            left: 830,
            zIndex: 2100,
            background: '#222',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 14,
            opacity: 0.95,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            {isRecording ? 'Recording…' : 'Transcribing…'}
          </div>
        )}
        <div
          className="tldraw-canvas"
          style={{ width: '100vw', height: '100vh', position: 'absolute', left: 0, top: 0 }}
        >
          <Tldraw tools={tools} overrides={overrides} components={components}>
            <AppInner setAgent={setAgent} />
          </Tldraw>
        </div>
        {/* Floating SuggestionsBox on the right side. Edit position here! */}
        {agent && (
          <div
            style={{
              position: 'fixed',
              top: 300,
              right: 5,
              zIndex: 3000,
              background: 'none',
              boxShadow: 'none',
              border: 'none',
              padding: 0,
              minWidth: 0,
              maxWidth: 'none',
            }}
          >
            <SuggestionsBox onSuggestion={async (suggestion) => {
              // Send suggestion to backend /process and let agent draw
              const processRes = await fetch('http://localhost:8789/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: suggestion })
              })
              const processData = (await processRes.json()) as { success?: boolean; actions?: any[]; transcript?: string; error?: string }
              if (processData.success && agent) {
                await agent.prompt({ message: suggestion })
              } else {
                alert('Failed to add suggestion: ' + (processData.error || 'Unknown error'))
              }
            }} />
          </div>
        )}
      </div>
    </TldrawUiToastsProvider>
  )
}

function AppInner({ setAgent }: { setAgent: (agent: TldrawAgent) => void }) {
  const [canvasMissing, setCanvasMissing] = useState(false)
  const editor = useEditor()
  const agent = useTldrawAgent(editor, AGENT_ID)
  const { canvasId } = useParams()
  const navigate = useNavigate()

  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // 🔥 Saving indicator state
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  // --- Auth gate ---
  useEffect(() => {
    let mounted = true

    async function init() {
      const { data } = await supabase.auth.getSession()
      const uid = data.session?.user?.id ?? null
      if (!mounted) return

      setOwnerId(uid)
      setAuthLoading(false)

      if (!uid) navigate("/signin", { replace: true })
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null
      setOwnerId(uid)
      setAuthLoading(false)
      if (!uid) navigate("/signin", { replace: true })
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  // Load canvas
  useEffect(() => {
  if (!editor || !canvasId || !ownerId) return

  let cancelled = false

  ;(async () => {
    const saved = await loadCanvasDocument(ownerId, canvasId)

    if (cancelled) return

    if (!saved) {
      setCanvasMissing(true)
      return
    }

    editor.loadSnapshot(saved.document)
  })()

  return () => {
    cancelled = true
  }
}, [editor, canvasId, ownerId])


  // 💾 Save canvas with indicator
  useEffect(() => {
  if (!editor || !canvasId || !ownerId) return

  let timeout: number | undefined

  const unsubscribe = editor.store.listen(() => {
    setIsSaving(true)

    window.clearTimeout(timeout)
    timeout = window.setTimeout(async () => {
      await saveCanvasDocument(ownerId, {
        canvasId,
        document: editor.getSnapshot(),
        updatedAt: new Date().toISOString(),
        version: 1,
      })

      setIsSaving(false)
      setLastSavedAt(new Date())
    }, 500)
  })

  return () => {
    unsubscribe()
    window.clearTimeout(timeout)
  }
}, [editor, canvasId, ownerId])


  // Thumbnail generation
  useEffect(() => {
    if (!editor || !canvasId || !ownerId) return

    let timeout: number | undefined

    const unsubscribe = editor.store.listen(() => {
      window.clearTimeout(timeout)

      timeout = window.setTimeout(async () => {
        const shapes = editor.getCurrentPageShapes()
        if (!shapes.length) return

        const result = await editor.getSvgString(shapes)
        if (!result) return

        const { svg, width, height } = result
        const svgBlob = new Blob([svg], { type: "image/svg+xml" })
        const url = URL.createObjectURL(svgBlob)
        const img = new Image()

        img.onload = () => {
          const canvas = document.createElement("canvas")
          const targetWidth = 300
          const scale = targetWidth / width

          canvas.width = targetWidth
          canvas.height = height * scale

          const ctx = canvas.getContext("2d")
          if (!ctx) return

          ctx.fillStyle = "#fff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          updateCanvasThumbnail(ownerId, canvasId, canvas.toDataURL("image/png"))
          URL.revokeObjectURL(url)
        }

        img.src = url
      }, 800)
    })

    return () => {
      unsubscribe()
      window.clearTimeout(timeout)
    }
  }, [editor, canvasId, ownerId])

  // Agent setup
  useEffect(() => {
    if (!editor || !agent) return
    setAgent(agent)
    ;(window as any).editor = editor
    ;(window as any).agent = agent
  }, [agent, editor, setAgent])

  if (authLoading || !ownerId) return null

  // 🔥 Saving indicator UI
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 180,
        fontSize: 12,
        opacity: 0.7,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <span style={{ color: isSaving ? "#999" : "#16a34a" }}>
        {isSaving ? "● Saving…" : lastSavedAt ? "✓ Saved" : ""}
      </span>
    </div>
  )
}

export default App
