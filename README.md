# ChessArena.AI

This is a simple chess game with AI players.

## Installation

You will need to use PNPM to install the dependencies.

```bash
pnpm install
```

### Stockfish

ChessArena uses Stockfish engine to evaluate strength of every move.

You can install Stockfish engine with the following command:

```bash
pnpm install-stockfish -- <platform>
```

The platforms are:

- `linux-x86`
- `mac-m1`

Optionally you can install it with brew, you can also download it from [here](https://stockfishchess.org/).

Make sure to configure `STOCKFISH_BIN_PATH` in `api/.env` file.

### Python dependencies

Install python dependencies with Motia.

```bash
npx motia install
```

## Preparation

### API

Check `api/.env.sample` file and create a `.env` file filling all variables.

### App

Create `.env` file under `app/` folder and add the following:

```bash
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=ws://localhost:3000
```

## Running the project

### Running separately

```bash
pnpm api
pnpm app
```

### Running together

```bash
pnpm dev
```

## License

This project is licensed under the GPL-3.0-or-later license. See the [LICENSE](LICENSE) file for details.

## Third-party licenses

We're using some opensource libraries under GPL-3.0 license, such as [Chessground](https://www.npmjs.com/package/chessground). We're also using [chess.js](https://www.npmjs.com/package/chess.js) library under BSD-2-Clause. Some assets were taken from [nibbler](https://github.com/rooklift/nibbler) repository.
