"""
Minimal HTTP API for browser-based voice recording.
Uses the same Whisper model and writes to the same actions.json as transcribe.py
Run this with: python api.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
from conversation import get_diagram_actions, get_suggestions
import os
import tempfile
import json
import time

app = Flask(__name__)
CORS(app)

# Same Whisper model as transcribe.py
model = WhisperModel("small.en", device="cpu", compute_type="int8")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        if 'audio' not in request.files:
            return jsonify({'success': False, 'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']

        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name

        try:
            # Check if file has content
            file_size = os.path.getsize(temp_path)
            if file_size < 100:  # Less than 100 bytes is likely invalid
                return jsonify({'success': False, 'error': 'Audio file is too small or empty'}), 400

            # Transcribe (same method as transcribe.py)
            try:
                segments, _ = model.transcribe(
                    temp_path,
                    language="en",
                    beam_size=1
                )
                full_text = " ".join([s.text for s in segments]).strip()
                print(f"Transcribed: {full_text}")
            except Exception as e:
                # If transcription fails, return error instead of crashing
                print(f"Transcription failed: {e}")
                return jsonify({'success': False, 'error': 'Invalid audio data - please try recording again'}), 400

            # Process through GPT to get diagram actions (using conversation.py)
            try:
                actions = get_diagram_actions(full_text)
                print(f"GPT Actions: {actions}")

                # Write actions to actions.json
                out = {
                    "id": int(time.time() * 1000),
                    "message": full_text,
                    "actions": actions
                }
            except Exception as e:
                print(f"GPT processing failed, using raw message: {e}")
                # Fallback to just the message
                out = {
                    "id": int(time.time() * 1000),
                    "message": full_text
                }

            with open("public/actions.json", "w") as f:
                json.dump(out, f, indent=2)

            print("Wrote public/actions.json")

            return jsonify({'success': True, 'transcript': full_text})

        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/process', methods=['POST', 'OPTIONS'])
def process():
    if request.method == 'OPTIONS':
        # Handle CORS preflight
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'success': False, 'error': 'No text provided'}), 400

        # Process through GPT to get diagram actions
        try:
            actions = get_diagram_actions(text)
            print(f"GPT Actions: {actions}")

            return jsonify({
                'success': True,
                'actions': actions,
                'transcript': text
            })
        except Exception as e:
            print(f"GPT processing failed: {e}")
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/suggestions', methods=['POST', 'OPTIONS'])
def suggestions():
    if request.method == 'OPTIONS':
        # Handle CORS preflight
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    try:
        # Get context from request (optional)
        data = request.get_json() or {}
        context = data.get('context', '')

        # Use OpenAI to generate dynamic suggestions
        suggestions_list = get_suggestions(context)
        print("Suggestions generated:", suggestions_list)

        return jsonify({
            'success': True,
            'suggestions': suggestions_list
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    os.makedirs('public', exist_ok=True)
    print("\n" + "="*60)
    print("  Voice Recording API")
    print("="*60)
    print("  Endpoint: http://localhost:8789/transcribe")
    print("  Health:   http://localhost:8789/health")
    print("="*60 + "\n")
    app.run(host='0.0.0.0', port=8789, debug=False)