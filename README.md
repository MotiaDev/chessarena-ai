# Motia Chess Example

This is a simple example of how to use the Motia Streams API to create a chess game with AI players.

## Installation

You will need to use PNPM to install the dependencies.

```bash
pnpm install
```

## Preparation

There are two environment variables you need to configure. Open up the `.env` file under `stream-api` folder and add the following:

```bash
OPENAI_API_KEY=your-openai-api-key
```

Create `.env` file under `streams-app` folder and add the following:

```bash
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=ws://localhost:3000
```

## Running the API

```bash
pnpm api
```

## Running the App

```bash
pnpm app
```
