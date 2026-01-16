# IdeaSpace  
### _Put your thoughts on the whiteboard!_

---

##Detailed Documentation
https://smiling-cap-7e6.notion.site/IdeaSpace-Brainstorming-Out-Loud-in-3D-with-AI-2dfdf2206e458012bfb3c211ab54f101

## Overview  
IdeaSpace transforms **spoken commands** into **real-time whiteboard diagrams**, automatically generating shapes, workflows, and structured layouts.  
Powered by a **Python backend**, a **React + Tldraw frontend**, and **OpenAI real-time models**, the system listens to your voice, interprets it, and produces clean diagrams instantly.

---

## Features  
-  **Real-Time Speech → Diagram** — Speak your ideas and watch them appear on the board.  
-  **AI-Generated Workflow** — Turns natural language into connected flowchart elements.  
-  **React + Tldraw Frontend** — Smooth, intuitive drawing interface.  
-  **Python Backend** — Handles AI requests, websockets, and communication.  
-  **OpenAI Real-Time API** — Intelligent layout and shape generation.  
-  **Modular Codebase** — Easily extendable for new shapes and features.
-  **Suggestions Box -Analyzes your drawing, suggests improvements, and—if the user approves—automatically adds those enhancements to the drawing.

---

## Technologies Used  

### Frontend
- **React.js** — Component-based UI framework  
- **Vite** — Fast bundler and dev server  
- **Tldraw** — Interactive drawing tools + shape system  
- **JavaScript (ES6+)**  
- **CSS3 / HTML5**  

### Backend
- **Python** — Server runtime  
- **Express.js** — Routing + middleware  
- **WebSockets (`ws`)** — Real-time streaming  
- **dotenv** — Environment variable management  

### AI / Machine Learning
- **OpenAI GPT-4o / GPT-4.1 Realtime** — Diagram reasoning + layout  
- **OpenAI Speech Recognition** — Converts microphone audio to text  
- **Streaming AI Architecture** — For real-time shape generation  

### Tooling
- **Git / GitHub**  
- **npm**  
- **Postman / Thunder Client** (optional)  
- **ESLint / Prettier** (optional)
- **Visual Studio Code**
---

# Installation Instructions

# 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/ideaspace.git
cd IdeaSpace
```

# 2️⃣ (Terminal 1)Create or edit this file in the root folder: .dev.vars

```bash
ANTHROPIC_API_KEY=your_api_key
```
create a .env file in the root

```bash
OPENAI_API_KEY=your_api_key
VITE_SUPABASE_URL=URL
VITE_SUPABASE_ANON_KEY=ANON_KEY
```
Start backend

```bash
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 api.py

```

# 3️⃣ (Terminal 2) Start worker

```bash
npm run dev:worker
```

# 4️⃣ (Terminal 3) Frontend Setup (XR/Simulator)

```
2. Start the Frontend server
```bash
cd Ideaspace
npm install
XR_ENV=avp npm run dev

```

# 5️⃣ (Terminal 4) Run WebSpatial Builder

```bash
npx webspatial-builder run --base=http://localhost:5173/

```

Usage Instructions:

- Ensure all four terminals are running
- Open the WebSpatial preview window
- Click the microphone button
- Speak commands such as:
- "Create a box labeled Backend"
- "Add a circle labeled API"
- "Draw an arrow from Backend to API"
- Watch IdeaSpace generate diagrams in real time ✨

# Contributing Guidelines

Contributions are welcome!

***Steps to contribute:***
1. Fork the repo
2. Create a Branch
```bash
git checkout -b feature-name
```
3. Commit your changes:
```bash
git commit -m "Add feature"
```
4. Push your branch
5. Open a Pull Request

Please keep PRs small, focused, and well-documented.

## License Information

This project is licensed under the ***MIT License.***

## Contact Information  

**Waheed Khan**  
- GitHub: https://github.com/waheedcan  
- Email: wahkha432@gmail.com  

**Aryan Khandelwal**  
- GitHub: https://github.com/a-khandel  
- Email: aryan.khandelwal.pro@gmail.com  

**Parsh Gandhi**  
- GitHub: https://github.com/parshg  
- Email: parsh.gandhi22@gmail.com  

**Madhu Vijaya Kumar**  
- GitHub: https://github.com/mvk05  
- Email: bvkmadhu22@gmail.com

## Acknowledgements
- OpenAI for real-time speech + diagram reasoning
- Tldraw for the collaborative whiteboard engine
- Whisper for high-accuracy real-time speech recognition
