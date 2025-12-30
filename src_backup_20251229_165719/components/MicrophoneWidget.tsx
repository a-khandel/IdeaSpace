import { useState, useRef, useCallback, useEffect } from "react"

export function MicrophoneWidget() {
  const [isHovered, setIsHovered] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      // Send to api.py backend running on port 8789
      const transcribeUrl = 'http://localhost:8789/transcribe'

      console.log('🌐 Sending audio to:', transcribeUrl)

      const response = await fetch(transcribeUrl, {
        method: 'POST',
        body: formData,
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Response:', result)

      if (result.success && result.transcript) {
        console.log('📝 Transcribed:', result.transcript)
      } else {
        throw new Error('No transcript returned')
      }

    } catch (error) {
      console.error('❌ Error processing audio:', error)
      alert(`Transcription failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('✅ Microphone access granted!')
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('📊 Audio data received, size:', event.data.size)
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped, processing audio...')
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        console.log('🎵 Audio blob created, size:', audioBlob.size)
        await processAudio(audioBlob)
      }

      mediaRecorder.start()
      console.log('▶️ Recording started!')
      setIsListening(true)
    } catch (error) {
      console.error('❌ Error accessing microphone:', error)
      alert(`Could not access microphone: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const toggleRecording = useCallback(() => {
    console.log('🎤 Mic button clicked! isListening:', isListening)

    if (isListening) {
      console.log('🛑 Stopping recording...')
      stopRecording()
    } else {
      console.log('▶️ Starting recording...')
      startRecording()
    }
  }, [isListening, startRecording, stopRecording])

  const getButtonStyle = () => {
    if (isProcessing) {
      return {
        ...styles.button,
        background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
        transform: 'scale(1.1)',
      }
    }
    if (isListening) {
      return {
        ...styles.button,
        background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
        boxShadow: '0 0 30px rgba(255, 65, 108, 0.8)',
        transform: 'scale(1.15)',
      }
    }
    if (isHovered) {
      return { ...styles.button, ...styles.buttonHover }
    }
    return styles.button
  }

  return (
    <button
      style={getButtonStyle()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={toggleRecording}
      disabled={isProcessing}
      title={isProcessing ? 'Processing...' : isListening ? 'Click to stop recording' : 'Click to start recording'}
    >
      <svg
        width={isListening ? "20" : "16"}
        height={isListening ? "20" : "16"}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transition: 'all 0.2s ease' }}
      >
        <path
          d="M12 14C13.66 14 15 12.66 15 11V5C15 3.34 13.66 2 12 2C10.34 2 9 3.34 9 5V11C9 12.66 10.34 14 12 14Z"
          fill="currentColor"
        />
        <path
          d="M17 11C17 13.76 14.76 16 12 16C9.24 16 7 13.76 7 11H5C5 14.53 7.61 17.43 11 17.92V21H13V17.92C16.39 17.43 19 14.53 19 11H17Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: "2px solid #fff",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
    transition: "all 0.2s ease",
    zIndex: 99999,
    pointerEvents: "auto",
  },
  buttonHover: {
    transform: "scale(1.05)",
    boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
  },
}
