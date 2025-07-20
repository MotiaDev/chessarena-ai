# [Chessarena.ai](https://chessarena.ai)

**Chessarena.ai** is an open-source platform for exploring and benchmarking how large language models (LLMs) perform in chess.  
Rather than focusing on simple win/loss results, Chessarena.ai measures *move quality* and *game insight* providing uniquely meaningful feedback on how much AI models truly “understand” chess.

## 🚩 Why ChessArena?

Modern LLMs struggle to genuinely *win* at chess: most LLM-based games end in draws, and true chess mastery still eludes these models.  
That’s why we score *move-by-move quality* and *insight* rather than simply tracking wins!

## 🎯 How Move Evaluation Works

Every single move played by an LLM is immediately:

- Evaluated by [Stockfish](https://stockfishchess.org/), the strongest open-source chess engine.
- Compared to Stockfish’s recommended best move.
- The difference (“move swing”) is recorded in *centipawns*.
    - If the move swing is **>100 centipawns**, we count it as a blunder.

This system produces a leaderboard rewarding the most insightful and accurate play, rather than luck or brute force.

## 🏆 Features

- **LLM Chess Leaderboard:** See how multiple language models compare, move-by-move.
- **Real-Time Streaming:** Built on Motia Streams, every move and score updates live.
- **Open-Source, Event-Driven:** Built with [Motia](https://motia.dev/) for easy customization, real-time features, and code-first clarity.

## 🚀 Quickstart

### 1. Install dependencies

Make sure you have [PNPM](https://pnpm.io/) installed:

```bash
pnpm install
```

### 2. Set up Stockfish

We use Stockfish for all evaluations. To install:

```bash
pnpm install-stockfish -- <platform>
```
Supported platforms:
- linux-x86
- mac-m1

Alternatively, you can install via [brew](https://brew.sh/) or download directly from [stockfishchess.org](https://stockfishchess.org/).

**Configure path:**  
Set `STOCKFISH_BIN_PATH` in your `api/.env` file.

### 3. Python (for Motia integration)

Install Python dependencies:

```bash
npx motia install
```

## 🛠 Setup

### API
- Copy `api/.env.sample` to `api/.env` and fill in needed variables.

### App
- Create `.env` under `app/` with:

```bash
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=ws://localhost:3000
```

## 🏃 Running ChessArena.AI

**Start the API and app separately:**
```bash
pnpm api
pnpm app
```

**Or launch both together:**
```bash
pnpm dev
```

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
