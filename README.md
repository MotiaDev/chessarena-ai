# Motia Streams Example

This is a simple example of how to use the Motia Streams API to create a chatbot.

## Installation

You will need to use PNPM to install the dependencies.

```bash
pnpm install
```

## Preparation

There are two environment variables you need to configure. Open up the `.env` file under `stream-api` folder and add the following:

```bash
OPENAI_API_KEY=your-openai-api-key
OPENAI_ASSISTANT_ID=your-openai-assistant-id
```

To get the assistant ID you need to create an assistant in [OpenAI Dashboard](https://platform.openai.com/assistants). Make sure to be logged in before you click on the link.

## Running the API

```bash
pnpm api
```

## Running the App

```bash
pnpm app
```
