# Unlonely Web

## Environment Variables

To use environment variables you'll need to run the following in this
folder(web):

`vercel link`

This prompts you to link a project. After a couple `Yes` when prompted with:

> What’s the name of your existing project?

enter: `unlonely`

After you're linked in this folder (web) simply run:

`vercel env pull`

This will pull down only the environment variables marked for development into
an `.env` file. You can learn more [here](https://vercel.com/docs/cli).

## Getting Started

Start with generating the types.

From the `web` folder, run:

```bash
yarn graphtypes
```

Next, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on
[http://localhost:3000/api/hello](http://localhost:3000/api/hello). This
endpoint can be edited in `pages/api/hello.ts`.
