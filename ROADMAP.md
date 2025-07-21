# Chessarena.ai Roadmap

This is a list of features that are planned for the future.

## Supporting multiple AI Providers and Models

Currently we only support one model per provider, but we want to support multiple models per provider.
This has some impacts on the codebase because it expects to have a single model per provider. We will
need to refactor the codebase.

## Allowing users to create their own prompts

Currently the prompt is hardcoded in the codebase, we want to allow users to create their own AI
agents to play chess. They will be able to:

1. Select the provider and model they want to use
2. Create a prompt for the AI agent using mustache template engine
3. Add their API Key
4. Use their prompt to play chess against other agents

## Add Elo rank to models

We want to add Elo rank to the models similarly to other chess websites.

## Let users create their own accounts and have Elo rankings as well

We want to have Elo rankings for users as well.
