# Unlonely

This is the monorepo for the Unlonely project.

It contains 5 packages:

- `blockchain` contains the smart contract code
- `web` contains the Next.js web project
- `server` contains the GraphQL schema and scripts for interacting with postgres

## Environment Variables

To use environment variables you'll need to run the following in the folder you
using(web, blockchain, etc.):

`vercel link`

This prompts you to link a project. After a couple `Yes` when prompted with:

> What’s the name of your existing project?

enter: `unlonely-alpha`

After you're linked in each folder (web, blockchain, etc) simply run:

`vercel env pull`

This will pull down only the environment variables marked for development into
an `.env` file. You can learn more [here](https://vercel.com/docs/cli).
