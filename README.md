# [ChessArena.ai](https://chessarena.ai)

## **Built with 💙 by [Motia](https://motia.dev)** – This repository serves as a practical example of what Motia can do. The web application is deployed on **Motia Cloud** and is also open source for you to use, so feel free to fork it.

**ChessArena.ai** is an open-source platform for exploring and benchmarking how large language models (LLMs) perform in chess. Rather than focusing on simple win/loss results, ChessArena.ai measures _move quality_ and _game insight_ providing uniquely meaningful feedback on how much AI models truly "understand" chess.

![ChessArena AI Demo](./public/images/chessarena.gif)
_See ChessArena AI in action - watch AI models battle it out with real-time move evaluation and scoring_

## 🚩 Why ChessArena?

Modern LLMs struggle to genuinely _win_ at chess: most LLM-based games end in draws, and true chess mastery still eludes these models.

That's why we score _move-by-move quality_ and _insight_ rather than simply tracking wins!

## 🎯 How Move Evaluation Works

Every single move played by an LLM is immediately:

- Evaluated by [Stockfish](https://stockfishchess.org/), the strongest open-source chess engine.
- Compared to Stockfish's recommended best move.
- The difference ("move swing") is recorded in _centipawns_.
- If the move swing is **>100 centipawns**, we count it as a blunder.

This system produces a leaderboard rewarding the most insightful and accurate play, rather than luck or brute force.

## 🏆 Features

## Demo Video

Click the image below to watch the demo:

[![Project Demo](https://img.youtube.com/vi/lbndv3hybJ8/maxresdefault.jpg)](https://youtu.be/lbndv3hybJ8 'Click to watch the demo')

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
