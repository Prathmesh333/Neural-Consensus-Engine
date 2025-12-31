

## Features

- **Parallel Expert Execution**: Agents run simultaneously for high performance.
- **Meta-Cognitive Synthesis**: A synthesizer agent resolves conflicts and highlights agreements/disagreements.
- **Interactive Process Graph**: Visual representation of the agentic workflow.
- **Agent Configuration**: Click on graph nodes to tune individual expert temperature and instructions via a pop-up modal.
- **Professional UI**: "Engine Dashboard" layout with a safe, flicker-free Dark Mode.

## Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **Google Gemini API Key(s)** (Get one from [Google AI Studio](https://aistudio.google.com/))

## Installation & Setup

### 1. Backend Setup (Python)

Navigate to the backend directory:
```bash
cd backend
```

Install the required Python packages:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with your API keys:
```env
# You can use the same key for all if you only have one
GOOGLE_API_KEY=your_primary_api_key
GEMINI_API_KEY_PRIMARY=your_primary_api_key
GEMINI_API_KEY_SECONDARY=your_secondary_api_key
GEMINI_API_KEY_TERTIARY=your_tertiary_api_key
```

Start the Backend Server:
```bash
# Ensure you are in the root directory or adjust path
python -m backend.main
```
The server will start at `http://localhost:8000`.

### 2. Frontend Setup (React/Vite)

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install Node dependencies:
```bash
npm install
```

Start the Development Server:
```bash
npm run dev
```
The frontend will typically run at `http://localhost:5173`.

## Usage Guide

1.  **Launch**: Ensure both Backend and Frontend terminals are running.
2.  **Access**: Open your browser to the URL shown in the Frontend terminal (usually `http://localhost:5173`).
3.  **Query**: Type a complex, multi-faceted question into the "Query Input" box (e.g., "Ethical and technical implications of brain-computer interfaces").
4.  **Configure (Optional)**: Click any node in the "Cognitive Engine" graph to adjust that specific agent's creativity or give it custom instructions for the run.
5.  **Generate**: Click the "Run Neural Consensus" button or press `Ctrl + Enter`.
6.  **Review**: Watch the consensus emerge, complete with detailed reasoning and a breakdown of agreements vs. disagreements.
