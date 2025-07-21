# [Chessarena.ai](https://chessarena.ai)

**Chessarena.ai** is an open-source platform for exploring and benchmarking how large language models (LLMs) perform in chess. Rather than focusing on simple win/loss results, Chessarena.ai measures *move quality* and *game insight* providing uniquely meaningful feedback on how much AI models truly "understand" chess.

![ChessArena AI Demo](./public/images/chessarena.gif)

*See ChessArena AI in action - watch AI models battle it out with real-time move evaluation and scoring*

## 🚩 Why ChessArena?

Modern LLMs struggle to genuinely *win* at chess: most LLM-based games end in draws, and true chess mastery still eludes these models.  
That's why we score *move-by-move quality* and *insight* rather than simply tracking wins!

## 🎯 How Move Evaluation Works

Every single move played by an LLM is immediately:

- Evaluated by [Stockfish](https://stockfishchess.org/), the strongest open-source chess engine.
- Compared to Stockfish's recommended best move.
- The difference ("move swing") is recorded in *centipawns*.
    - If the move swing is **>100 centipawns**, we count it as a blunder.

This system produces a leaderboard rewarding the most insightful and accurate play, rather than luck or brute force.

## 🏆 Features

## Demo Video
Click the image below to watch the demo:

[![Project Demo](https://img.youtube.com/vi/lbndv3hybJ8/maxresdefault.jpg)](https://youtu.be/lbndv3hybJ8 "Click to watch the demo")

- **LLM Chess Leaderboard:** See how multiple language models compare, move-by-move.
- **Real-Time Streaming:** Built on Motia Streams, every move and score updates live.
- **Open-Source, Event-Driven:** Built with [Motia](https://motia.dev/) for easy customization, real-time features, and code-first clarity.

## 🚀 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PNPM](https://pnpm.io/)
- [Python 3.x](https://www.python.org/)
- [Stockfish Chess Engine](https://stockfishchess.org/)

### Step 1: Clone and Install Dependencies

```bash
git clone https://github.com/MotiaDev/chessarena-ai.git
cd chessarena-ai
pnpm install
```

### Step 2: Install Stockfish

#### Option A: Using Homebrew (macOS - Recommended)
```bash
brew install stockfish
```

#### Option B: Using the project installer
```bash
pnpm install-stockfish <platform>
```
Supported platforms:
- `linux-x86`
- `mac-m1`

#### Option C: Manual Installation
Download directly from [stockfishchess.org](https://stockfishchess.org/) and install according to your platform's instructions.

### Step 3: Install Python Dependencies

Install Python dependencies for Motia integration:

```bash
npx motia install
```

### Step 4: Environment Configuration

#### API Configuration
1. Copy the environment template:
```bash
cp api/.env.sample api/.env
```

2. Edit `api/.env` and configure the following variables:

```bash
# AI Model API Keys (add your actual keys)
OPENAI_API_KEY=sk-proj-your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Stockfish Configuration
STOCKFISH_BIN_PATH=/opt/homebrew/opt/stockfish/bin/stockfish  # macOS Homebrew path
# STOCKFISH_BIN_PATH=/usr/local/bin/stockfish                # Linux path
# STOCKFISH_BIN_PATH=/path/to/your/stockfish                 # Custom path
```

#### App Configuration
1. Copy the app environment template:
```bash
cp app/.env.sample app/.env
```

2. The default configuration should work for local development:
```bash
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=ws://localhost:3000
```

### Step 5: Get Your API Keys

To use the AI models, you'll need API keys from:

- **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Google Gemini**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Anthropic**: Get your API key from [Anthropic Console](https://console.anthropic.com/)

Add these keys to your `api/.env` file.

## 🏃 Running ChessArena.AI

### Development Mode

**Start both API and app together:**
```bash
pnpm dev
```

**Or run them separately:**
```bash
# Terminal 1 - API Server
pnpm api

# Terminal 2 - Frontend App
pnpm app
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000

## 🔧 Troubleshooting

### Common Issues

**Stockfish not found error:**
- Verify Stockfish is installed: `stockfish` (should open Stockfish in terminal)
- Check your `STOCKFISH_BIN_PATH` in `api/.env`
- On macOS with Homebrew: `/opt/homebrew/opt/stockfish/bin/stockfish`
- On Linux: usually `/usr/local/bin/stockfish` or `/usr/bin/stockfish`

**Python dependencies issue:**
- Ensure Python 3.x is installed
- Try running `npx motia install` again
- Check if you have proper permissions for Python package installation

**API key errors:**
- Verify your API keys are correctly set in `api/.env`
- Make sure there are no extra spaces or quotes around the keys
- Check that your API keys are valid and have sufficient credits

### Platform-Specific Notes

**macOS:**
- Use Homebrew for easiest Stockfish installation
- Stockfish path is typically `/opt/homebrew/opt/stockfish/bin/stockfish`

**Linux:**
- Install Stockfish via package manager: `sudo apt-get install stockfish`
- Path is usually `/usr/bin/stockfish` or `/usr/local/bin/stockfish`

**Windows:**
- Download Stockfish binary from the official website
- Set the full path to the executable in your `.env` file

## 📝 License

This project is licensed under GPL-3.0-or-later. See [LICENSE](LICENSE) for details.

## 🤝 Contributors & Community

ChessArena.AI is built on [Motia Framework](https://motia.dev/)  
- Your contributions and ideas are very welcome!
- Join us on [Discord](https://discord.com/invite/nJFfsH5d6v)
- Star us on [GitHub](https://github.com/MotiaDev/chessarena-ai)

## 📚 Third-Party Licenses

- [Chessground](https://www.npmjs.com/package/chessground) (GPL-3.0)
- [chess.js](https://www.npmjs.com/package/chess.js) (BSD-2-Clause)
- Assets from [nibbler](https://github.com/rooklift/nibbler)

> **Inspired by the mission and evaluation approach of [Chessarena.ai](https://www.chessarena.ai/about) and powered by Motia Framework.**
