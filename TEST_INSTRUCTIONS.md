# Testing the Integrated Voice + Drawing System

## What Changed

### ✅ Backend (`api.py`)
- Now processes transcript through `conversation.py`'s `get_diagram_actions()`
- GPT converts natural language → structured drawing actions
- Actions written to `public/actions.json`

### ✅ Frontend (`App.tsx`)
- ChatPanel is now ENABLED (you'll see agent working on the right side)
- Polls `/actions.json` every 1 second
- Sends message to agent for processing

## How to Test

### Step 1: Restart API Server

**Stop the current `api.py` (Ctrl+C) and restart:**

```bash
cd /Users/aryankhandelwal/Desktop/webspatial-projects/StanfordXR_Hackathon/hackathon/chatbot
python api.py
```

### Step 2: Refresh Browser

Refresh the page at `http://localhost:5173`

You should now see:
- Canvas on the left
- **ChatPanel on the right** (showing agent activity)
- Purple mic button in top-left corner

### Step 3: Test Voice Command

1. **Click the mic button** (top-left, purple circle)
2. **Allow microphone permissions** when prompted
3. **Button turns RED** - start speaking
4. **Say something like:**
   - "Create a node called Authentication"
   - "Create a service node called API Gateway"
   - "Draw a database node called User Database"
5. **Click mic again to stop** - button turns YELLOW while processing
6. **Watch the api.py terminal:**
   - You should see: `Transcribed: [your words]`
   - Then: `GPT Actions: {...}` (the structured JSON)
7. **Watch the ChatPanel (right side):**
   - Agent processes the command
   - Shows what it's thinking/doing
8. **Watch the Canvas:**
   - Node should appear!

## Expected Flow

```
1. You speak → Mic records
2. Audio sent to api.py → Whisper transcribes
3. Transcript sent to GPT (conversation.py) → Structured actions
4. Actions written to public/actions.json
5. Frontend polls actions.json → Gets new message
6. Agent processes message → Draws on canvas
7. ChatPanel shows agent's work
```

## Troubleshooting

### Problem: No drawing appears

**Check api.py terminal:**
- Do you see `GPT Actions: {...}`?
- If not, GPT might have failed - check your OPENAI_API_KEY in `.env`

**Check browser console (F12):**
- Do you see `Sending voice prompt to agent: {...}`?
- Do you see any errors?

**Check ChatPanel:**
- Is it visible on the right?
- Does it show the agent processing?

### Problem: ChatPanel not visible

Make sure you're ON a canvas page (not the dashboard/signin).
The URL should be like: `http://localhost:5173/#/app/[some-id]`

### Problem: "Transcription failed" alert

The `api.py` server is not running. Start it!

## Example Commands to Try

- "Create three nodes: Frontend, Backend, and Database"
- "Make a service node called API Gateway"
- "Draw a user node"
- "Create edges connecting Frontend to Backend"
- "Add a label saying Hello World"

## Debug Tips

1. **Open browser console** (F12) - watch for messages
2. **Watch api.py terminal** - see transcription + GPT processing
3. **Check public/actions.json** - see what was written
4. **Watch ChatPanel** - see agent's thoughts