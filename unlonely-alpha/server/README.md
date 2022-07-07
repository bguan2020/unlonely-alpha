# GraphQL Server Setup

This is **a GraphQL server with TypeScript** based on
[Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client),
[apollo-server](https://www.apollographql.com/docs/apollo-server).

## Getting started

### Install npm dependencies:

```
yarn install
```

### Setup DB

**Download Docker and Install **

- mac https://docs.docker.com/desktop/mac/install/
- make sure docker is running
- cd into the backend folder `/server`
- run command `docker compose up -d`
- run `docker ps` to make sure a postgresql db is listed as running

**Setup Local DB**

**skip if you're using the docker instructions above**

Set up your local server:

Download Postgresapp from https://postgresapp.com/ to run Postgres locally.

Once installed create a superuser called `unlonelyadmin` using the terminal
command:

Or, alternatively, with the `psql` command:

```
CREATE ROLE unlonelyadmin WITH LOGIN SUPERUSER
```

### 2. Creations and Migrations of database

To apply the migrations to your database, and set up the database if it does not
already exist, run:

```
yarn prisma migrate dev
```

Now, seed the database with the sample data in
[`prisma/seed.ts`](./prisma/seed.ts) by running the following command:

```
yarn prisma db seed
```

### 3. Start the GraphQL server

Launch your GraphQL server with this command:

```
yarn dev
```

Navigate to [http://localhost:4000](http://localhost:4000) in your browser to
explore the API of your GraphQL server in a
[GraphQL Playground](http://localhost:4000/graphql).
