import "reflect-metadata";
import http from "http";

import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";

import { getContext } from "./context";
import graphqlSchema from "./entities/graphqlSchema";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (_, res) => res.sendStatus(200));

// Define a route to handle incoming webhook data
app.post("/livepeer-webhook", (req, res) => {
  const payload = req.body;
  console.log("Received livepeer webhook data:", payload);
  // Handle the webhook data here
  res.sendStatus(200);
});

const startServer = async () => {
  const apolloServer = new ApolloServer({
    schema: graphqlSchema,
    context: getContext,
    introspection: process.env.INTROSPECTION ? true : false,
  });

  await apolloServer.start();

  // Apply Apollo middleware to the Express app
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  // Create an HTTP server using the Express app
  const httpServer = http.createServer(app);

  // force redeploy

  httpServer.listen(process.env.PORT || 4000, () =>
    console.info(`Server started on port ${process.env.PORT || 4000}`)
  );
};

startServer();
