import * as dotenv from "dotenv";

/* eslint-disable no-console */
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

import { getContext } from "./context";
import graphqlSchema from "./entities/graphqlSchema";

const app = express();
app.use(cors(), bodyParser.json());

const result = dotenv.config()

app.get("/", (_, res) => res.sendStatus(200));

const startServer = async () => {
  const apolloServer = new ApolloServer({
    schema: graphqlSchema,
    context: getContext,
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });
  app.listen(process.env.PORT || 4000, () =>
    console.info(`Server started on port ${process.env.PORT || 4000}`)
  );
};

startServer();
