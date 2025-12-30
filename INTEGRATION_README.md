# Integrated Chatbot Application

This application combines the frontend from webspatial-visionos with the chatbot backend.

## Features

- ✅ Full tldraw canvas with agent integration
- ✅ Voice recording via microphone button
- ✅ Automatic transcription using Whisper
- ✅ Supabase authentication and database
- ✅ Multiple canvas support with dashboard
- ✅ Real-time saving

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install NPM Dependencies (Already Done)

```bash
npm install
```

### 3. Configure Environment Variables

Make sure your `.env` file has:

```env
OPENAI_API_KEY=your_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running the Application

You need to run TWO processes:

### Terminal 1: Start the Voice API Server

```bash
python api.py
```

This starts the HTTP server on `http://localhost:8789` that handles voice transcription.

### Terminal 2: Start the Frontend

```bash
npm run dev
```

This starts the Vite dev server on `http://localhost:5173`.

## How It Works

1. **Voice Recording**: Click the microphone button in the bottom-right corner
2. **Recording Active**: The button turns red while recording
3. **Stop Recording**: Click again to stop and process
4. **Transcription**: Audio is sent to the API server, transcribed using Whisper
5. **Agent Action**: Transcript is written to `public/actions.json`
6. **Canvas Update**: The app polls `actions.json` and sends commands to the agent

## Architecture

```
┌─────────────────────┐
│   Browser (Vite)    │
│  - React Frontend   │
│  - Tldraw Canvas    │
│  - Voice Recording  │
└──────────┬──────────┘
           │
           │ HTTP POST (audio)
           ▼
┌─────────────────────┐
│   api.py (Flask)    │
│  - Port: 8789       │
│  - Whisper Model    │
└──────────┬──────────┘
           │
           │ writes
           ▼
┌─────────────────────┐
│  actions.json       │
│  - message: "..."   │
└──────────┬──────────┘
           │
           │ polls every 1s
           ▼
┌─────────────────────┐
│   Agent (Worker)    │
│  - Processes cmds   │
│  - Updates canvas   │
└─────────────────────┘
```

## Backend Files

- `api.py` - HTTP server for voice transcription (NEW)
- `transcribe.py` - Original system mic recorder (still works)
- `conversation.py` - GPT-based action conversion (optional)

## Frontend Structure

- `src/` - Main application code
  - `components/` - React components including MicrophoneWidget
  - `lib/` - Supabase client
  - `storage/` - Database operations
  - `auth.tsx` - Authentication context
  - `Dashboard.tsx` - Canvas list
  - `SignIn.tsx` - Login page
  - `App.tsx` - Main canvas app

## Notes

- The microphone button only works when `api.py` is running
- Make sure to allow microphone permissions in your browser
- The original `transcribe.py` still works independently if you want keyboard-based recording
- All canvases are saved to Supabase automatically